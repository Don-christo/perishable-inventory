import Items from "./items";
import Lot from "./lot";

Lot.belongsTo(Items, { foreignKey: "itemId" });
Items.hasMany(Lot, { foreignKey: "itemId" });

export { Lot, Items };
