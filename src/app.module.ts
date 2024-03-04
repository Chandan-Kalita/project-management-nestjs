import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ControllersModule } from './controllers/controllers.module';
import { ServicesModule } from './services/services.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://chandan:K3j5p9eJ3Hj5oPFl@cluster0.4gwsqav.mongodb.net/snippet-manager?retryWrites=true&w=majority&appName=Cluster0',
    ),
    ControllersModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_PIPE, useClass: ZodValidationPipe }],
})
export class AppModule {}
