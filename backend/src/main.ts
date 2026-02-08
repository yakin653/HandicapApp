import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('RequestLogger');
  
  // ✅ Middleware de logging pour toutes les requêtes
  app.use((req, res, next) => {
    const { method, originalUrl, body } = req;
    logger.log(`📨 ${method} ${originalUrl}`);
    if (body && (method === 'POST' || method === 'PUT')) {
      // Masquer le mot de passe dans les logs
      const logBody = { ...body };
      if (logBody.password) {
        logBody.password = '***HIDDEN***';
      }
      logger.log(`📦 Body: ${JSON.stringify(logBody)}`);
    }
    next();
  });
  
  // ✅ Activez CORS pour accepter les requêtes de l'app mobile
  app.enableCors({
    origin: true, // Autorise toutes les origines (pour le développement)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // ✅ Écoutez sur TOUTES les interfaces réseau
  await app.listen(3000, '0.0.0.0');
  
  console.log('🚀 Application is running on:');
  console.log('   - Local: http://localhost:3000');
  console.log('   - Network: http://172.18.13.154:3000');
  console.log('   - VirtualBox: http://192.168.56.1:3000');
  console.log('📊 Request logging enabled - all requests will be logged');
}

bootstrap();