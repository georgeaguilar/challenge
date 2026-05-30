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

    return this.prisma.collection.delete({ where: { id } });
  }
}
