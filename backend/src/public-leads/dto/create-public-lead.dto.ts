export class CreatePublicLeadDto {
  name!: string;
  email!: string;
  phone!: string;
  rut?: string;
  properties?: number;
  message?: string;
}