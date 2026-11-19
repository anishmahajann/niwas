import { firebaseAuth } from '../config/firebase.js';

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const firebaseUser = firebaseAuth?.currentUser;
  if (firebaseUser) {
    headers.set('Authorization', `Bearer ${await firebaseUser.getIdToken()}`);
  }
  const bodyIsFormData = options.body instanceof FormData;
  if (options.body && !bodyIsFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Request failed (${response.status}).`);
  }
  return result;
}

export async function uploadFiles(endpoint, files) {
  const formData = new FormData();
  for (const file of files) formData.append('files', file);
  return apiRequest(endpoint, { method: 'POST', body: formData });
}
