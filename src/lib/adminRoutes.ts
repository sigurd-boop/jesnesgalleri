const sanitize = (value: string) => value.replace(/^\/+/, '').replace(/\/+$/, '');

const DEFAULT_SEGMENT = '_atelier-admin';
const rawSegment = (import.meta.env.VITE_ADMIN_ROUTE ?? '').trim();
const segment = sanitize(rawSegment).length > 0 ? sanitize(rawSegment) : DEFAULT_SEGMENT;

export const ADMIN_ROUTE_PATH = `/${segment}`;
export const ADMIN_LOGIN_PATH = `${ADMIN_ROUTE_PATH}/login`;

export const getAdminRoutes = () => ({
  dashboard: ADMIN_ROUTE_PATH,
  login: ADMIN_LOGIN_PATH,
});
