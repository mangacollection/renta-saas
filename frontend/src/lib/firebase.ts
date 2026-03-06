import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { env } from "@/config/env";

const app = initializeApp(env.firebase);
export const firebaseAuth = getAuth(app);