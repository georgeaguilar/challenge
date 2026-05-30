import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AddImageCommand } from './commands/add-image/add-image.command';
import { RemoveImageCommand } from './commands/remove-image/remove-image.command';
import { AddTagCommand } from './commands/add-tag/add-tag.command';
import { RemoveTagCommand } from './commands/remove-tag/remove-tag.command';
import { GetCollectionImageQuery } from './queries/get-collection-image/get-collection-image.query';
import { AddImageDto } from './dto/add-image.dto';
import { AddTagDto } from './dto/add-tag.dto';

interface AuthUser {
  id: string;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller('collections/:collectionId/images')
export class CollectionImagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':imageId')
  findOne(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.queryBus.execute(
      new GetCollectionImageQuery(imageId, collectionId, user.id),
    );
  }

  @Post()
  addImage(
    @Param('collectionId') collectionId: string,
    @Body() dto: AddImageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new AddImageCommand(
        collectionId,
        user.id,
        dto.nasaId,
        dto.title,
        dto.url,
        dto.date,
        dto.description,
      ),
    );
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeImage(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new RemoveImageCommand(imageId, collectionId, user.id),
    );
  }

  @Post(':imageId/tags')
  addTag(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @Body() dto: AddTagDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new AddTagCommand(imageId, collectionId, user.id, dto.name),
    );
  }

  @Delete(':imageId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTag(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @Param('tagId') tagId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new RemoveTagCommand(imageId, tagId, collectionId, user.id),
    );
  }
}
