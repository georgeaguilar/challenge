import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateCollectionCommand } from './update-collection.command';

@CommandHandler(UpdateCollectionCommand)
export class UpdateCollectionHandler implements ICommandHandler<UpdateCollectionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateCollectionCommand) {
    const { id, userId, name, description } = command;

    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException();

    return this.prisma.collection.update({ where: { id }, data: { name, description } });
  }
}
