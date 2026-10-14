import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Add this line to prefix all routes with /api
  app.setGlobalPrefix('api');

  //  Enable CORS for frontend access
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });


  await app.listen(4000);
}
bootstrap();