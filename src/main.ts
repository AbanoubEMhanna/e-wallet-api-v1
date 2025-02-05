import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe with custom error handling
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    transform: true, // Transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transformOptions: {
      enableImplicitConversion: true, // Automatically transform types
    },
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      return new BadRequestException(
        validationErrors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        })),
      );
    },
  }));

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('E-Wallet API')
    .setDescription('API documentation for the E-Wallet system')
    .setVersion('1.0')
    .addTag('Wallet')
    .addBearerAuth() // Prepare for future JWT implementation
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();