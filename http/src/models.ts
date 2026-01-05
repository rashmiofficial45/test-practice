/**
 * @file models.ts
 * @description Mongoose schemas and models for the application's database.
 */

import mongoose, { Schema } from "mongoose"

/**
 * User schema definition.
 * Stores user information including name, email, password, and role.
 */
const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["teacher", "student"]
  }
})

/**
 * Class schema definition.
 * Represents a class with a name, a teacher, and a list of enrolled students.
 */
const classSchema = new Schema({
  className: String,
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  studentsId: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ]
})

/**
 * Attendance schema definition.
 * Records the attendance status of a student for a specific class.
 */
const attendanceSchema = new Schema({
  classId: {
    type: Schema.Types.ObjectId,
    ref: "Class"
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["present", "absent"]
  }
})

// Create and export models
const User = mongoose.model("User", userSchema)
const Class = mongoose.model("Class", classSchema)
const Attendance = mongoose.model("Attendance", attendanceSchema)

export { User, Class, Attendance }