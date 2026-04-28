export const usuarios = [
  { id: '1', nome: 'Admin UNIFAE', email: 'admin@unifae.br', senha: 'admin' },
];

export function buscarPorEmail(email) {
  return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function validarLogin(email, senha) {
  const usuario = buscarPorEmail(email);
  if (!usuario || usuario.senha !== senha) return null;
  return usuario;
}
