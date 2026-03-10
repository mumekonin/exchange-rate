import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('BirrConvert backend is running');

  // Self-ping every 10 minutes to keep Render awake
  // This prevents the free tier from sleeping and ensures
  // the midnight cron job fires every day automatically
  const BASE_URL = 'https://exchange-rate-mg5x.onrender.com/exchange-rate';

  setInterval(async () => {
    try {
      await fetch(`${BASE_URL}/today-rate`);
      console.log('[BirrConvert] Self-ping OK —', new Date().toISOString());
    } catch (err) {
      console.error('[BirrConvert] Self-ping failed:', err.message);
    }
  }, 10 * 60 * 1000); // every 10 minutes
}
bootstrap();import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('BirrConvert backend is running');
  const BASE_URL = 'https://exchange-rate-mg5x.onrender.com/exchange-rate';

  setInterval(async () => {
    try {
      await fetch(`${BASE_URL}/sync`);
      console.log('[BirrConvert] Self-ping OK —', new Date().toISOString());
    } catch (err) {
      console.error('[BirrConvert] Self-ping failed:', err.message);
    }
  }, 10 * 60 * 1000); 
}
bootstrap();