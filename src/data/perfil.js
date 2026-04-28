// src/data/perfil.js
// Dados mockados do perfil — substitua por chamada real de API no futuro

export const perfilMock = {
  profile: {
    id: 5,
    name: 'Maria Aparecida Souza',
    email: 'paciente1@unifae.local',
    role: 'PATIENT',
    photoUrl: null,
  },
  app: {
    id: 1,
    name: 'Unifae Care - Fisioterapia',
  },
  course: {
    id: 1,
    name: 'Fisioterapia',
  },
  responsibleStudent: {
    id: 4,
    name: 'Aluno André Lucas',
    email: 'aluno@unifae.local',
    photoUrl: null,
  },
  coordinator: {
    id: 2,
    name: 'Coord. Vanessa',
    email: 'coordenador@unifae.local',
    photoUrl: null,
  },
  weeklyProgress: {
    from: '2026-04-20',
    to: '2026-04-27',
    prescribedExercises: 2,
    completedExercises: 0,
    percentCompleted: 85,
  },
};

export function getPerfil() {
  return perfilMock;
}
