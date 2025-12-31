import express from "express"
import 'dotenv/config'
import mongoose from "mongoose"
import { User, Class, Attendance } from "./models"
import { userSchema } from "./types"
const app = express()
const port = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URL || "" ).then(() => {
  console.log("Connected to MongoDB")
}).catch((err) => {
  console.log(err)
})

app.post("/auth/signup", async(req, res) => {
  try {
    const {success, data} = userSchema.safeParse(req.body)
    if (!success){
      res.status(400).json(
        {
          "success": false,
          "error": "Email already exists"
        }
      )
      return
    }
    const user = await User.create(data)
    res.status(201).json({
        "success": true,
        "data": data
    })
  } catch (error) {
    console.error("Error: ", error)
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    })
  }
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

