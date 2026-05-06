export const BASE_URL = 'http://185.217.125.219:3000/api/v1';

export function buildHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const ROUTES = {
  apps:           `${BASE_URL}/auth/apps`,
  login:          `${BASE_URL}/auth/login`,
  forgotPassword: `${BASE_URL}/auth/forgot-password`,
  resetPassword:  `${BASE_URL}/auth/reset-password`,
  consentAccept:  `${BASE_URL}/auth/consent/accept`,
  homeProfile:    `${BASE_URL}/app/home/profile`,
};