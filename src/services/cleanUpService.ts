import { Op } from "sequelize";
import { Lot } from "../models";

export const cleanupExpiredLots = async () => {
  const now = Date.now();
  try {
    await Lot.destroy({
      where: {
        expiry: {
          [Op.lte]: now,
        },
      },
    });
    console.log("Expired lots cleaned up");
  } catch (error) {
    console.error("Error cleaning up expired lots:", error);
  }
};
