import express from "express";
import dotenv from "dotenv";
// import authRoutes from './routes/authRoutes';
import authRoutes from "./routes/auth.routes";
import protectedRoutes from "./routes/protected.routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api", protectedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
