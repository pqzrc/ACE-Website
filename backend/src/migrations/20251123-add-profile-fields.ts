import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface) => {
        // Add User fields
        await queryInterface.addColumn('users', 'username', {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        });

        await queryInterface.addColumn('users', 'affiliation', {
            type: DataTypes.STRING,
            allowNull: true,
        });

        // Add Team field
        await queryInterface.addColumn('teams', 'affiliation', {
            type: DataTypes.STRING,
            allowNull: true,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn('users', 'username');
        await queryInterface.removeColumn('users', 'affiliation');
        await queryInterface.removeColumn('teams', 'affiliation');
    },
};
