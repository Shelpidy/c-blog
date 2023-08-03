import sequelize from "../database/connection";
import { Model, DataTypes } from "sequelize";

class Follow extends Model {
}

Follow.init(
    {
        followId: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue:DataTypes.UUIDV4,
            autoIncrement: true,
            primaryKey: true,
        },
        followerId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "userId",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        followingId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "userId",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "Follow",
        tableName: "Follows",
        timestamps: true,
    }
);

export default Follow;
