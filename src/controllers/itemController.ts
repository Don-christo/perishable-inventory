import { Request, Response } from "express";
import { Item } from "../models";
import { Lot } from "../models";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidV4 } from "uuid";

export const addItem = async (req: Request, res: Response) => {
  const { item } = req.params;
  const { quantity, expiry } = req.body;
  const id = uuidV4();
  const lotId = uuidV4();

  try {
    let itemInstance = await Item.findOne({ where: { name: item } });

    if (!itemInstance) {
      itemInstance = await Item.create({
        id,
        name: item,
      });
    }
    await Lot.create({
      id: lotId,
      itemId: itemInstance.id,
      quantity,
      expiry,
    });
    return res.status(StatusCodes.CREATED).json({});
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

export const sellItem = async (req: Request, res: Response) => {
  const { item } = req.params;
  const { quantity } = req.body;

  try {
    const itemInstance = await Item.findOne({ where: { name: item } });

    if (!itemInstance) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Item not found" });
    }

    const lots = await Lot.findAll({
      where: { itemId: itemInstance.id },
      order: [["expiry", "ASC"]],
    });

    let remainingQuantity = quantity;

    for (const lot of lots) {
      if (lot.expiry < Date.now()) {
        await lot.destroy();
        continue;
      }

      if (lot.quantity >= remainingQuantity) {
        lot.quantity -= remainingQuantity;
        await lot.save();
        remainingQuantity = 0;
        break;
      } else {
        remainingQuantity -= lot.quantity;
        await lot.destroy();
      }
    }

    if (remainingQuantity > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Not enough quantity available" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Item sold successfully" });
  } catch (error) {
    console.error("Error selling item:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};

export const getItemQuantity = async (req: Request, res: Response) => {
  const { item } = req.params;

  try {
    const itemInstance = await Item.findOne({ where: { name: item } });

    if (!itemInstance) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ quantity: 0, validTill: null });
    }

    const lots = await Lot.findAll({
      where: { itemId: itemInstance.id },
      order: [["expiry", "ASC"]],
    });

    let totalQuantity = 0;
    let validTill: number | null = null;

    for (const lot of lots) {
      if (lot.expiry < Date.now()) {
        await lot.destroy();
      } else {
        totalQuantity += lot.quantity;
        if (!validTill || lot.expiry < validTill) {
          validTill = lot.expiry;
        }
      }
    }

    return res
      .status(StatusCodes.OK)
      .json({ quantity: totalQuantity, validTill });
  } catch (error) {
    console.error("Error fetching item quantity:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
};
