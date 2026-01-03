import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({
        "success": false,
        "error": "Unauthorized, token missing or invalid"
      })
    }

    const { userId, role } = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.userId = userId
    req.role = role
    next()
  } catch (error) {
    return res.status(401).json({
      "success": false,
      "error": "Unauthorized, token missing or invalid"
    })
  }
}

export const teacherMiddleware = (req:Request, res:Response, next:NextFunction) => {
  if (req.role !== "teacher") {
    res.status(403).json(
      {
        "success": false,
        "error": "Forbidden, teacher access required"
      }
    )
  }
  next()
}

export const studentMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== "student") {
    res.status(403).json(
      {
        "success": false,
        "error": "Forbidden, not a student"
      }
    )
  }
  next()
}
