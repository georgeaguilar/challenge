import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { NasaModule } from './nasa/nasa.module';
import { CollectionImagesModule } from './collection-images/collection-images.module';
import { AiSummaryModule } from './ai-summary/ai-summary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CollectionsModule,
    NasaModule,
    CollectionImagesModule,
    AiSummaryModule,
  ],
})
export class AppModule {}
