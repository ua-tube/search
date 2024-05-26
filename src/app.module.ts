import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors';
import { SearchModule } from './search/search.module';
import { MeiliSearchModule } from 'nestjs-meilisearch';
import { CreatorsModule } from './creators/creators.module';
import { VideoManagerModule } from './video-manager/video-manager.module';
import { HistoryModule } from './history/history.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.valid('development', 'production', 'test').required(),
        HTTP_HOST: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        CLIENT_URL: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
        MEILISEARCH_URL: Joi.string().uri().required(),
        MEILISEARCH_MASTERKEY: Joi.string().required(),
      }),
    }),
    MeiliSearchModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.getOrThrow<string>('MEILISEARCH_URL'),
        apiKey: configService.getOrThrow<string>('MEILISEARCH_MASTERKEY'),
      }),
    }),
    HealthModule,
    CreatorsModule,
    VideoManagerModule,
    HistoryModule,
    SearchModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
