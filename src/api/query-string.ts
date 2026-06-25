import type { QueryParams, QueryParamValue } from '../types/common.types';

function serializeQueryValue(value: Exclude<QueryParamValue, null | undefined>): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

export function createQueryString(params?: QueryParams): string {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, serializeQueryValue(item));
      });
      return;
    }

    searchParams.append(key, serializeQueryValue(value));
  });

  return searchParams.toString();
}
