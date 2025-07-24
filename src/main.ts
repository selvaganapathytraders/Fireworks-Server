import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - adjust the origin to your frontend URL or use '*' for development only
  app.enableCors({
    origin: [
    'https://fireworks-five-gamma.vercel.app',
    'https://fireworks-five-gamma.vercel.app/'
  ],// change this to your frontend URL
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // if you use cookies or sessions, otherwise optional
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
