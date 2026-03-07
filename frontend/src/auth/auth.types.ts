import type { User } from "firebase/auth";

export type AuthState = {
  user: User | null;
  initializing: boolean;
};

export type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};