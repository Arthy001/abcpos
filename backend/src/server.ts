import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.json({
    name: "ABC POS & Inventory API Server",
    version: "1.0.0",
    docs: "/api/health",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ABC POS Backend Server running on http://localhost:${PORT}`);
});
