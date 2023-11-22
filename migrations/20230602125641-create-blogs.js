"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Blogs", {
            blogId: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            slug: {
                type: Sequelize.UUID,
            },
            title: {
                type: Sequelize.STRING,
            },
            type: {
                type: Sequelize.STRING,
            },
            url: {
                type: Sequelize.STRING,
            },
            summary: {
                type: Sequelize.STRING,
            },
            text: Sequelize.TEXT,
            images: Sequelize.JSON,
            video: Sequelize.STRING,
            shared: Sequelize.BOOLEAN,
            fromUserId: {
                type: Sequelize.UUID,
                references: {
                    model: "Users",
                    key: "userId",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            fromBlogId: {
                type: Sequelize.UUID,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Blogs");
    },
};
