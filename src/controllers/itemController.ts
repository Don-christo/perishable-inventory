import { Request, Response } from "express";
import { Items } from "../models";
import { Lot } from "../models";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidV4 } from "uuid";

export const addItem = async (req: Request, res: Response) => {
  const { item } = req.params;
  const { quantity, expiry } = req.body;
  const id = uuidV4();
  const lotId = uuidV4();

  let itemInstance = await Items.findOne({ where: { name: item } });

  if (!itemInstance) {
    itemInstance = await Items.create({
      id,
      name: item,
    });
    await Lot.create({
      id: lotId,
      itemId: itemInstance.id,
      quantity,
      expiry,
    });
    res.status(StatusCodes.OK).json({});
  }

  return res.status(StatusCodes.CONFLICT).json({
    message: "Item already exists",
  });
};

export const sellItem = async (req: Request, res: Response) => {
  const { item } = req.params;
  const { quantity } = req.body;

  const itemInstance = await Items.findOne({ where: { name: item } });

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

  res.status(StatusCodes.OK).json({});
};

export const getItemQuantity = async (req: Request, res: Response) => {
  const { item } = req.params;

  const itemInstance = await Items.findOne({ where: { name: item } });

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

  res.status(StatusCodes.OK).json({ quantity: totalQuantity, validTill });
};
