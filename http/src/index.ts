/**
 * @file index.ts
 * @description Main entry point for the HTTP server. Handles authentication, class management, and attendance.
 * Provides RESTful API endpoints and initializes the database connection.
 */

import express from "express"
import 'dotenv/config'
import mongoose from "mongoose"
import { User, Class, Attendance } from "./models"
import jwt from "jsonwebtoken"
import expressWs from "express-ws"

import { signUpSchema, signInSchema, classSchema, addStudentSchema, attendanceSchema } from "./types"
import { authMiddleware, studentMiddleware, teacherMiddleware } from "./middleware"

const app = express()
expressWs(app);
const port = process.env.PORT || 4000

/**
 * Tracks the current active attendance session.
 * Initialized when a teacher starts attendance for a class.
 */
let activeSession: { classId: string; startedAt: Date; attendance: Record<string, string> } | null = null;

/**
 * Establishment of MongoDB connection.
 * Uses environment variable MONGO_URL.
 */
mongoose.connect(process.env.MONGO_URL || "").then(() => {
  console.log("Connected to MongoDB")
}).catch((err) => {
  console.error(err)
})

// Middleware to parse JSON request bodies
app.use(express.json())


app.ws('/ws', function (ws, req) {
  ws.on('message', function (msg) {
    ws.send(msg);
    console.log(msg)
  });
});


/**
 * POST /auth/signup
 * Registers a new user (student or teacher).
 */
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


/**
 * POST /auth/login
 * Authenticates a user and returns a JWT token.
 */
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


/**
 * GET /auth/me
 * Returns information about the currently authenticated user.
 * Protected by authMiddleware.
 */
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


/**
 * POST /class
 * Creates a new class. Only teachers can create classes.
 * Protected by authMiddleware.
 */
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


/**
 * POST /class/:id/add-student
 * Adds a student to a specific class. Only the class teacher can add students.
 * Protected by authMiddleware and teacherMiddleware.
 */
app.post("/class/:id/add-student", authMiddleware, teacherMiddleware, async (req, res) => {
  const { success, data } = addStudentSchema.safeParse(await (req.body))
  if (!success) {
    res.status(400).json({
      "success": false,
      "error": "Invalid request schema"
    })
    return
  }

  const teacherId = req.userId
  const classId = req.params.id
  const studentsId = data.studentId

  const isTeacherOwner = await Class.findOne({
    _id: classId
  })
  // console.log(isTeacherOwner?.teacherId) //new ObjectId('695660ac76069f6a091434e2')
  // console.log(teacherId) //695660ac76069f6a091434e2

  if (isTeacherOwner?.teacherId?.toString() !== teacherId) {
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


/**
 * GET /class/:id
 * Retrieves details of a class, including the list of enrolled students.
 * Protected by authMiddleware and teacherMiddleware.
 */
app.get("/class/:id", authMiddleware, teacherMiddleware, async (req, res) => {
  const teacherId = req.userId
  const classId = req.params.id

  const classExist = await Class.findOne({
    _id: classId
  })
  if (!classExist) {
    res.json(404).json({
      "success": false,
      "error": "Class not found"
    })
  }
  const studentsInClass = await User.find({
    _id: { $in: classExist?.studentsId }
  })
  if (!studentsInClass) {
    res.status(404).json({
      "success": false,
      "error": "Student not found"
    })
    return
  }
  res.status(200).json({
    "success": true,
    "data": {
      "_id": classId,
      "className": classExist?.className,
      "teacherId": classExist?.teacherId,
      "students": studentsInClass.map((student) => ({
        id: student._id,
        name: student.name,
        email: student.email
      }))
    }
  })
})


/**
 * GET /students
 * Retrieves all users with the role "student".
 * Protected by authMiddleware and teacherMiddleware.
 */
app.get("/students", authMiddleware, teacherMiddleware, async (req, res) => {
  const student = await User.find({ role: "student" })
  if (!student) {
    res.status(404).json({
      "success": false,
      "error": "Student not found"
    })
    return
  }
  res.status(200).json({
    "success": true,
    "data": student.map((s) => ({
      _id: s.id,
      name: s.name,
      email: s.email
    }))
  })
})


/**
 * GET /teachers
 * Retrieves all users with the role "teacher".
 * Protected by authMiddleware and teacherMiddleware.
 */
app.get("/teachers", authMiddleware, teacherMiddleware, async (req, res) => {
  const teacher = await User.find({ role: "teacher" })
  if (!teacher) {
    res.status(404).json({
      "success": false,
      "error": "Teacher not found"
    })
    return
  }
  res.status(200).json({
    "success": true,
    "data": teacher.map((t) => ({
      _id: t.id,
      name: t.name,
      email: t.email
    }))
  })
})


/**
 * GET /class/:id/my-attendance
 * Retrieves the attendance record for the current student in a specific class.
 * Protected by authMiddleware and studentMiddleware.
 */
app.get("/class/:id/my-attendance", authMiddleware, studentMiddleware, async (req, res) => {
  const classId = req.params.id
  const studentId = req.userId
  if (!studentId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
  }

  const studentIsEnrolled = await Class.findOne({
    _id: classId,
    studentsId: { $in: [studentId] }
  })
  if (!studentIsEnrolled) {
    return res.status(404).json({
      "success": false,
      "error": "Student not enrolled"
    })
  }

  const markAttendance = await Attendance.findOne({
    classId: classId,
    studentId: studentId,
  })  //nothing is there in this table so every request will show null

  if (markAttendance) {
    return res.status(200).json({
      success: true,
      data: {
        classId: classId,
        status: "present"
      }
    })
  } else {
    return res.status(200).json({
      success: true,
      data: {
        classId: classId,
        status: null
      }
    })
  }

})


/**
 * POST /attendance/start
 * Starts an attendance session for a class. Only the class teacher can start a session.
 * Protected by authMiddleware and teacherMiddleware.
 */
app.post("/attendance/start", authMiddleware, teacherMiddleware, async (req, res) => {
  const { success, data } = attendanceSchema.safeParse(await (req.body))
  if (!success) {
    return res.status(400).json({
      "success": false,
      "error": "Invalid request schema",
    })
  }
  const classId = data.classId
  const classExist = await Class.findOne({
    _id: classId
  })
  if (!classExist || classExist.teacherId !== req.userId) {
    res.status(401).json({
      "success": false,
      "error": "Forbidden, not class teacher"
    })
    return
  }
  activeSession = {
    classId: classId.toString(),
    startedAt: new Date(),
    attendance: {}
  };


  res.status(200).json({
    "success": true,
    "data": {
      "classId": classExist._id,
      "startedAt": Date.now()
    }
  })
})


/**
 * Starts the Express server on the configured port.
 */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

