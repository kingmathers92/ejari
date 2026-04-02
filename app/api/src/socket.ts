import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma";

interface AuthSocket extends Socket {
  userId?: string;
}

export function initSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token as string;

    if (!token) {
      return next(new Error("Authentication required — provide token in handshake.auth"));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      socket.userId = payload.id;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    console.log(`[Socket] ${socket.userId} connected`);

    socket.on("join_booking", async (bookingId: string) => {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { property: true },
      });

      if (!booking) {
        return socket.emit("error", { message: "Booking not found" });
      }

      const isParticipant =
        booking.guestId === socket.userId ||
        booking.property.hostId === socket.userId;

      if (!isParticipant) {
        return socket.emit("error", { message: "You are not part of this booking" });
      }

      socket.join(bookingId);
      socket.emit("joined", { bookingId });

      const unreadCount = await prisma.message.count({
        where: {
          bookingId,
          isRead: false,
          senderId: { not: socket.userId },
        },
      });

      socket.emit("unread_count", { bookingId, count: unreadCount });
    });

    socket.on("send_message", async ({ bookingId, content }: { bookingId: string; content: string }) => {
      if (!content?.trim()) return;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { property: true },
      });

      if (!booking) return;

      const isParticipant =
        booking.guestId === socket.userId ||
        booking.property.hostId === socket.userId;

      if (!isParticipant) return;

      // Save to db
      const message = await prisma.message.create({
        data: {
          bookingId,
          senderId: socket.userId!,
          content: content.trim(),
        },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      });

      io.to(bookingId).emit("new_message", message);
    });

    socket.on("mark_read", async (bookingId: string) => {
      await prisma.message.updateMany({
        where: {
          bookingId,
          senderId: { not: socket.userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      io.to(bookingId).emit("messages_read", { bookingId, readBy: socket.userId });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.userId} disconnected`);
    });
  });

  return io;
}