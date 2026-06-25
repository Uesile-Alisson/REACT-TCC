import type { ApiFileResponse } from '../types/common.types';
import { getFilenameFromContentDisposition } from '../utils/files';

export function createApiFileResponse(
  blob: Blob,
  contentDisposition?: string,
  contentType?: string,
  contentLength?: number,
): ApiFileResponse {
  return {
    blob,
    filename: getFilenameFromContentDisposition(contentDisposition),
    contentType,
    contentDisposition,
    contentLength,
  };
}

export { getFilenameFromContentDisposition };
