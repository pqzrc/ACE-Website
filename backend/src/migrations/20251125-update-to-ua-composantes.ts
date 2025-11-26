import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface) => {
        // Rename 'affiliation' to 'composante' in users table
        await queryInterface.renameColumn('users', 'affiliation', 'composante');

        // Rename 'affiliation' to 'composante' in teams table
        await queryInterface.renameColumn('teams', 'affiliation', 'composante');

        // Remove 'school' column if it exists in users table
        try {
            await queryInterface.removeColumn('users', 'school');
        } catch (error) {
            console.log('Column "school" does not exist or already removed');
        }

        // Remove 'grade' column if it exists in users table
        try {
            await queryInterface.removeColumn('users', 'grade');
        } catch (error) {
            console.log('Column "grade" does not exist or already removed');
        }
    },

    down: async (queryInterface: QueryInterface) => {
        // Revert: rename 'composante' back to 'affiliation' in users table
        await queryInterface.renameColumn('users', 'composante', 'affiliation');

        // Revert: rename 'composante' back to 'affiliation' in teams table
        await queryInterface.renameColumn('teams', 'composante', 'affiliation');

        // Restore 'school' column
        await queryInterface.addColumn('users', 'school', {
            type: DataTypes.STRING,
            allowNull: true,
        });

        // Restore 'grade' column
        await queryInterface.addColumn('users', 'grade', {
            type: DataTypes.STRING,
            allowNull: true,
        });
    },
};
