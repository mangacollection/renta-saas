import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request } from 'express';
import axios from 'axios';
import { Throttle } from '@nestjs/throttler';

import { CreatePublicLeadDto } from './dto/create-public-lead.dto';
import { PublicLeadsService } from './public-leads.service';

@Controller('public/leads')
export class PublicLeadsController {
  private readonly logger = new Logger(PublicLeadsController.name);

  constructor(private readonly publicLeadsService: PublicLeadsService) {}

  @Post()
  @Throttle({ default: { limit: 3, ttl: 15 * 60 * 1000 } })
  async create(@Body() dto: CreatePublicLeadDto, @Req() req: Request) {
    const ip = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Honeypot
    if (dto.company && dto.company.trim() !== '') {
      this.logger.warn(
        `Public lead blocked by honeypot | ip=${ip} | ua=${userAgent}`,
      );

      // Fake success para no revelar señal a bots
      return { success: true };
    }

    if (!process.env.TURNSTILE_SECRET_KEY) {
      this.logger.error(
        `TURNSTILE_SECRET_KEY missing | ip=${ip} | ua=${userAgent}`,
      );
      throw new ServiceUnavailableException(
        'La verificación de seguridad no está disponible.',
      );
    }

    if (!dto.turnstileToken || dto.turnstileToken.trim() === '') {
      this.logger.warn(
        `Public lead rejected: missing turnstile token | ip=${ip} | ua=${userAgent}`,
      );
      throw new BadRequestException('Verificación de seguridad requerida.');
    }

    try {
      const verifyRes = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: dto.turnstileToken,
          remoteip: ip,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      const isValid = Boolean(verifyRes.data?.success);

      if (!isValid) {
        this.logger.warn(
          `Public lead rejected: invalid turnstile | ip=${ip} | ua=${userAgent} | errors=${JSON.stringify(
            verifyRes.data?.['error-codes'] || [],
          )}`,
        );

        throw new BadRequestException('No pudimos validar que eres humano.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Turnstile validation failed | ip=${ip} | ua=${userAgent} | error=${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );

      throw new ServiceUnavailableException(
        'Error validando seguridad. Intenta nuevamente.',
      );
    }

    return this.publicLeadsService.create(dto);
  }

  private getClientIp(req: Request) {
    const forwarded = req.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }

    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0];
    }

    return req.ip || 'unknown';
  }
}