/**
 * @file middleware.ts
 * @description Authentication and authorization middlewares for protected routes.
 */

import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"

/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header and attaches userId and role to the request.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
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

/**
 * Teacher authorization middleware.
 * Ensures the authenticated user has the "teacher" role.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
export const teacherMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== "teacher") {
    res.status(403).json(
      {
        "success": false,
        "error": "Forbidden, teacher access required"
      }
    )
    return // Added return to prevent double next() if logic changes later
  }
  next()
}

/**
 * Student authorization middleware.
 * Ensures the authenticated user has the "student" role.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
export const studentMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.role !== "student") {
    res.status(403).json(
      {
        "success": false,
        "error": "Forbidden, not a student"
      }
    )
    return // Added return to prevent double next() if logic changes later
  }
  next()
}
