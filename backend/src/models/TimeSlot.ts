import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
} from 'sequelize-typescript';
import { Team } from './Team';

@Table({
    tableName: 'time_slots',
    timestamps: true,
})
export class TimeSlot extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    roomName!: string;

    @Column({
        type: DataType.TIME,
        allowNull: false,
    })
    startTime!: string;

    @Column({
        type: DataType.TIME,
        allowNull: false,
    })
    endTime!: string;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 6,
        allowNull: false,
    })
    maxTeams!: number;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isActive!: boolean;

    @HasMany(() => Team, 'timeSlotId')
    teams?: Team[];

    // Get the number of teams assigned to this time slot
    async getTeamCount(): Promise<number> {
        const count = await Team.count({ where: { timeSlotId: this.id } });
        return count;
    }

    // Check if time slot is full (reached maxTeams)
    async isFull(): Promise<boolean> {
        const count = await this.getTeamCount();
        return count >= this.maxTeams;
    }

    // Get display name: "Salle X – HH:MM-HH:MM"
    getDisplayName(): string {
        return `Salle ${this.roomName} – ${this.startTime.substring(0, 5)}-${this.endTime.substring(0, 5)}`;
    }
}
