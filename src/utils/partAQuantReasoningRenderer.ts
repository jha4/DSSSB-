type PyqRow = [number, string, string, string, string, string, string, string[], string, string, string, string, string];

const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] as string).replace(/\r?\n/g, '<br>');

const topics = [
  'Number System',
  'Simplification',
  'HCF & LCM',
  'Alphabet / Letter Series',
  'Number Series',
  'Miscellaneous PYQs',
];

const theory: Record<string, string> = {
  'Number System': `
    <h3>Core ideas</h3>
    <ul>
      <li><b>Natural numbers:</b> 1, 2, 3, …; whole numbers include 0. Integers include negative numbers.</li>
      <li><b>Rational numbers:</b> expressible as p/q, q ≠ 0. A prime has exactly two positive factors; 1 is neither prime nor composite.</li>
      <li><b>Divisibility:</b> 2 (last digit even), 3/9 (digit sum), 4 (last two digits), 5 (last digit 0/5), 8 (last three digits), 10 (last digit 0), 11 (alternating digit-sum difference multiple of 11).</li>
      <li><b>Remainder:</b> N = dq + r, 0 ≤ r &lt; d. If several numbers leave the same remainder, the divisor divides their pairwise differences.</li>
      <li><b>Recurring decimals:</b> 0.\u0305a = a/9; 0.\u0305ab = ab/99. Convert recurring parts into fractions before operating.</li>
    </ul>
    <div class="key"><b>High priority:</b> digit-sum tests, divisibility by 8/11/36/88, prime numbers, number types and recurring-decimal conversion.</div>
    <h3>Fast checks</h3><ul><li>Divisible by 36 ⇢ divisible by both 4 and 9.</li><li>Divisible by 15 ⇢ divisible by both 3 and 5.</li><li>Divisible by 88 ⇢ test 8 and 11 separately.</li><li>For an unknown digit, write the exact divisibility condition before testing candidates.</li></ul>`,
  'Simplification': `
    <h3>BODMAS / order of operations</h3>
    <p>Brackets → Orders (powers/roots) → Division and Multiplication from left to right → Addition and Subtraction from left to right. Multiplication and division have equal precedence.</p>
    <h3>Fractions, decimals and roots</h3>
    <ul><li>For a/b ± c/d, use a common denominator. Division by a fraction means multiplication by its reciprocal.</li><li>Cancel common factors before multiplying. Convert recurring decimals to fractions before combining them.</li><li>aᵐ × aⁿ = aᵐ⁺ⁿ; aᵐ/aⁿ = aᵐ⁻ⁿ; (aᵐ)ⁿ = aᵐⁿ.</li><li>√a × √b = √(ab) for non-negative a,b. Extract perfect-square factors first.</li><li>Do not assume √(a²−b²)=a−b; simplify the expression correctly.</li></ul>
    <div class="key"><b>High priority:</b> left-to-right ×/÷, fraction-of operations, recurring decimals, exponent laws, perfect powers and surd identities.</div>`,
  'HCF & LCM': `
    <h3>Prime-factor method</h3><p>Write numbers as products of primes. HCF uses common primes with the <b>smallest powers</b>; LCM uses every prime with the <b>greatest powers</b>.</p>
    <h3>Essential identities</h3><ul><li>For two positive integers: <b>HCF × LCM = product of the numbers.</b></li><li>Greatest number dividing several numbers exactly = their HCF.</li><li>For a common remainder, the divisor divides all pairwise differences; take the HCF of differences and then check the remainder.</li><li>Repeating events coincide after the LCM of their intervals.</li></ul>
    <div class="key"><b>High priority:</b> prime powers, common-remainder questions, HCF×LCM identity and bells/repeating events.</div>
    <h3>Common traps</h3><ul><li>HCF cannot exceed the smallest input number.</li><li>For a common remainder r, the divisor divides differences, not necessarily the original numbers.</li><li>Check whether the initial coincidence at time zero is counted.</li></ul>`,
  'Alphabet / Letter Series': `
    <h3>Alphabet positions</h3><p>Use A=1, B=2, …, Z=26. For cyclic movement, wrap after Z (e.g. X+4 = B). Track positions from the right when asked.</p>
    <h3>Pattern method</h3><ol><li>Write each letter's alphabet position.</li><li>Compare each position independently across terms.</li><li>Test constant/alternating increments, increasing gaps, reverse order and wrap-around.</li><li>For letter-number clusters, solve letter columns and numeric component separately.</li></ol>
    <div class="key"><b>High priority:</b> independent letter columns, cyclic shifts, alternating patterns and combined letter-number sequences.</div>`,
  'Number Series': `
    <h3>Systematic pattern checklist</h3><ol><li>Find first differences; if irregular, find second differences.</li><li>Test multiplication/division and alternating operations.</li><li>Check squares, cubes, primes, factorials and powers.</li><li>Look for mixed rules such as ×2+1 or ×3−2.</li><li>For a wrong-term question, test every term against one consistent rule.</li><li>For digit-string questions, apply the exact local condition (preceding/following/adjacent).</li></ol>
    <div class="key"><b>High priority:</b> difference sequences, alternating operations, multiplication patterns, squares/cubes, wrong-term detection and digit-string counting.</div>
    <p><b>Shortcut:</b> Do not lock onto the first plausible rule. Verify it against every term and all answer options.</p>`,
  'Miscellaneous PYQs': `
    <p>These records were initially picked up by broad keyword matching, but their actual content belongs to other syllabus areas (speed–distance, ratio/variation, data interpretation, percentage/profit or non-verbal figure series). They are retained here instead of being mislabelled as one of the five requested topics.</p>
    <div class="key"><b>Study note:</b> These are useful Part A practice records, but they are excluded from the five-topic frequency ranking.</div>`,
};

