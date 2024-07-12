import { Router } from "express";
import {
  addItem,
  sellItem,
  getItemQuantity,
} from "../controllers/itemController";

const router = Router();

router.post("/:item/add", addItem);
router.post("/:item/sell", sellItem);
router.get("/:item/quantity", getItemQuantity);

export default router;
