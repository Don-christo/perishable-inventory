import app from "./app";
import { db } from "./config";
import Item from "./models/item";
import Lot from "./models/lot";
import { cleanupExpiredLots } from "./services/cleanUpService";

const PORT = process.env.PORT || 3000;

export const initCleanup = () => {
  cleanupExpiredLots();
  setInterval(cleanupExpiredLots, 3600000);
};

async function startServer() {
  try {
    await db.authenticate();
    console.log("Database connected");

    await Item.sync();
    await Lot.sync();
    console.log("Tables synchronized");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Initialize the cleanup service
    initCleanup();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

startServer();