const css = `
<style>
body{font:15px/1.62 system-ui,-apple-system,Segoe UI,sans-serif;color:#243044;background:#fff}
section{max-width:980px;margin:auto;padding:16px 18px 55px}
h1{font-size:1.85rem;line-height:1.2;color:#17243a}h2{font-size:1.35rem;margin:2em 0 .5em;padding-bottom:.35em;border-bottom:2px solid #e4eaf1;color:#1c3557}
h3{font-size:1.05rem;margin:1.1em 0 .4em;color:#263d5a}p{margin:.5em 0}li{margin:.25em 0}
.intro,.subtopic{background:#f5f8fc;border:1px solid #dce5ef;border-radius:8px;padding:12px 14px}
.key{background:#fff7cf;border-left:4px solid #e2bf43;padding:10px 13px;margin:12px 0;border-radius:4px}
.note{background:#eaf6e8;border-left:4px solid #79ae70;padding:10px 13px;margin:12px 0;border-radius:4px}
.nav{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}.nav a{background:#eef3fa;border:1px solid #d9e2ed;border-radius:16px;padding:4px 9px;text-decoration:none;color:#23476e;font-size:.85rem}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px}.stat{background:#f5f8fc;border:1px solid #e0e8f1;border-radius:7px;padding:9px}.stat b{display:block;font-size:1.35rem;color:#1e416b}
.pyq{border:1px solid #e6e1c7;border-radius:7px;margin:9px 0;background:#fffef7;overflow:hidden}.pyq summary{cursor:pointer;padding:10px 12px;background:#fff8d8;font-weight:600}
.pyq-body{padding:11px 14px}.qid{color:#705d17;font-size:.8rem;margin-right:7px}.options{padding-left:1.5rem}.options li{padding:4px 7px}.correct{background:#e6f4e4;border-left:3px solid #70a96b}.answer{background:#e9f5e7;border-left:4px solid #71a76b;padding:8px 10px}
.explanation{background:#f7fbf5;border:1px solid #dcebd8;padding:9px 11px;border-radius:5px}.warn{background:#fff0e7;border-left:3px solid #d78a57;padding:7px 10px;font-size:.9rem}
.meta,.muted{font-size:.8rem;color:#68778a}.meta{border-top:1px solid #e7eaf0;padding-top:7px;margin-top:9px}
table{border-collapse:collapse;width:100%;margin:10px 0;font-size:.9rem}th,td{border:1px solid #dce3eb;padding:7px 9px;text-align:left}th{background:#eef3f8}.high{background:#e7f4e4}.mid{background:#fff6d4}
@media(max-width:600px){section{padding:10px 12px 40px}h1{font-size:1.5rem}h2{font-size:1.2rem}}
</style>`;

const subAdvice = (topic: string): string => ({
  'Number Series': 'Check differences, ratios, alternating operations and special sequences; verify the rule against every term.',
  'Alphabet / Letter Series': 'Convert letters to positions and solve each column independently.',
  'HCF & LCM': 'Use HCF for greatest common divisor/common-remainder differences; use LCM for first common multiple/repeating events.',
  'Number System': 'Translate the condition into a divisibility, factorisation or number-property test before substituting digits.',
  'Simplification': 'Follow operation precedence exactly; simplify fractions and powers before multiplying.',
  'Miscellaneous PYQs': 'Use the matching quantitative/reasoning method; this question is outside the five requested focus topics.',
} as Record<string, string>)[topic] ?? '';

