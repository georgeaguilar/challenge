import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: InstanceType<typeof PrismaClient>;

  constructor() {
    const adapter = new PrismaPg(process.env.DATABASE_URL!);
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  get user() {
    return this.client.user;
  }
  get collection() {
    return this.client.collection;
  }
  get collectionImage() {
    return this.client.collectionImage;
  }
  get tag() {
    return this.client.tag;
  }
  get imageTag() {
    return this.client.imageTag;
  }
  get $transaction(): typeof this.client.$transaction {
    return this.client.$transaction.bind(
      this.client,
    ) as typeof this.client.$transaction;
  }
}
