import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import { Team } from './Team';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
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
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  specialty!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  username!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  composante!: string | null;

  @ForeignKey(() => Team)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  teamId!: string | null;

  @BelongsTo(() => Team)
  team?: Team;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  verificationToken!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verificationTokenExpiry!: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isAdmin!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  ctfdUserId!: number | null;

  // Hash password before saving
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      // Production: 8 rounds (~30-50ms, OWASP recommended for 2025)
      // Development: 2 rounds (~2-5ms, fast testing)
      const saltRounds = process.env.NODE_ENV === 'production' ? 8 : 2;
      const salt = await bcrypt.genSalt(saltRounds);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  // Method to compare passwords
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Get user without sensitive data
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.verificationToken;
    return values;
  }
}

