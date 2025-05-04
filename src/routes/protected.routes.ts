import express from "express";
import { protectedRoute } from "../controllers/protected.controllers";
import { verifyTokenMiddleware } from "../utils/jwt";

const router = express.Router();

router.get("/protected", verifyTokenMiddleware, protectedRoute);

export default router;
