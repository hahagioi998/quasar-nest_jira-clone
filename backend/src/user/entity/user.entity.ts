import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail } from 'class-validator';

import { BaseEntity } from '../../common/base.entity';
import { IssueEntity } from '../../issues/entity/issue.entity';
import { ProjectEntity } from '../../projects/entity/project.entity';
import { BoardEntity } from '../../boards/entity/board.entity';
import { Exclude } from 'class-transformer';
import { TeamEntity } from '../../teams/entity/team.entity';

export interface UserValidationDTO {
  readonly email: string;
  readonly password: string;
}
export interface UserTokensInterface {
  readonly user?: UserEntity;
  readonly accessToken: string;
  readonly refreshToken: string;
}
export interface UserUpdateTokensDTO {
  readonly userID: number;
  readonly email: string;
  readonly refreshToken: string;
}
export interface UserJwtPayload {
  readonly userID: number;
  readonly email: string;
}

@Entity()
export class UserEntity extends BaseEntity {
  @Column({ length: 64 })
  name: string;

  @Column({ length: 24, unique: true })
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Exclude()
  @Column({ length: 128 })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  hashedRefreshToken: string;

  @Column({ nullable: true })
  locale: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  avatarURL: string | null;

  @OneToMany(() => IssueEntity, (issue) => issue.assigned)
  assignedIssues: IssueEntity[];

  @ManyToMany(() => IssueEntity, (issue) => issue.watchers)
  watchingIssues: IssueEntity[];

  @ManyToMany(() => ProjectEntity, (project) => project.users, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable()
  projects: ProjectEntity[];

  @RelationId((user: UserEntity) => user.projects)
  projectIDs: number[];

  @ManyToMany(() => ProjectEntity, (project) => project.users)
  @JoinTable()
  favoriteProjects: ProjectEntity[];
  @RelationId((user: UserEntity) => user.favoriteProjects)
  favoriteProjectIDs: number[];

  @ManyToMany(() => BoardEntity, (board) => board.users)
  @JoinTable()
  favoriteBoards: BoardEntity[];
  @RelationId((user: UserEntity) => user.favoriteBoards)
  favoriteBoardIDs: number[];

  @Column({ nullable: true })
  position: string;
  @Column({ nullable: true })
  department: string;
  @Column({ nullable: true })
  organisation: string;
  @Column({ nullable: true })
  location: string;

  @ManyToMany(() => TeamEntity, (team) => team.users, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  teams: UserEntity[];

  @ManyToOne(() => TeamEntity, (team) => team.leader, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  teamsLeader: TeamEntity[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
