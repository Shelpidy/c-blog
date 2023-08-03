"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Follows", {
            followId: {
                allowNull: false,
                autoIncrement: true,
                type: Sequelize.UUID,
                defaultValue:Sequelize.UUIDV4,
                primaryKey: true,
            },
            followerId: {
                type: Sequelize.UUID,
                references: {
                    model: "Users",
                    key: "userId",
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            followingId: {
                type: Sequelize.UUID,
                references: {
                    model: "Users",
                    key: "userId",
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Follows");
    },
};
