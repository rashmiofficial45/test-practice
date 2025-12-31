import {z} from "zod"

export const userSchema = z.object({
  email: z.email(),
  name: z.string().min(3),
  password: z.string().min(4),
  role: z.enum(["student", "teacher"])
}
)

export const classSchema = z.object({
  className: z.string().min(3),
  studentsId: z.array(z.string()),
  teacherId: z.string()
})

export const attendanceSchema = z.object({
  classId: z.string(),
  studentId: z.string(),
  status: z.enum(["present", "absent"])
})


