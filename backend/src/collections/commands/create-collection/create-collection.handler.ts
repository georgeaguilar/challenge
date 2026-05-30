import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCollectionCommand } from './create-collection.command';

@CommandHandler(CreateCollectionCommand)
export class CreateCollectionHandler implements ICommandHandler<CreateCollectionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  execute(command: CreateCollectionCommand) {
    const { userId, name, description } = command;
    return this.prisma.collection.create({ data: { userId, name, description } });
  }
}
