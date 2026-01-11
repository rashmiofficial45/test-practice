

import WebSocket from "ws";
import axios from "axios";

const API_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3000";

let teacherToken: string;
let studentToken: string;
let classId: string;
let studentId: string;

async function runTest() {
  try {
    console.log("Starting verification...");

    // 1. Signup Teacher
    console.log("Registering Teacher...");
    const teacherEmail = `teacher_${Date.now()}@test.com`;
    const teacherRes = await axios.post(`${API_URL}/auth/signup`, {
      email: teacherEmail,
      name: "Teacher Test",
      password: "password123",
      role: "teacher",
    });
    // teacherToken = teacherRes.data.data.token; // Signup doesn't return token usually, login does
    console.log("Teacher Registered");

    // 2. Login Teacher
    console.log("Logging in Teacher...");
    const teacherLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: teacherEmail,
      password: "password123",
    });
    teacherToken = teacherLoginRes.data.data.token;
    console.log("Teacher Logged In");

    // 3. Signup Student
    console.log("Registering Student...");
    const studentEmail = `student_${Date.now()}@test.com`;
    const studentRes = await axios.post(`${API_URL}/auth/signup`, {
      email: studentEmail,
      name: "Student Test",
      password: "password123",
      role: "student",
    });
    studentId = studentRes.data.data._id;
    console.log("Student Registered");

    // 4. Login Student
    console.log("Logging in Student...");
    const studentLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: studentEmail,
      password: "password123",
    });
    studentToken = studentLoginRes.data.data.token;
    console.log("Student Logged In");

    // 5. Create Class
    console.log("Creating Class...");
    const classRes = await axios.post(
      `${API_URL}/class`,
      { className: "WS Attendance 101" },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    classId = classRes.data.data._id;
    console.log("Class Created:", classId);

    // 6. Add Student to Class
    console.log("Adding Student to Class...");
    await axios.post(
      `${API_URL}/class/${classId}/add-student`,
      { studentId: studentId },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    console.log("Student Added to Class");

    // 7. Start Attendance Session
    console.log("Starting Attendance Session...");
    await axios.post(
      `${API_URL}/attendance/start`,
      { classId: classId },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    console.log("Attendance Session Started");

    // 8. Connect WebSocket
    console.log("Connecting to WebSocket...");
    const ws = new WebSocket(`${WS_URL}?token=${studentToken}`);

    ws.on("open", () => {
      console.log("WebSocket Connected");
      // 9. Mark Attendance
      console.log("Sending mark_attendance...");
      ws.send(JSON.stringify({ type: "mark_attendance", classId: classId }));
    });

    ws.on("message", (data) => {
      console.log("Received WebSocket Message:", data.toString());
      const message = JSON.parse(data.toString());
      if (message.type === "success") {
        console.log("TEST PASSED: Attendance marked successfully");
        process.exit(0);
      } else if (message.type === "error") {
        console.error("TEST FAILED: " + message.message);
        process.exit(1);
      }
      else if (message.type === "info") {
        console.log("TEST INFO: " + message.message);
        process.exit(0);
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket Error:", err);
      process.exit(1);
    });

    ws.on("close", (code, reason) => {
      console.log(`WebSocket Closed: ${code} ${reason}`);
    });


  } catch (error: any) {
    console.error("Test Failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

runTest();
