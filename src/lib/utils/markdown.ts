export function extractMarkdownTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Untitled';
}

export function extractMarkdownExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength) + '...';
}
