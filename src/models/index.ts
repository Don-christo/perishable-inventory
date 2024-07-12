import Item from "./item";
import Lot from "./lot";

Lot.belongsTo(Item, { foreignKey: "itemId" });
Item.hasMany(Lot, { foreignKey: "itemId" });

export { Lot, Item };
