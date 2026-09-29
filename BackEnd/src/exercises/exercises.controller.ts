import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseQueryDto } from './dto/exercise-query.dto';
import { ExerciseListResponseDto, ExerciseResponseDto } from './dto/exercise-response.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@ApiTags('exercises')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get()
  @ApiOperation({ summary: 'Search the exercise library (catalog + own custom exercises)' })
  @ApiOkResponse({ type: ExerciseListResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'VALIDATION_FAILED' })
  list(@CurrentUser() user: AuthUser, @Query() query: ExerciseQueryDto) {
    return this.exercises.list(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Exercise detail' })
  @ApiOkResponse({ type: ExerciseResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'EXERCISE_NOT_FOUND' })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.exercises.get(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom exercise' })
  @ApiCreatedResponse({ type: ExerciseResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'VALIDATION_FAILED' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateExerciseDto) {
    return this.exercises.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of your custom exercises' })
  @ApiOkResponse({ type: ExerciseResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto, description: 'EXERCISE_NOT_EDITABLE' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'EXERCISE_NOT_FOUND' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    return this.exercises.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete one of your custom exercises' })
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ type: ErrorResponseDto, description: 'EXERCISE_NOT_EDITABLE' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'EXERCISE_NOT_FOUND' })
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    await this.exercises.remove(user.id, id);
  }
}
