import express, { Router } from "express";

import { idParamsSchema } from "../contracts/common";
import { IMAGE_CONTENT_TYPES, IMAGE_MAX_BYTES } from "../contracts/image";
import { authenticate, requireRole, requireUser } from "../middleware/auth";
import { findImage, saveImage } from "../services/image.service";

export const imageRouter = Router();

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

imageRouter.post(
  "/",
  authenticate,
  requireRole("brand"),
  express.raw({ type: [...IMAGE_CONTENT_TYPES], limit: IMAGE_MAX_BYTES }),
  async (req, res, next) => {
    try {
      const image = await saveImage(requireUser(req)._id, req.body);
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  },
);

// Public so <img> tags work; images are immutable, so they can be cached forever.
imageRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = idParamsSchema.parse(req.params);
    const image = await findImage(id);
    res
      .set({
        "Content-Type": image.contentType,
        "Cache-Control": `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
        // Helmet defaults to same-origin; the web app runs on another origin.
        "Cross-Origin-Resource-Policy": "cross-origin",
      })
      .send(image.data);
  } catch (error) {
    next(error);
  }
});
