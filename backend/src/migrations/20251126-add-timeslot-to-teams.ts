import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.addColumn('teams', 'time_slot_id', {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'time_slots',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn('teams', 'time_slot_id');
    },
};
