import axios from "axios";
import { env } from "@/config/env";

export type CreatePublicLeadInput = {
  name: string;
  email: string;
  phone: string;
  rut?: string;
  properties?: number;
  message?: string;
  company?: string;
  turnstileToken?: string;
  source?: string;
};

export type CreatePublicLeadResponse = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rut: string | null;
    properties: number | null;
    message: string | null;
    status: string;
    createdAt: string;
  };
  emailSent?: boolean;
  emailError?: string | null;
};

const publicApi = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
});

export async function createPublicLead(input: CreatePublicLeadInput) {
  const response = await publicApi.post<CreatePublicLeadResponse>("/public/leads", input);
  return response.data;
}