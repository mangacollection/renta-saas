import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 app.enableCors({
  origin: [
    "http://localhost:5173",
    "http://192.168.100.171:5173", // 👈 ESTE ES CLAVE
    "https://app.rentacontrol.cl",
    "https://rentacontrol.cl",
  ],
  credentials: true,
});

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
