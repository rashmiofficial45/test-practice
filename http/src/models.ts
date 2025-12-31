import mongoose , { Schema } from "mongoose"

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["teacher", "student"]
  }
})

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

const attendanceSchema = new Schema({
  classId:{
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

const User = mongoose.model("User", userSchema)
const Class = mongoose.model("Class", classSchema)
const Attendance = mongoose.model("Attendance", attendanceSchema)
export { User, Class, Attendance }