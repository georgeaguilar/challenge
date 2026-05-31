import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DeleteCollectionCommand } from './delete-collection.command';

@CommandHandler(DeleteCollectionCommand)
export class DeleteCollectionHandler implements ICommandHandler<DeleteCollectionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteCollectionCommand) {
    const { id, userId } = command;

    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException();

    const now = new Date();
    await this.prisma.collectionImage.updateMany({
      where: { collectionId: id, deletedAt: null },
      data: { deletedAt: now },
    });
    return this.prisma.collection.update({
      where: { id },
      data: { deletedAt: now },
    });
  }
}
