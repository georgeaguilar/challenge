import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { NasaModule } from './nasa/nasa.module';
import { CollectionImagesModule } from './collection-images/collection-images.module';
import { AiSummaryModule } from './ai-summary/ai-summary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60000, limit: 120 },
    ]),
    PrismaModule,
    AuthModule,
    CollectionsModule,
    NasaModule,
    CollectionImagesModule,
    AiSummaryModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
