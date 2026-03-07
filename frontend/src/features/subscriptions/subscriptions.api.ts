import { api } from "@/lib/axios";
import type {
  Subscription,
  CreateSubscriptionInput,
  AddSubscriptionItemInput,
  SubscriptionItem,
} from "./subscriptions.types";

export async function getSubscriptions(): Promise<Subscription[]> {
  const res = await api.get<Subscription[]>("/subscriptions");
  return res.data;
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<Subscription> {
  const res = await api.post<Subscription>("/subscriptions", input);
  return res.data;
}

export async function addSubscriptionItem(
  input: AddSubscriptionItemInput
): Promise<SubscriptionItem> {
  // si el backend no devuelve el item, ajustamos después; por ahora lo tipamos como item creado
  const res = await api.post<SubscriptionItem>("/subscriptions/items", input);
  return res.data;
}

export async function activateSubscription(input: {
  subscriptionId: string;
}): Promise<Subscription> {
  const res = await api.patch<Subscription>("/subscriptions/activate", input);
  return res.data;
}