export function renderPartAQuantReasoningHtml(data: PyqRow[]): string {
  const count = (topic: string) => data.filter((r) => r[1] === topic).length;
  const pct = (topic: string) => (100 * count(topic) / data.length).toFixed(1);
  const questionCard = (r: PyqRow, index: number): string => {
    const [id, topic, subtopic, paper, sectionName, sourceTopic, question, options, answer, explanation, review, topicStatus, imageBased] = r;
    const optionHtml = options.map((option, i) => option ? `<li class="${'ABCD'[i] === answer ? 'correct' : ''}"><b>${'ABCD'[i]}.</b> ${esc(option)}${'ABCD'[i] === answer ? ' <b>✓ Workbook key</b>' : ''}</li>` : '').filter(Boolean).join('');
    const keyText = id === 273
      ? 'UNRESOLVED — workbook key A points to 52, but the explanation calculates 48; verify the original paper.'
      : answer ? `Option ${esc(answer)}${optionHtml ? '' : ' (option text missing from extraction)'}` : 'No answer key supplied';
    const inferred = topicStatus.startsWith('Inferred');
    const warnings = [
      imageBased.toLowerCase() === 'yes' ? '<p class="warn">Image/figure-dependent record: the extraction does not contain the complete visual/options.</p>' : '',
      inferred || review ? `<p class="warn">${esc(review || 'Topic inferred from question text')}. Check the original paper/source record.</p>` : '',
    ].join('');
    return `<details class="pyq" id="pyq-${id}"><summary><span class="qid">PYQ ${index} · Source row ${id}</span>${esc(paper || 'Paper/date not recorded')}</summary>
      <div class="pyq-body"><p><b>${esc(question)}</b></p>
      ${optionHtml ? `<ol class="options" type="A">${optionHtml}</ol>` : '<p class="warn">Option texts are not available in the extracted workbook.</p>'}
      <p class="answer"><b>Answer from workbook key:</b> ${keyText}</p>
      ${explanation ? `<div class="explanation"><b>Workbook explanation:</b><p>${esc(explanation)}</p></div>` : '<p class="warn">No explanation was supplied in the workbook.</p>'}
      ${warnings}<p class="meta">Section: ${esc(sectionName)} · Source topic: ${esc(sourceTopic || 'blank')} · Classification: ${inferred ? 'inferred' : 'existing topic label'}</p></div></details>`;
  };

  let html = css + '<section><h1>DSSSB TGT Part A — Quantitative Aptitude &amp; Reasoning Short Notes</h1>';
  html += '<div class="intro"><p><b>Coverage:</b> Number System, Simplification, HCF &amp; LCM, Alphabet/Letter Series and Number Series. Theory is syllabus-aligned. PYQ wording, paper labels, options, answer keys and explanations are reproduced from the uploaded workbook. Source row IDs refer to the workbook sheet.</p><p><b>Source caution:</b> Some Topic fields were blank and inferred from question content; some OCR text/options are incomplete. The answer shown is the workbook key unless a conflict is explicitly flagged. A key is not treated as independently verified when source fields conflict.</p></div>';
  html += '<div class="stats">' + topics.map((t) => `<div class="stat"><b>${count(t)}</b>${esc(t)}</div>`).join('') + '</div>';
  html += '<nav class="nav">' + topics.map((t) => `<a href="#${t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${esc(t)}</a>`).join('') + '</nav>';
  html += '<div class="note"><b>How to revise:</b> Read theory and shortcuts first, then open the PYQs immediately below the matching subtopic. Yellow marks priority concepts; green marks workbook-keyed answers; orange marks source limitations or review flags.</div>';
  html += '<h2 id="frequency-snapshot">PYQ frequency snapshot</h2><p>Counts below are records in the refined 139-record focus/misc set, not guaranteed independent exam appearances. The five requested topics contain 122 records; 17 cross-topic records are retained separately.</p>';
  html += '<table><thead><tr><th>Topic</th><th>Records</th><th>Share</th><th>Priority in this extract</th></tr></thead><tbody>';
  for (const t of topics) { const p = t === 'Number Series' || t === 'Simplification'; html += `<tr class="${p ? 'high' : 'mid'}"><td>${esc(t)}</td><td>${count(t)}</td><td>${pct(t)}%</td><td>${p ? 'High' : t === 'Number System' ? 'Moderate' : 'Targeted'}</td></tr>`; }
  html += '</tbody></table><p class="muted">Descriptive workbook frequency only; not an official DSSSB weightage or prediction guarantee.</p>';

  for (const topic of topics) {
    const topicRows = data.filter((r) => r[1] === topic);
    html += `<h2 id="${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${esc(topic)} <span class="muted">(${topicRows.length} PYQs)</span></h2>${theory[topic]}`;
    const subtopics = [...new Set(topicRows.map((r) => r[2]))];
    for (const sub of subtopics) {
      const subRows = topicRows.filter((r) => r[2] === sub);
      html += `<div class="subtopic"><h3>${esc(sub)} — ${subRows.length} PYQs</h3><p class="muted">${esc(subAdvice(topic))}</p></div>`;
      subRows.forEach((r, i) => { html += questionCard(r, i + 1); });
    }
  }

  html += '<h2 id="source-analysis">Detailed PYQ and syllabus analysis</h2>';
  html += '<h3>Workbook scope</h3><ul><li>Four relevant sections — Reasoning (160), Arithmetic (160), Arithmetical &amp; Numerical Ability (577), and General Intelligence &amp; Reasoning Ability (69): <b>966 records</b>.</li><li><b>646</b> records had a populated Topic field; <b>320</b> had a blank Topic field and were assigned provisional suggestions in the audit.</li><li>The initial five-focus audit selected 139 records. Content review separated clear speed/ratio/data-interpretation/profit/figure questions into Miscellaneous instead of mislabelling them.</li></ul>';
  html += '<h3>Most frequent suggested labels across all 966 records</h3><table><thead><tr><th>Topic label</th><th>Total</th><th>Existing</th><th>Inferred</th></tr></thead><tbody>';
  const allTopics = [['Time & Work',213,201,12],['Percentage',113,59,54],['Mensuration',71,56,15],['Pipes & Cisterns',62,62,0],['Number Series',50,43,7],['Time, Speed & Distance',50,37,13],['Simplification',43,14,29],['Numerical Techniques',27,27,0],['Number System',26,19,7],['Syllogism / Venn Diagram',24,0,24],['Ratio & Proportion',24,11,13],['Statistics',19,19,0],['Non-Verbal Reasoning',19,1,18],['Probability',19,19,0],['Coding-Decoding',17,10,7]];
  for (const r of allTopics) html += `<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`;
  html += '</tbody></table>';
  html += '<h3>Interpretation by focus topic</h3><ul><li><b>Number Series:</b> highest record count in the refined focus set. Practise arithmetic/mixed patterns, wrong-term detection and digit-string questions.</li><li><b>Simplification:</b> BODMAS, fractions, powers and surds appear. Ratio, speed, DI, percentage and profit questions were moved to Miscellaneous.</li><li><b>Number System:</b> divisibility, remainders, prime/factor properties, number types and recurring decimals appear.</li><li><b>HCF &amp; LCM:</b> common remainders, HCF×LCM identity, direct HCF and repeated-event LCM are represented.</li><li><b>Alphabet/Letter Series:</b> letter movement, cyclic shifts, multi-column clusters and letter-number patterns appear.</li></ul>';
  html += '<h3>Syllabus coverage gaps and lower-evidence areas</h3><p>The supplied syllabus explicitly names simplification/BODMAS, fractions, decimals, surds/powers, divisibility, remainders, HCF-LCM, Number System, alphabet/letter series and number series. The extract has examples for each broad area, but not every subskill is well represented. Formal prime-factorisation drills and a wide variety of surd forms have thinner evidence in this selected set. “Not seen” at subtopic level means not clearly represented in these selected records, not proof that it will not appear.</p>';
  html += '<h3>Source quality and answer-key limitations</h3><ul><li>320/966 rows had blank Topic labels; inferred classifications remain provisional.</li><li>Some records have incomplete option fields or OCR artefacts. Image-dependent questions may not be reconstructable from text alone.</li><li>Four selected records have no explanation text in the audit extract.</li><li><b>Known answer conflict:</b> source row 273 has workbook key A/52 while its explanation calculates 48; it is marked unresolved in its PYQ card.</li><li>Counts are workbook record counts; repeated stems may be duplicate imports rather than independent exam appearances.</li></ul>';
  html += '<h3>Classification rules for future questions</h3><ul><li>Divisibility, remainders, prime/factor properties, number types and recurring decimals → Number System.</li><li>BODMAS, arithmetic expressions, fractions, recurring-decimal arithmetic, powers and surds → Simplification.</li><li>Greatest common divisor, least common multiple, common remainders, HCF×LCM identity and repeating events → HCF &amp; LCM.</li><li>Alphabet positions, letter movements, cyclic shifts and letter/letter-number sequences → Alphabet / Letter Series.</li><li>Missing/wrong numerical terms and numerical patterns → Number Series.</li><li>Ratio, percentage, profit/loss, time-speed-distance, data interpretation and figure series → their own topic in a broader notes set; otherwise Miscellaneous PYQs.</li></ul>';
  html += '<p class="muted">Sources: uploaded syllabus text; dsssb pyq part a.xlsx (part A sheet); DSSSB_PYQ_Topic_Audit.xlsx. Theory shortcuts are explanatory notes. PYQ data is workbook-derived and flagged where uncertain.</p></section>';
  return html;
}
