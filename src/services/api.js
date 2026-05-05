// src/services/api.js
// Configuração centralizada da API — altere BASE_URL aqui para mudar em todo o projeto.

export const BASE_URL = 'http://185.217.125.219:3000/api/v1';

/**
 * Retorna os headers padrão com Authorization se token estiver disponível.
 * @param {string|null} token
 */
export function buildHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Rotas da API usadas no projeto.
 */
export const ROUTES = {
  login:       `${BASE_URL}/auth/login`,
  homeProfile: `${BASE_URL}/app/home/profile`,
};
