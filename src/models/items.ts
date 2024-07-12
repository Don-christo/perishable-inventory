import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { db } from "../config";

const TABLE_NAME = "Items";

class Items extends Model<
  InferAttributes<Items>,
  InferCreationAttributes<Items>
> {
  declare id: string;
  declare name: string;
}

Items.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db,
    modelName: TABLE_NAME,
    timestamps: true,
  }
);

export default Items;
