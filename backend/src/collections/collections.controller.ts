import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCollectionCommand } from './commands/create-collection/create-collection.command';
import { UpdateCollectionCommand } from './commands/update-collection/update-collection.command';
import { DeleteCollectionCommand } from './commands/delete-collection/delete-collection.command';
import { GetCollectionsQuery } from './queries/get-collections/get-collections.query';
import { GetCollectionQuery } from './queries/get-collection/get-collection.query';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

interface AuthUser {
  id: string;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetCollectionsQuery(user.id));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetCollectionQuery(id, user.id));
  }

  @Post()
  create(@Body() dto: CreateCollectionDto, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(
      new CreateCollectionCommand(user.id, dto.name, dto.description),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new UpdateCollectionCommand(id, user.id, dto.name, dto.description),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(new DeleteCollectionCommand(id, user.id));
  }
}
