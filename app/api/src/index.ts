import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";

import authRoutes     from "./routes/auth";
import propertyRoutes from "./routes/properties";
import bookingRoutes  from "./routes/bookings";
import paymentRoutes  from "./routes/payments";
import { initSocket } from "./socket";

const app    = express();
const server = createServer(app);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use("/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));

app.use("/auth",       authRoutes);
app.use("/properties", propertyRoutes);
app.use("/bookings",   bookingRoutes);
app.use("/payments",   paymentRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV, ts: new Date().toISOString() });
});

app.all('/*splat', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Unhandled error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

initSocket(server);

const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
  console.log(`[API] http://localhost:${PORT}  (${process.env.NODE_ENV})`);
});

export { app, server };