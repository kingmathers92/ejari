import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import authRoutes from "./routes/auth";
import propertyRoutes from "./routes/properties";

const app = express();

const server = createServer(app);

app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use("/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV,
    ts: new Date().toISOString(),
  });
});

const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
  console.log(`[API] http://localhost:${PORT}  (${process.env.NODE_ENV})`);
});

export { app, server };