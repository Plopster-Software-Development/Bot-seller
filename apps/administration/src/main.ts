import { NestFactory } from '@nestjs/core';
import { AdministrationModule } from './administration.module';

async function bootstrap() {
  const app = await NestFactory.create(AdministrationModule);
  await app.listen(3000);
}
bootstrap();
