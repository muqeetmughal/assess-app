const ASSESSMENTS_KEY = 'assess-app:assessments';
const RESULTS_KEY = 'assess-app:results';

export function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storageKeys = {
  assessments: ASSESSMENTS_KEY,
  results: RESULTS_KEY,
};
