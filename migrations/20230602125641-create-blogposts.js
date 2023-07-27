"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("BlogPosts", {
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
            lastUpdatedById: {
                type: Sequelize.UUID,
                references: {
                    model: "Users",
                    key: "userId",
                },
                onUpdate: "CASCADE",
            },
            publishedById: {
                type: Sequelize.UUID,
                references: {
                    model: "Users",
                    key: "userId",
                },
                onUpdate: "CASCADE",
            },
            title: {
                type: Sequelize.STRING,
            },
            tags: {
                type: Sequelize.JSON,
            },
            editors: {
                type: Sequelize.JSON,
            },
            url: {
                type: Sequelize.STRING,
            },
            summary: {
                type: Sequelize.STRING,
            },
            content: {
                type: Sequelize.TEXT,
            },
            imageUrl: {
                type: Sequelize.STRING,
            },
            status: {
                type: Sequelize.ENUM("draft", "published"),
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
            publishedAt: {
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("BlogPosts");
    },
};
