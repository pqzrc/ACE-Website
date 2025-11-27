import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable('time_slots', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            roomName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'room_name',
            },
            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'start_time',
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: 'end_time',
            },
            maxTeams: {
                type: DataTypes.INTEGER,
                defaultValue: 6,
                allowNull: false,
                field: 'max_teams',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'is_active',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
            },
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable('time_slots');
    },
};
