const FALLBACK_UNSAFE_CHARS = /[<>:"/\\|?*]/g;

function removeControlCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);

      return code > 31 && code !== 127;
    })
    .join('');
}

export function sanitizeFilename(filename: string): string {
  const sanitized = removeControlCharacters(filename)
    .replace(FALLBACK_UNSAFE_CHARS, '-')
    .replace(/\.\.+/g, '.')
    .replace(/^\.+/, '')
    .trim();

  return sanitized || 'arquivo';
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getFilenameFromContentDisposition(
  contentDisposition?: string | null,
): string | undefined {
  if (!contentDisposition) {
    return undefined;
  }

  const utfFilenameMatch = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);

  if (utfFilenameMatch?.[1]) {
    return sanitizeFilename(safeDecodeURIComponent(utfFilenameMatch[1].replace(/"/g, '')));
  }

  const filenameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);

  if (!filenameMatch?.[1]) {
    return undefined;
  }

  return sanitizeFilename(filenameMatch[1].replace(/"/g, ''));
}
