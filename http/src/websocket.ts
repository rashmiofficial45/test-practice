
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { User, Class, Attendance } from "./models";

// We need to define activeSession type or import it if better placed
// For now, let's assume we can access it or better yet, maybe we should export it from index or store it in db/memory store
// Since activeSession was a local variable in index.ts, we need to handle that.
// OPTION: Pass activeSession as a getter/setter or object reference?
// BETTER: Move activeSession state management to a separate service or keep it here if it's the only place.
// But wait, index.ts sets activeSession in POST /attendance/start.
// So we need to share this state.
// Simplest solution for now: Create a state manager or just export a mutable object from a new file `state.ts`.

// Let's create a simple state manager in `state.ts` to avoid circular dependencies or complexity.
// But first, let's write this file assuming we have `sessionStore`.
import { sessionStore } from "./session-store";


export function initializeWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: http.IncomingMessage) => {
    const url = req.url;
    if (!url) {
      ws.close(1008, "Token required");
      return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token");

    if (!token) {
      ws.close(1008, "Token required");
      return;
    }

    let userId: string;
    let role: string;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
      userId = decoded.userId;
      role = decoded.role;
    } catch (err) {
      ws.close(1008, "Invalid token");
      return;
    }

    if (role !== "student") {
      ws.close(1008, "Only students can mark attendance");
      return;
    }

    console.log(`Student ${userId} connected`);

    ws.on("message", async (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "mark_attendance") {
          const { classId } = parsedMessage;

          const activeSession = sessionStore.getSession();

          if (!activeSession || activeSession.classId !== classId) {
            ws.send(JSON.stringify({ type: "error", message: "No active session for this class" }));
            return;
          }

          // Check if student is enrolled
          const studentIsEnrolled = await Class.findOne({
            _id: classId,
            studentsId: { $in: [userId] }
          });

          if (!studentIsEnrolled) {
            ws.send(JSON.stringify({ type: "error", message: "You are not enrolled in this class" }));
            return;
          }

          // Check if already marked
          const existingAttendance = await Attendance.findOne({
            classId: classId,
            studentId: userId
          });

          if (existingAttendance) {
            ws.send(JSON.stringify({ type: "info", message: "Attendance already marked" }));
            return;
          }

          // Mark attendance
          await Attendance.create({
            classId: classId,
            studentId: userId,
            status: "present"
          });

          ws.send(JSON.stringify({ type: "success", message: "Attendance marked successfully" }));
        }
      } catch (err) {
        console.error("Error processing message:", err);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });
  });
}
