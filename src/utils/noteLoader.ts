import notesIndexJson from '../data/notes-index.json';
import type {
  DerivedChapter,
  DerivedSubject,
  NoteHeading,
  StaticNoteMeta,
} from '../types/note';

export interface SanitizedNoteContent {
  html: string;
  headings: NoteHeading[];
  wordCount: number;
  readTimeMinutes: number;
}

export interface LoadedNoteContent extends SanitizedNoteContent {
  url: string;
}

const STATIC_NOTES: StaticNoteMeta[] = notesIndexJson as StaticNoteMeta[];
const noteHtmlCache = new Map<string, LoadedNoteContent>();

export function getAllNotes(): StaticNoteMeta[] {
  return STATIC_NOTES;
}

export function getNoteById(id: string): StaticNoteMeta | undefined {
  return STATIC_NOTES.find((note) => note.id === id);
}

export function getAdjacentNotes(
  id: string,
  notes: StaticNoteMeta[] = STATIC_NOTES
): { prev: StaticNoteMeta | null; next: StaticNoteMeta | null } {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? notes[index - 1] : null,
    next: index < notes.length - 1 ? notes[index + 1] : null,
  };
}

export function deriveSubjects(
  notes: StaticNoteMeta[] = STATIC_NOTES
): DerivedSubject[] {
  const map = new Map<
    string,
    {
      name: string;
      slug: string;
      noteCount: number;
      chapters: Set<string>;
      topics: Set<string>;
    }
  >();

  for (const note of notes) {
    const slug = note.subjectSlug.trim().toLowerCase();
    let entry = map.get(slug);
    if (!entry) {
      entry = {
        name: note.subject.trim(),
        slug,
        noteCount: 0,
        chapters: new Set(),
        topics: new Set(),
      };
      map.set(slug, entry);
    }
    entry.noteCount += 1;
    entry.chapters.add(note.chapterSlug.trim().toLowerCase());
    entry.topics.add(
      `${note.chapterSlug.trim().toLowerCase()}::${note.topic.trim().toLowerCase()}`
    );
  }

  return Array.from(map.values())
    .map((item) => ({
      name: item.name,
      slug: item.slug,
      noteCount: item.noteCount,
      chapterCount: item.chapters.size,
      topicCount: item.topics.size,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function deriveChapters(
  notes: StaticNoteMeta[] = STATIC_NOTES,
  subjectSlug?: string
): DerivedChapter[] {
  const targetSubject = subjectSlug?.trim().toLowerCase() ?? '';
  const map = new Map<
    string,
    {
      name: string;
      slug: string;
      subject: string;
      subjectSlug: string;
      topics: Set<string>;
      notes: StaticNoteMeta[];
    }
  >();

  for (const note of notes) {
    const sSlug = note.subjectSlug.trim().toLowerCase();
    if (targetSubject && sSlug !== targetSubject) {
      continue;
    }
    const cSlug = note.chapterSlug.trim().toLowerCase();
    const key = `${sSlug}::${cSlug}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        name: note.chapter.trim(),
        slug: cSlug,
        subject: note.subject.trim(),
        subjectSlug: sSlug,
        topics: new Set(),
        notes: [],
      };
      map.set(key, entry);
    }
    entry.topics.add(note.topic.trim().toLowerCase());
    entry.notes.push(note);
  }

  return Array.from(map.values())
    .map((item) => ({
      name: item.name,
      slug: item.slug,
      subject: item.subject,
      subjectSlug: item.subjectSlug,
      noteCount: item.notes.length,
      topicCount: item.topics.size,
      notes: item.notes,
    }))
    .sort((a, b) => {
      const subCmp = a.subject.localeCompare(b.subject);
      return subCmp !== 0 ? subCmp : a.name.localeCompare(b.name);
    });
}

export function resolveNoteUrl(
  filePath: string,
  baseUrl?: string
): string {
  const trimmed = filePath.trim();
  if (!trimmed) {
    throw new Error('Note file path is empty.');
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) || trimmed.startsWith('//')) {
    throw new Error(`External or protocol URLs are not permitted: ${trimmed}`);
  }
  const cleanPath = trimmed.replace(/^\/+/, '');
  const segments = cleanPath.split('/');
  if (segments.some((seg) => seg === '..' || seg === '.')) {
    throw new Error(`Invalid relative segment in note path: ${trimmed}`);
  }

  const rawBase =
    baseUrl !== undefined
      ? baseUrl
      : (typeof import.meta !== 'undefined' &&
          (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL) ||
        '/';
  const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${normalizedBase}${cleanPath}`;
}

export function isSpaFallbackHtml(rawHtml: string): boolean {
  const trimmed = rawHtml.trim();
  if (!trimmed) return false;
  return (
    /<div\s+id=["']root["']/i.test(trimmed) ||
    (/<!doctype\s+html>/i.test(trimmed) && /<script[^>]+type=["']module["']/i.test(trimmed))
  );
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');
}

function slugifyHeading(text: string, usedIds: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-') || 'section';
  let candidate = `sec-${base}`;
  let counter = 2;
  while (usedIds.has(candidate)) {
    candidate = `sec-${base}-${counter}`;
    counter += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

export function sanitizeNoteHtml(rawHtml: string): SanitizedNoteContent {
  let html = rawHtml;

  // Remove dangerous block elements and their contents
  const dangerousBlockTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'applet',
    'style',
    'form',
    'noscript',
    'template',
  ];
  for (const tag of dangerousBlockTags) {
    const blockRegex = new RegExp(
      `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,
      'gi'
    );
    html = html.replace(blockRegex, '');
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    html = html.replace(selfClosingRegex, '');
  }

  // Remove document-level metadata/head tags if accidentally included
  html = html.replace(/<\/?(?:html|head|body|meta|base|link|title)\b[^>]*>/gi, '');
  html = html.replace(/<!doctype[^>]*>/gi, '');

  // Strip inline event handlers (onClick, onload, onerror, etc.)
  html = html.replace(
    /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    ''
  );

  // Neutralize javascript:, vbscript:, or data:text/html URLs in href/src/action
  html = html.replace(
    /\b(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*'|(?:javascript|vbscript|data:text\/html)[^\s>]*)/gi,
    '$1="#"'
  );

  // Wrap tables in a scrollable container so tables retain full width on desktop
  html = html.replace(
    /<table\b([^>]*)>([\s\S]*?)<\/table>/gi,
    '<div class="note-table-wrap"><table$1>$2</table></div>'
  );

  // Inject deterministic IDs into headings and extract outline
  const usedIds = new Set<string>();
  const allHeadings: NoteHeading[] = [];

  html = html.replace(
    /<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tagName: string, attrs: string, inner: string) => {
      const level = Number(tagName.slice(1));
      const plainText = decodeBasicEntities(inner.replace(/<[^>]+>/g, ''))
        .replace(/\s+/g, ' ')
        .trim();

      const idMatch = attrs.match(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      let id = idMatch ? (idMatch[1] ?? idMatch[2] ?? '').trim() : '';
      let updatedAttrs = attrs;

      if (!id) {
        id = slugifyHeading(plainText, usedIds);
        updatedAttrs = `${attrs} id="${id}"`;
      } else {
        usedIds.add(id);
      }

      if (plainText) {
        allHeadings.push({ id, text: plainText, level });
      }

      return `<${tagName}${updatedAttrs}>${inner}</${tagName}>`;
    }
  );

  const sectionHeadings = allHeadings.filter((h) => h.level >= 2);
  const headings = sectionHeadings.length > 0 ? sectionHeadings : allHeadings;

  const plainBody = decodeBasicEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = plainBody ? plainBody.split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 180));

  return {
    html: html.trim(),
    headings,
    wordCount,
    readTimeMinutes,
  };
}

export function clearNoteCache(): void {
  noteHtmlCache.clear();
}


interface EmbeddedPyqRecord {
  k: string;
  q: string;
  o?: string[];
  a?: string;
  x?: string;
  y?: string;
  e?: string;
  s?: string;
  t?: string;
}

const PYQ_TITLES: Record<string, string> = {
  fundamentals: 'Network fundamentals, architecture and topologies',
  osi: 'OSI model and layered architecture',
  media: 'Transmission media, signals and switching',
  datalink: 'Data Link layer, MAC and error/flow control',
  devices: 'Network devices, Ethernet and WLAN',
  ip: 'IP addressing, IPv4/IPv6 and subnetting',
  routing: 'Routing and network-layer protocols',
  transport: 'Transport layer, TCP/UDP and ports',
  application: 'Application protocols and Internet services',
  wireless: 'Wireless, mobile and ad hoc networks',
  governance: 'Internet governance, standards and services',
  crypto: 'Cryptography and encryption algorithms',
  signatures: 'Hashing, certificates and digital signatures',
  security: 'Security principles, authentication and controls',
  malware: 'Malware, vulnerabilities and cyber attacks',
  cyberlaw: 'Cyber law, privacy, IPR and digital conduct',
  misc: 'Miscellaneous networking PYQs',
  'os-process': 'OS processes, threads, system calls and synchronization',
  'os-scheduling': 'CPU scheduling',
  'os-deadlocks': 'Deadlocks and resource allocation',
  'os-memory': 'Memory management, paging and virtual memory',
  'os-file': 'File systems and disk management',
  'os-linux': 'Linux, Unix and command-line concepts',
  'os-misc': 'Other Operating System PYQs',
  'digital-electronics': 'Digital Electronics and Number Systems',
  'computer-fundamentals': 'Computer Fundamentals and Architecture',
  dbms: 'Database Management Systems and SQL',
  algorithms: 'Data Structures and Design & Analysis of Algorithms',
  'software-engineering': 'Software Engineering',
  programming: 'Programming, OOP, C/C++, Java and Python',
  teaching: 'Teaching Methodology and Pedagogy',
  web: 'Web Technology, Internet Programming and .NET',
  business: 'Business, Accounting, Economics, E-Commerce and Knowledge Management',
  graphics: 'Computer Graphics, Multimedia and Mobile Computing',
  mis: 'MIS, DSS and Expert Systems',
  mathematics: 'Mathematics, Statistics and Discrete Mathematics',
  'other-cs': 'Other Computer Science and cross-topic PYQs',
};

function escapePyqHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function answerLabels(rawAnswer: string): string[] {
  return rawAnswer
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const normalized = part.toUpperCase();
      if (/^[1-4]$/.test(normalized)) {
        return String.fromCharCode(64 + Number(normalized));
      }
      return normalized;
    });
}

function renderPyqQuestion(question: EmbeddedPyqRecord, index: number): string {
  const options = (question.o ?? []).map((option) => option?.trim() ?? '');
  const hasOptions = options.some(Boolean);
  const labels = answerLabels(question.a ?? '');
  const answerText = labels.length
    ? labels.map((label) => {
        const optionIndex = 'ABCD'.indexOf(label);
        const optionText = optionIndex >= 0 ? options[optionIndex] : '';
        return optionText ? `${label}. ${escapePyqHtml(optionText)}` : label;
      }).join('; ')
    : 'Answer key not supplied in the workbook';

  const optionHtml = hasOptions
    ? `<ol type="A" class="pyq-options">${options.map((option) =>
        option
          ? `<li>${escapePyqHtml(option).replace(/\r?\n/g, '<br>')}</li>`
          : '<li><em>Option text not supplied in the source</em></li>'
      ).join('')}</ol>`
    : '<p class="pyq-source-note"><em>Options are not supplied in this source record.</em></p>';

  const metadata = [
    question.e ? escapePyqHtml(question.e) : '',
    question.y ? `Year: ${escapePyqHtml(question.y)}` : '',
    question.s ? escapePyqHtml(question.s) : '',
    question.t ? `Source topic: ${escapePyqHtml(question.t)}` : '',
  ].filter(Boolean).join(' · ');

  // Remove the single formula-like prefix found in the source workbook's question stem.
  // Render the remaining source text only after HTML escaping; never evaluate workbook content.
  const cleanStem = (question.q ?? '').replace(/^\s*'?\s*=\s*HYPERLINK\(\s*["'][^"']+["']\s*\)\s*[—–-]\s*/i, '');
  const stem = escapePyqHtml(cleanStem).replace(/\r?\n/g, '<br>');
  const explanation = question.x?.trim()
    ? escapePyqHtml(question.x).replace(/\r?\n/g, '<br>')
    : '<em>No explanation was supplied in the workbook.</em>';

  return `<li class="pyq-question" style="padding:14px 16px;margin:14px 0;border:1px solid #e4e7eb;border-radius:8px;background:#fff;">
    <p><strong>Question ${index + 1}.</strong> ${stem}</p>
    ${optionHtml}
    <p class="pyq-answer" style="background:#eff8e9;border-left:3px solid #78b65a;padding:9px 12px;margin:10px 0;"><strong>Answer key (workbook):</strong> ${escapePyqHtml(answerText)}${question.a ? ` <small>(source key: ${escapePyqHtml(question.a)})</small>` : ''}</p>
    <p class="pyq-explanation"><strong>Explanation:</strong> ${explanation}</p>
    ${metadata ? `<p class="pyq-metadata"><small>${metadata}</small></p>` : ''}
  </li>`;
}

async function hydratePyqPlaceholders(
  rawHtml: string,
  signal?: AbortSignal
): Promise<string> {
  if (!rawHtml.includes('<!-- PYQ:')) return rawHtml;

  const dataResponse = await fetch(
    resolveNoteUrl('notes/part-b-pyq-data.deflate.b64'),
    { signal, headers: { Accept: 'text/plain' } }
  );
  if (!dataResponse.ok) {
    throw new Error(`PYQ data could not be loaded (HTTP ${dataResponse.status}).`);
  }

  const encoded = (await dataResponse.text()).replace(/\s+/g, '');
  const compressed = Uint8Array.from(atob(encoded), (character) =>
    character.charCodeAt(0)
  );
  const compressedBuffer = compressed.buffer as ArrayBuffer;
  const decompressed = new Blob([compressedBuffer]).stream().pipeThrough(
    new DecompressionStream('deflate')
  );
  const records = JSON.parse(
    await new Response(decompressed).text()
  ) as EmbeddedPyqRecord[];

  const groups = new Map<string, EmbeddedPyqRecord[]>();
  for (const record of records) {
    const group = groups.get(record.k) ?? [];
    group.push(record);
    groups.set(record.k, group);
  }

    const classifyDigitalQuestion = (question: EmbeddedPyqRecord): string => {
      const text = ((question.q ?? '') + ' ' + (question.o ?? []).join(' ')).toLowerCase();
      if (/k-?map|minimi[sz]e|simplif(y|ied).*boolean|boolean function.*distributive|distributive law|order \(degree\)|degree.*function/.test(text)) return 'digital-kmap';
      if (/flip.?flop|multivibrator|counter|ripple counter|sequential circuit|shift register|complement output of the last stage|complemented output.*counts? down|counts? up.*complemented output|stores? one bit|stores? .*information|number of times.*event|event.*number of times/.test(text)) return 'digital-sequential';
      if (/multiplexer|demultiplexer|encoder|decoder|full adder|half adder|binary adder|addition and subtraction|combinational circuit|advantage of use of multiplexers|cascaded arrangement/.test(text)) return 'digital-combinational';
      if (/gray code|one bit changes|bcd adder/.test(text)) return 'digital-codes';
      if (/figure of merit|integrated circuits with complexities|logic family|rtl.*ecl|msi|ecl|propagation delay|integrated circuit/.test(text)) return 'digital-ic';
      if (/electric power|resistors? of|linearity error|controlled electronic switch|semiconductor/.test(text)) return 'digital-misc';
      return 'digital-gates';
    };

  const classifyDsaQuestion = (question: EmbeddedPyqRecord): string => {
    const q = (question.q ?? '').toLowerCase();
    const sourceTopic = (question.t ?? '').trim().toLowerCase();
    const pureDs = sourceTopic === 'data structures';
    const pureAlgo = sourceTopic === 'algorithms';

    if (!pureAlgo) {
      if (/linked list|singly|doubly|circular list/.test(q)) return 'ds-linked';
      if (/queue|first element.*inserted|first one.*removed/.test(q)) return 'ds-queue';
      if (/stack|postfix|prefix|infix|recursive calls|function call/.test(q)) return 'ds-stack';
      if (/heap/.test(q)) return 'ds-heap';
      if (/binary tree|binary search tree|avl|tree traversal|traversal of|post-order|pre order|in order|balancing factor|height of a tree/.test(q)) return 'ds-tree';
      if (/hash|collision|probing/.test(q)) return 'ds-hashing';
      if (/articulation point|graph|vertices|vertex|path-graph|degree 2/.test(q)) return 'ds-graph';
      if (/array|dimension|first dimension|second dimension|row/.test(q)) return 'ds-array';
    }



    if (!pureDs) {
      if (/binary search|linear search|search algorithm/.test(q)) return 'algo-searching';
      if (/sort|sorting|bubble|selection|quick|merge|radix|insertion sort/.test(q)) return 'algo-sorting';
      if (/complexity|running time|order of growth|asymptotic|big.?o|omega|theta|recurrence|efficiency|best case|worst case/.test(q)) return 'algo-complexity';
      if (/divide and conquer|greedy|dynamic programming|subset sum|backtracking|huffman|simplex|longest common subsequence|optimisation|optimization/.test(q)) return 'algo-design';
      if (/shortest path|minimum spanning|breadth.first|depth.first|graph traversal/.test(q)) return 'algo-graph';
      if (/flowchart|pseudo.?code|algorithm|definiteness|finiteness|effectiveness/.test(q)) return 'algo-fundamentals';
    }

    return pureDs ? 'ds-misc' : 'algo-misc';
  };


  const questionText = (question: EmbeddedPyqRecord): string =>
    ((question.q ?? '') + ' ' + (question.o ?? []).join(' ')).toLowerCase();

  const classifySoftwareEngineeringQuestion = (question: EmbeddedPyqRecord): string => {
    const text = questionText(question);
    if (/waterfall|linear sequential|linear-sequential|spiral|prototype|rapid application development|\brad\b|agile|incremental release|prescriptive model|process model/.test(text)) return 'se-models';
    if (/\bsrs\b|software requirements specification|requirement analysis|requirements analysis|feasibility|functional requirement|non.?functional requirement/.test(text)) return 'se-requirements';
    if (/black.?box|white.?box|boundary value|equivalence partition|recovery testing|stress testing|regression testing|integration testing|acceptance testing|unit testing|system test|test case|testing/.test(text)) return 'se-testing';
    if (/software quality|quality assurance|\bsqa\b|reliability|\bmttf\b|\bmttr\b|\brocof\b|software metric|time behaviour|resource behaviour/.test(text)) return 'se-quality';
    if (/maintenance|software patch|software update|configuration management|identify.*control.*audit.*modification/.test(text)) return 'se-maintenance';
    if (/pert chart|gantt chart|project management|project estimation|estimation technique|resource allocation|project planning|task list|schedule|cocomo|cost estimation|umbrella activities|framework activities|well understood application|experienced.*team/.test(text)) return 'se-project';
    if (/\bdfd\b|data flow diagram|flowchart|decision table|decision tree|structure chart|cohesion|coupling|modular|module|top.?down design|reverse engineering|design pattern|architecture design|program links|structured partitioning/.test(text)) return 'se-design';
    return 'se-misc';
  };

  const classifyGraphicsMobileQuestion = (question: EmbeddedPyqRecord): string => {
    const text = questionText(question);
    // Exclude the single unrelated Linux command question mis-tagged as Graphics & multimedia.
    if (/\\bgrep\\b|specified file and display those lines containing the pattern/.test(text)) return 'graphics-exclude';

    if (/mobile computing|mobile ip|mobile node|gsm|gprs|edge|\\blte\\b|\\bcdma\\b|\\bbts\\b|\\bhlr\\b|\\bvlr\\b|\\bcoa\\b|home agent|foreign agent|care.?of address|tunnel endpoint|handover|handoff|tdma|fdma|time division multiple access|frequency division multiple access|mobile agent|mobile operating system|haptic|cellular network|cellular system|mobile station|macro.?mobility|micro.?mobility|ad hoc mobility|manet|iot adoption|internet of things|wireless configuration|device configuration|wi.?fi|circuit.?switched system|packet.?switched system/.test(text)) {
      if (/gsm|gprs|edge|\\blte\\b|\\bcdma\\b|cellular generation|ascending order|data speed/.test(text)) return 'mobile-generations';
      if (/\\bbts\\b|\\bhlr\\b|\\bvlr\\b|base transceiver|home location register|visitor location register|mobile station|mobile switching|base station controller/.test(text)) return 'mobile-architecture';
      if (/mobile ip|mobile node|\\bcoa\\b|care.?of address|home agent|foreign agent|tunnel endpoint|tunnelling|tunneling/.test(text)) return 'mobile-ip';
      if (/handover|handoff|macro.?mobility|micro.?mobility|ad hoc mobility|manet|satellite network/.test(text)) return 'mobile-mobility';
      if (/tdma|fdma|time division multiple access|frequency division multiple access|code division|channel sharing/.test(text)) return 'mobile-access';
      if (/mobile operating system|android|ios|mobile agent/.test(text)) return 'mobile-platforms';
      return 'mobile-applications';
    }

    if (/sampling|quantization|nyquist|digitiz|digitis|sampled amplitude/.test(text)) return 'multimedia-digitization';
    if (/compression|mpeg|macroblock|bit rate|codec|lossless|lossy/.test(text)) return 'multimedia-compression';
    if (/audio|video|streaming|mp3|mpeg audio|synchroniz|frame rate|authoring|multimedia communication|multimedia application|virtual reality|\\bvr\\b|animation/.test(text)) return 'multimedia-audio-video';
    if (/png|jpeg|jpg|bmp|tiff|gif|image format|photoshop|clone stamp|scanner|brightness|contrast|colour depth|color depth|high color|palette image|\\bimage\\b/.test(text)) return 'graphics-images';
    if (/rgb|cmy|colour model|color model|\\bcmyk\\b/.test(text)) return 'graphics-colour';
    if (/clipping|liang.?barsky|cohen.?sutherland|region code/.test(text)) return 'graphics-clipping';
    if (/bezier|b.spline|spline|control points|interpolation methods/.test(text)) return 'graphics-curves';
    if (/solid model|solid modeling|surface model|surface modelling|surface modeling|z.buffer|visible surface|lighting|light source|rendering algorithm/.test(text)) return 'graphics-modelling';
    if (/translation|scaling|rotation|shearing|reflection|transformation|viewing pipeline|viewing transformation|viewport|window|animation effects/.test(text)) return 'graphics-transform';
    if (/crt|electron beam|random.scan|raster.scan|emissive display|immersive display|resolution|refresh rate|persistence|aspect ratio|display|pixel/.test(text)) return 'graphics-display';
    if (/graphics|rendering|visual|curve|image|colour|color|multimedia/.test(text)) return 'graphics-misc';
    return 'graphics-misc';
  };

  const classifyMisQuestion = (question: EmbeddedPyqRecord): string => {
    const text = questionText(question);
    if (/office automation|\boas\b|word processing|electronic filing|electronic mail|message switching|annual budgeting/.test(text)) return 'mis-oas';
    if (/decision support|\bdss\b|what.?if analysis|sensitivity analysis|model base/.test(text)) return 'mis-dss';
    if (/expert system|knowledge base|inference engine|knowledge engineer|forward chaining|backward chaining|knowledge management|tacit knowledge|explicit knowledge|\bkms\b/.test(text)) return 'mis-expert-km';
    if (/transaction processing|\btps\b|\boltp\b|batch processing|online transaction/.test(text)) return 'mis-tps-oltp';
    if (/management information system|\bmis\b|information quality|strategic information|tactical information|operational information|information system|external database/.test(text)) return 'mis-core';
    return 'mis-misc';
  };

  return rawHtml.replace(
    /<!--\s*PYQ:([a-z-]+)(?:\|([^|>]*))?(?:\|([a-z-]+))?\s*-->/g,
    (_marker, key: string, sourceTopic?: string, topicKey?: string) => {
      const topicFilter = (sourceTopic ?? '').trim();
      const allQuestions = groups.get(key) ?? [];
      let questions = topicFilter
        ? allQuestions.filter((question) => (question.t ?? '').trim().toLowerCase() === topicFilter.toLowerCase())
        : allQuestions;
      if (key === 'digital-electronics' && topicKey) {
        questions = questions.filter((question) => classifyDigitalQuestion(question) === topicKey);
      } else if (key === 'software-engineering' && topicKey) {
        questions = questions.filter((question) => classifySoftwareEngineeringQuestion(question) === topicKey);
      } else if (key === 'graphics' && topicKey) {
        questions = questions.filter((question) => classifyGraphicsMobileQuestion(question) === topicKey);
      } else if (key === 'mis' && topicKey) {
        questions = questions.filter((question) => classifyMisQuestion(question) === topicKey);
      } else if (topicKey) {
        questions = questions.filter((question) => classifyDsaQuestion(question) === topicKey);
      }
      if (questions.length === 0) return '';
      const baseTitle = PYQ_TITLES[key] ?? 'PYQs';
      const title = [topicFilter, topicKey ? topicKey.replace(/^(ds|algo)-/, '').replace(/-/g, ' ') : ''].filter(Boolean).join(' — ');
      const items = questions.map(renderPyqQuestion).join('');
      return `<div class="topic-pyq-highlight" style="background:#fff9db;border-left:4px solid #e6c84f;border-radius:6px;padding:12px 16px;margin:18px 0 22px;">
        <h3>PYQs — ${escapePyqHtml(title || baseTitle)} (${questions.length})</h3>
        <p><small>Full question, available options, answer key and workbook explanation are shown below. Missing source fields are explicitly marked.</small></p>
        <ol class="pyq-question-list">${items}</ol>
      </div>`;
    }
  );
}

export async function fetchNoteHtml(
  filePath: string,
  options: { signal?: AbortSignal; forceRefresh?: boolean } = {}
): Promise<LoadedNoteContent> {
  const url = resolveNoteUrl(filePath);

  if (!options.forceRefresh) {
    const cached = noteHtmlCache.get(url);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: 'text/html, text/plain;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Note file could not be loaded (HTTP ${response.status}): ${filePath}`
    );
  }

  const rawHtml = await response.text();
  if (!rawHtml.trim()) {
    throw new Error(`Note HTML file is empty: ${filePath}`);
  }
  if (isSpaFallbackHtml(rawHtml)) {
    throw new Error(`Note HTML file was not found at "${filePath}".`);
  }

  const hydratedHtml = await hydratePyqPlaceholders(rawHtml, options.signal);
  const sanitized = sanitizeNoteHtml(hydratedHtml);
  const result: LoadedNoteContent = {
    ...sanitized,
    url,
  };
  noteHtmlCache.set(url, result);
  return result;
}
