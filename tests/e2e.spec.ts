import request from "supertest";
import app from "../src/app";
import { db } from "../src/config";
import { Item, Lot } from "../src/models";

describe("Item Controller", () => {
  beforeAll(async () => {
    await db.authenticate();
    await Item.sync({ force: true });
    await Lot.sync({ force: true });
  });

  afterAll(async () => {
    await db.close();
  });

  describe("POST /:item/add", () => {
    it("should add a new item lot", async () => {
      const response = await request(app)
        .post("/testItem/add")
        .send({ quantity: 10, expiry: new Date(Date.now() + 10000).toISOString() });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({});
    });
  });

  describe("POST /:item/sell", () => {
    it("should sell an existing item", async () => {
      // First, add an item
      await request(app)
        .post("/testItem/add")
        .send({
          quantity: 10,
          expiry: new Date(Date.now() + 10000).toISOString(),
        });

      // Then, try to sell it
      const response = await request(app)
        .post("/testItem/sell")
        .send({ quantity: 5 });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it("should return an error when trying to sell more than available", async () => {
      const response = await request(app)
        .post("/testItem/sell")
        .send({ quantity: 20 });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Not enough quantity available",
      });
    });
  });

  describe("GET /:item/quantity", () => {
    it("should return the correct quantity and validTill for an existing item", async () => {
      const expiry = new Date(Date.now() + 10000).toISOString();
      await request(app).post("/testItem/add").send({ quantity: 10, expiry });

      const response = await request(app).get("/testItem/quantity");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("quantity");
      expect(response.body).toHaveProperty("validTill");
      expect(response.body.quantity).toBe(10);
      expect(new Date(response.body.validTill).getTime()).toBeCloseTo(
        new Date(expiry).getTime(),
        -1
      ); // Allow some margin due to processing time
    });

    it("should return 0 quantity and null validTill for a non-existent item", async () => {
      const response = await request(app).get("/nonExistentItem/quantity");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ quantity: 0, validTill: null });
    });
  });
});
