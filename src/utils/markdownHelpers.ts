export interface MarkdownHeading {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function extractHeadings(markdown: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let inCodeBlock = false;
  const slugCounts = new Map<string, number>();

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,3})\s+(.+?)\s*#*$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[`*_~]/g, '').trim();
      const baseSlug = slugifyHeading(text) || 'section';
      const seen = slugCounts.get(baseSlug) ?? 0;
      slugCounts.set(baseSlug, seen + 1);
      const id = seen === 0 ? baseSlug : `${baseSlug}-${seen}`;
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export function estimateReadTimeMinutes(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`_\-|]/g, ' ')
    .trim();
  if (!plain) return 1;
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function stripMarkdownSnippet(markdown: string, maxLength = 150): string {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\|?(?:\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?$/gm, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}
