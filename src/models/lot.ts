import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { db } from "../config";
import Item from "./item";

const TABLE_NAME = "Lot";

class Lot extends Model<InferAttributes<Lot>, InferCreationAttributes<Lot>> {
  declare id: string;
  declare itemId: string;
  declare quantity: number;
  declare expiry: Date;
}

Lot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemId: {
      type: DataTypes.UUID,
      references: {
        model: Item,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    expiry: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: db,
    modelName: TABLE_NAME,
    tableName: TABLE_NAME,
    timestamps: true,
  }
);

export default Lot;
