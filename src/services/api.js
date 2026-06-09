export const HOST_URL = 'http://185.217.125.219:3000';
export const BASE_URL = `${HOST_URL}/api/v1`;

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
  home:           `${BASE_URL}/app/home`,
  planExercises:  `${BASE_URL}/app/home/plan/exercises`,
  exerciseDetail: prescriptionItemId => `${BASE_URL}/app/home/plan/exercises/${prescriptionItemId}`,
  completePlanExercise: prescriptionItemId => `${BASE_URL}/app/home/plan/exercises/${prescriptionItemId}/complete`,
  submitExerciseFeedback: executionId => `${BASE_URL}/app/home/plan/executions/${executionId}/feedback`,
  // POST /app/home/pain
  pain:           `${BASE_URL}/app/home/pain`,
  motivation:     `${BASE_URL}/app/home/motivation`,
  homeProfile:    `${BASE_URL}/app/home/profile`,
  profilePhotoUpload: `${BASE_URL}/app/home/profile/photo`,
  profilePhotoPut:  `${BASE_URL}/app/home/profile/photo`,
  profilePhotoGet: userId => `${BASE_URL}/app/home/profile/photo/${userId}`,
};