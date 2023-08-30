import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

class Comment extends Model {}

Comment.init(
    {
        commentId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
        },
        refId: {
            type: DataTypes.UUID,
        },
        userId: {
            type: DataTypes.STRING,
            references: {
                model: "Users",
                key: "userId",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Comment",
        tableName: "Comments",
        underscored: false,
        timestamps: true,
        updatedAt:"updatedAt"
    }
);

export default Comment;
