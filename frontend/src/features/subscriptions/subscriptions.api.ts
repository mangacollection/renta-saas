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
export async function updateSubscriptionItem(
  itemId: string,
  input: {
    name?: string;
    amount?: number;
  }
): Promise<SubscriptionItem> {
  const res = await api.patch<SubscriptionItem>(
    `/subscriptions/items/${itemId}`,
    input
  );
  return res.data;
}
export async function deleteSubscriptionItem(
  itemId: string
): Promise<void> {
  await api.delete(`/subscriptions/items/${itemId}`);
}