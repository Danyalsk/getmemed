import express, { Router } from "express";

import { idParamsSchema } from "../contracts/common";
import { IMAGE_CONTENT_TYPES, IMAGE_MAX_BYTES } from "../contracts/image";
import { authenticate, requireRole, getAuthUser } from "../middleware/auth";
import { findImageById, storeImage } from "../services/image.service";

export const imageRouter = Router();

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

imageRouter.post(
  "/",
  authenticate,
  requireRole("brand"),
  express.raw({ type: [...IMAGE_CONTENT_TYPES], limit: IMAGE_MAX_BYTES }),
  async (req, res, next) => {
    try {
      const image = await storeImage(getAuthUser(req)._id, req.body);
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  },
);

imageRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const image = await findImageById(id);
    res
      .set({
        "Content-Type": image.contentType,
        "Cache-Control": `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
        "Cross-Origin-Resource-Policy": "cross-origin",
      })
      .send(image.data);
  } catch (error) {
    next(error);
  }
});
