import { api } from "@/lib/axios";
import type { AccountPlan } from "./account.types";

export async function getAccountPlan(): Promise<AccountPlan> {
  const res = await api.get<AccountPlan>("/account/plan");
  return res.data;
}
