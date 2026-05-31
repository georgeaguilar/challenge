import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddImageCommand } from './add-image.command';

@CommandHandler(AddImageCommand)
export class AddImageHandler implements ICommandHandler<AddImageCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddImageCommand) {
    const { collectionId, userId, nasaId, title, url, date, description } =
      command;

    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException();

    return this.prisma.collectionImage.upsert({
      where: { collectionId_nasaId: { collectionId, nasaId } },
      create: { collectionId, nasaId, title, url, date, description },
      update: { title, url, date, description, deletedAt: null },
    });
  }
}
