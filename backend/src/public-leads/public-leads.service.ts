import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreatePublicLeadDto } from './dto/create-public-lead.dto';

@Injectable()
export class PublicLeadsService {
  private readonly logger = new Logger(PublicLeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreatePublicLeadDto) {
    const name =
      typeof dto.name === 'string' ? dto.name.trim() : '';
    const email =
      typeof dto.email === 'string' ? dto.email.trim().toLowerCase() : '';
    const phone =
      typeof dto.phone === 'string' ? dto.phone.trim() : '';
    const rut =
      typeof dto.rut === 'string' && dto.rut.trim().length > 0
        ? dto.rut.trim()
        : null;
    const message =
      typeof dto.message === 'string' && dto.message.trim().length > 0
        ? dto.message.trim()
        : null;

    let properties: number | null = null;
    if (dto.properties !== undefined && dto.properties !== null) {
      const parsed =
        typeof dto.properties === 'number'
          ? dto.properties
          : Number(dto.properties);

      if (!Number.isInteger(parsed) || parsed < 0) {
        throw new BadRequestException(
          'properties debe ser un numero entero mayor o igual a 0.',
        );
      }

      properties = parsed;
    }

    if (!name) {
      throw new BadRequestException('name es requerido.');
    }

    if (!email) {
      throw new BadRequestException('email es requerido.');
    }

    if (!this.isValidEmail(email)) {
      throw new BadRequestException('email no es valido.');
    }

    if (!phone) {
      throw new BadRequestException('phone es requerido.');
    }

    const existingLead = await this.prisma.lead.findFirst({
      where: {
        email,
        status: {
          in: ['new', 'contacted'],
        },
      },
    });

    if (existingLead) {
      throw new ConflictException(
        'Ya existe una solicitud registrada con este correo.',
      );
    }

    const lead = await this.prisma.lead.create({
      data: {
        name,
        email,
        phone,
        rut,
        properties,
        message,
        status: 'new',
      },
    });

    let emailSent = false;
    let emailError: string | null = null;

    try {
      await this.emailService.sendEmail({
        to: lead.email,
        subject: 'Recibimos tu solicitud — RentaControl',
        html: this.buildConfirmationEmailHtml(lead.name),
        type: 'public_lead_confirmation',
      });

      emailSent = true;
    } catch (error) {
      emailError =
        error instanceof Error ? error.message : 'Unknown email error';

      this.logger.warn(
        `Lead ${lead.id} guardado, pero fallo email automatico: ${emailError}`,
      );
    }

    return {
      success: true,
      message: emailSent
        ? 'Lead registrado y correo enviado.'
        : 'Lead registrado. El correo no pudo enviarse, pero la solicitud quedó guardada.',
      data: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        rut: lead.rut,
        properties: lead.properties,
        message: lead.message,
        status: lead.status,
        createdAt: lead.createdAt,
      },
      emailSent,
      emailError,
    };
  }

  private isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private buildConfirmationEmailHtml(name: string) {
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6;">
        <p>Hola ${this.escapeHtml(name)},</p>

        <p>Gracias por tu interés en <strong>RentaControl</strong> 🙌</p>

        <p>
          Estamos abriendo la Beta de forma controlada para asegurar una buena experiencia.
        </p>

        <p>En las próximas horas te contactaremos por WhatsApp para:</p>

        <ul>
          <li>✔ mostrarte cómo funciona</li>
          <li>✔ ayudarte a configurar tu primer contrato</li>
          <li>✔ dejar tu cuenta lista para cobrar</li>
        </ul>

        <p>Si tienes dudas puedes responder este correo.</p>

        <p>— Equipo RentaControl</p>
      </div>
    `;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}