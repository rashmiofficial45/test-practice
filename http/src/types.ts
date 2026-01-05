/**
 * @file types.ts
 * @description Zod validation schemas for request bodies and application types.
 */

import { z } from "zod"

/**
 * Validation schema for user signup.
 */
export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(["student", "teacher"])
})

/**
 * Validation schema for user login.
 */
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
})

/**
 * Validation schema for creating a new class.
 */
export const classSchema = z.object({
  className: z.string()
})

/**
 * Validation schema for adding a student to a class.
 */
export const addStudentSchema = z.object({
  studentId: z.string()
})

/**
 * Validation schema for starting an attendance session.
 */
export const attendanceSchema = z.object({
  classId: z.string()
})
