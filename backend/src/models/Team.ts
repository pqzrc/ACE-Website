import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'teams',
  timestamps: true,
})
export class Team extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING(6),
    allowNull: false,
    unique: true,
  })
  inviteCode!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  captainId!: string;

  @BelongsTo(() => User, 'captainId')
  captain?: User;

  @HasMany(() => User, 'teamId')
  members?: User[];

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 4,
    },
  })
  roomNumber!: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  sessionStartTime!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  sessionEndTime!: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isComplete!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  composante!: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  ctfdTeamId!: number | null;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  currentScore!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rank!: number | null;

  // Get member count
  async getMemberCount(): Promise<number> {
    const members = await User.count({ where: { teamId: this.id } });
    return members;
  }

  // Check if team is full (5 members max)
  async isFull(): Promise<boolean> {
    const count = await this.getMemberCount();
    return count >= 5;
  }

  // Check if team has minimum members (3)
  async hasMinimumMembers(): Promise<boolean> {
    const count = await this.getMemberCount();
    return count >= 3;
  }
}

