import {z} from "zod"

export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(4),
  role: z.enum(["student", "teacher"])
}
)

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(4)
})

export const classSchema = z.object({
  className: z.string()
})


