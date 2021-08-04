import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardEntity } from './entity/board.entity';
import { Repository } from 'typeorm';
import { CreateBoardDTO, UpdateBoardDTO } from './dto';
import { ProjectsService } from '../projects/projects.service';
import { ColumnsService } from '../columns/columns.service';
import { UserService } from '../user/user.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardEntity)
    private boards: Repository<BoardEntity>,

    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,

    @Inject(forwardRef(() => ColumnsService))
    private readonly columnsService: ColumnsService,

    @Inject(UserService)
    private readonly userService: UserService
  ) {}

  async getByID(id: number): Promise<BoardEntity> {
    return await this.boards.findOneOrFail(id, { relations: ['columns'] });
  }

  async create(boardData: CreateBoardDTO): Promise<BoardEntity> {
    const createdBoard = await this.boards.save(boardData);
    await this.columnsService.createDefaultColumns(createdBoard);
    return createdBoard;
  }

  async update(id: number, boardData: UpdateBoardDTO): Promise<BoardEntity> {
    const toUpdate = await this.boards.findOneOrFail(id);
    const updated = { ...toUpdate, ...boardData };
    await this.boards.save(updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.boards.delete(id);
  }

  async toggleFavorite(boardID: number, userID: number): Promise<void> {
    console.log(boardID, userID);
    const userFavoriteBoards = await this.userService.getFavoriteBoards(userID);
    console.log(userFavoriteBoards);
    const boardIndex = userFavoriteBoards.findIndex((b) => b.id === boardID);

    if (boardIndex !== -1) {
      userFavoriteBoards.splice(boardIndex, 1);
      console.log('SPLICED', boardIndex, userFavoriteBoards);
    } else {
      const project = await this.boards.findOne(boardID);
      userFavoriteBoards.push(project);
    }

    await this.userService.update(userID, { favoriteBoards: userFavoriteBoards });
  }
}
