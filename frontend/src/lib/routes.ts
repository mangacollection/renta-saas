const APP = "/app";

export function appRoute(path: string = "") {
  if (!path) return APP;
  return `${APP}/${path}`;
}