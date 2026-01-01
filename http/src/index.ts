import express from "express"
import 'dotenv/config'
import mongoose from "mongoose"
import { User, Class, Attendance } from "./models"
import jwt from "jsonwebtoken"
import { signUpSchema, signInSchema, classSchema, addStudentSchema } from "./types"
import { authMiddleware } from "./middleware"
const app = express()
const port = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URL || "").then(() => {
  console.log("Connected to MongoDB")
}).catch((err) => {
  console.error(err)
})


app.use(express.json())


app.post("/auth/signup", async (req, res) => {
  try {
    const { success, data } = signUpSchema.safeParse(await (req.body))
    if (!success) {
      res.status(400).json(
        {
          "success": false,
          "error": "Invalid data"
        }
      )
      return
    }
    const existingUser = await User.findOne({
      email: data.email,
    })
    if (existingUser) {
      res.status(400).json(
        {
          "success": false,
          "error": "Email already exists"
        }
      )
    }
    const user = await User.create({
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role
    })
    res.status(201).json({
      "success": true,
      "data": {
        "_id": user._id,
        "email": user.email,
        "name": user.name,
        "role": user.role
      },
    })
  } catch (error) {
    console.error("Error: ", error)
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    })
  }
})


app.post("/auth/login", async (req, res) => {
  try {
    const { success, data } = signInSchema.safeParse(await (req.body))
    if (!success) {
      res.status(401).json(
        {
          "success": false,
          "error": "Invalid data"
        }
      )
      return
    }
    const user = await User.findOne({
      email: data.email,
      password: data.password
    })
    if (!user) {
      res.status(401).json(
        {
          "success": false,
          "error": "Invalid email or password"
        }
      )
      return
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!)
    res.status(200).json({
      "success": true,
      "data": {
        "token": token
      }
    })
  } catch (error) {
    console.error("Error: ", error)
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    })
  }
})


app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.userId
    })
    if (!user) {
      res.status(401).json(
        {
          "success": false,
          "error": "Unauthorized"
        }
      )
      return
    }
    res.status(200).json(
      {
        "success": true,
        "data": {
          "_id": user._id,
          "email": user.email,
          "name": user.name,
          "role": user.role
        }
      }
    )
  } catch (error) {
    console.error("Error: ", error)
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    })
  }
})


app.post("/class", authMiddleware, async (req, res) => {
  const { success, data } = classSchema.safeParse(await (req.body))
  if (!success) {
    res.status(400).json(
      {
        "success": false,
        "error": "Invalid data"
      }
    )
    return
  }
  const userId = req.userId
  const role = req.role
  if (role !== "teacher") {
    res.status(401).json(
      {
        "success": false,
        "error": "Unauthorized"
      }
    )
    return
  }
  const newClass = await Class.create({
    className: data.className,
    teacherId: userId,
    studentsId: []
  })
  if (!newClass) {
    res.status(500).json(
      {
        "success": false,
        "error": "Internal Server Error"
      }
    )
    return
  }
  res.status(200).json(
    {
      "success": true,
      "data": {
        "_id": newClass._id,
        "className": newClass.className,
        "teacherId": newClass.teacherId,
        "studentIds": newClass.studentsId
      }
    }
  )
})


app.post("/class/:id/add-student", authMiddleware, async (req, res) => {
  const { success, data } = addStudentSchema.safeParse(await (req.body))
  if (!success) {
    res.status(400).json({
        "success": false,
        "error": "Invalid request schema"
    })
    return
  }
  if (req.role !== "teacher"){
    res.status(403).json(
      {
        "success": false,
        "error": "Forbidden, teacher access required"
      }
    )
  }
  const teacherId = req.userId
  const classId = req.params.id
  const studentsId = data.studentId

  const isTeacherOwner = await Class.findOne({
    _id: classId
  })
  console.log(isTeacherOwner?.teacherId)
  console.log(teacherId)

  if (isTeacherOwner?.teacherId?.toString() !== teacherId){
    res.status(403).json({
      "success": false,
      "error": "Forbidden, not class teacher"
    })
  }

  const addStudent = await Class.findOneAndUpdate(
    {
      _id: classId,
      teacherId: teacherId
    },
    {
      $addToSet: { studentsId: studentsId } // prevents duplicates
    },
    {
      new: true
    }
  );
  if (!addStudent) {
    return res.status(404).json({
      success: false,
      error: "Class not found or unauthorized"
    });
  }
  res.status(200).json({
    "success": true,
    "data": {
      "_id": addStudent._id,
      "className": addStudent.className,
      "teacherId": addStudent.teacherId,
      "studentIds": addStudent.studentsId
    }
  })

})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

