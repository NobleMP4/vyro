import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Paginated, paginated } from '../common/dto/pagination.dto';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseQueryDto, ExerciseScope } from './dto/exercise-query.dto';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { toExerciseResponse } from './exercise.mapper';

/**
 * Exercise library: the shared catalog (ownerId = null, read-only) plus each
 * user's custom exercises, visible only to their owner. Custom exercises are
 * soft-deleted so past workouts keep referencing them.
 */
@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ExerciseQueryDto): Promise<Paginated<ExerciseResponseDto>> {
    const where: Prisma.ExerciseWhereInput = {
      deletedAt: null,
      ...this.scopeFilter(userId, query.scope),
      ...(query.search && { name: { contains: query.search } }),
      ...(query.muscleGroup && { muscleGroup: query.muscleGroup }),
      ...(query.equipment && { equipment: query.equipment }),
      ...(query.difficulty && { difficulty: query.difficulty }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.exercise.findMany({
        where,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.exercise.count({ where }),
    ]);
    return paginated(items.map(toExerciseResponse), total, query);
  }

  async get(userId: string, id: string): Promise<ExerciseResponseDto> {
    return toExerciseResponse(await this.findVisible(userId, id));
  }

  async create(userId: string, dto: CreateExerciseDto): Promise<ExerciseResponseDto> {
    const exercise = await this.prisma.exercise.create({
      data: { ...dto, secondaryMuscles: dto.secondaryMuscles ?? [], ownerId: userId },
    });
    return toExerciseResponse(exercise);
  }

  async update(userId: string, id: string, dto: UpdateExerciseDto): Promise<ExerciseResponseDto> {
    await this.findEditable(userId, id);
    const exercise = await this.prisma.exercise.update({ where: { id }, data: dto });
    return toExerciseResponse(exercise);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findEditable(userId, id);
    await this.prisma.exercise.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private scopeFilter(userId: string, scope: ExerciseScope): Prisma.ExerciseWhereInput {
    switch (scope) {
      case ExerciseScope.CATALOG:
        return { ownerId: null };
      case ExerciseScope.MINE:
        return { ownerId: userId };
      default:
        return { OR: [{ ownerId: null }, { ownerId: userId }] };
    }
  }

  /** Other users' exercises are reported as not found, never as forbidden. */
  private async findVisible(userId: string, id: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id, deletedAt: null, OR: [{ ownerId: null }, { ownerId: userId }] },
    });
    if (!exercise) {
      throw new AppException(
        HttpStatus.NOT_FOUND,
        ErrorCode.EXERCISE_NOT_FOUND,
        'Exercice introuvable.',
      );
    }
    return exercise;
  }

  private async findEditable(userId: string, id: string) {
    const exercise = await this.findVisible(userId, id);
    if (exercise.ownerId !== userId) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        ErrorCode.EXERCISE_NOT_EDITABLE,
        'Les exercices du catalogue ne peuvent pas être modifiés.',
      );
    }
    return exercise;
  }
}
