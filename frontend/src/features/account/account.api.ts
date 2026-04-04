import { api } from "@/lib/axios";
import type { AccountPlan, AccountProfile } from "./account.types";

export async function getAccountPlan(): Promise<AccountPlan> {
  const res = await api.get<AccountPlan>("/account/plan");
  return res.data;
}

export async function getAccountProfile(): Promise<AccountProfile> {
  const res = await api.get<AccountProfile>("/account/profile");
  return res.data;
}

export async function updateAccountProfile(input: {
  phone?: string;
}): Promise<AccountProfile> {
  const res = await api.patch<AccountProfile>("/account/profile", input);
  return res.data;
}