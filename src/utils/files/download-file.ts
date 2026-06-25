import { createObjectUrl, revokeObjectUrl } from './object-url';
import { sanitizeFilename } from './content-disposition';

type DownloadBlobFileParams = {
  blob: Blob;
  filename: string;
};

export function downloadBlobFile({ blob, filename }: DownloadBlobFileParams): void {
  const objectUrl = createObjectUrl(blob);
  const anchor = document.createElement('a');

  try {
    anchor.href = objectUrl;
    anchor.download = sanitizeFilename(filename);
    anchor.rel = 'noopener';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    revokeObjectUrl(objectUrl);
  }
}
