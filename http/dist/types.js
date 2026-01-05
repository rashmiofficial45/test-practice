"use strict";
/**
 * @file types.ts
 * @description Zod validation schemas for request bodies and application types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceSchema = exports.addStudentSchema = exports.classSchema = exports.signInSchema = exports.signUpSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for user signup.
 */
exports.signUpSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(4),
    role: zod_1.z.enum(["student", "teacher"])
});
/**
 * Validation schema for user login.
 */
exports.signInSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(4)
});
/**
 * Validation schema for creating a new class.
 */
exports.classSchema = zod_1.z.object({
    className: zod_1.z.string()
});
/**
 * Validation schema for adding a student to a class.
 */
exports.addStudentSchema = zod_1.z.object({
    studentId: zod_1.z.string()
});
/**
 * Validation schema for starting an attendance session.
 */
exports.attendanceSchema = zod_1.z.object({
    classId: zod_1.z.string()
});
