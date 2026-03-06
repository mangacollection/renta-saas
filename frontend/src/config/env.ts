export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,

  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  },
};

function assertEnv() {
  const missing: string[] = [];
  if (!env.apiBaseUrl) missing.push("VITE_API_BASE_URL");
  if (!env.firebase.apiKey) missing.push("VITE_FIREBASE_API_KEY");
  if (!env.firebase.authDomain) missing.push("VITE_FIREBASE_AUTH_DOMAIN");
  if (!env.firebase.projectId) missing.push("VITE_FIREBASE_PROJECT_ID");
  if (!env.firebase.appId) missing.push("VITE_FIREBASE_APP_ID");

  if (missing.length) throw new Error(`Missing env vars: ${missing.join(", ")}`);
}
assertEnv();