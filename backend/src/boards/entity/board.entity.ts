import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { ColumnEntity } from '../../columns/entity/column.entity';
import { ProjectEntity } from '../../projects/entity/project.entity';
import { UserEntity } from '../../user/entity/user.entity';

@Entity()
export class BoardEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: false })
  favorite: boolean;

  @OneToMany(() => ColumnEntity, (column) => column.board, {
    cascade: true,
  })
  columns: ColumnEntity[];

  @ManyToOne(() => ProjectEntity, (project) => project.boards, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectID' })
  project: ProjectEntity;

  @ManyToMany(() => UserEntity, (user) => user.favoriteBoards, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  users: UserEntity[];
}
