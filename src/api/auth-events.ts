export const AUTH_UNAUTHORIZED_EVENT = 'tsea:auth:unauthorized';

export function notifyUnauthorizedSession(): void {
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}
