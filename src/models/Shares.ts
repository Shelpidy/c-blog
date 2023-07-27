import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class Share extends Model {}

Share.init(
    {
        shareId: {
            type: DataTypes.UUID,
            autoIncrement: true,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
        },
        refId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId",
            },
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
        tableName: "Shares",
        timestamps: true,
    }
);

export default Share;
