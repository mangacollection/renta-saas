import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { execSync } from 'child_process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    try {
      console.log('Running prisma migrate deploy...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('Prisma migrations applied');
    } catch (e) {
      console.error('Prisma migrate failed', e);
    }

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://app.rentacontrol.cl',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();