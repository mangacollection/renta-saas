import axios from "axios";
import { env } from "@/config/env";
import { firebaseAuth } from "@/lib/firebase";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20_000,
});

api.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});