export function getPath(): string {
  return window.location.pathname;
}

export function getQueryParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.dispatchEvent(new Event('routechange'));
}

export function isPublicRoute(path: string): boolean {
  const publicRoutes = ['/', '/pricing', '/features', '/about', '/contact', '/faq', '/terms', '/privacy', '/login', '/signup', '/reset-password'];
  return publicRoutes.includes(path);
}

export function requiresOrganization(path: string): boolean {
  const orgRoutes = ['/dashboard', '/courses', '/profile', '/settings', '/analytics'];
  return orgRoutes.some(route => path.startsWith(route));
}

export function requiresAuth(path: string): boolean {
  return !isPublicRoute(path);
}
