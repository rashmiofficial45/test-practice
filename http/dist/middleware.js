"use strict";
/**
 * @file middleware.ts
 * @description Authentication and authorization middlewares for protected routes.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentMiddleware = exports.teacherMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header and attaches userId and role to the request.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
const authMiddleware = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                "success": false,
                "error": "Unauthorized, token missing or invalid"
            });
        }
        const { userId, role } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = userId;
        req.role = role;
        next();
    }
    catch (error) {
        return res.status(401).json({
            "success": false,
            "error": "Unauthorized, token missing or invalid"
        });
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Teacher authorization middleware.
 * Ensures the authenticated user has the "teacher" role.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
const teacherMiddleware = (req, res, next) => {
    if (req.role !== "teacher") {
        res.status(403).json({
            "success": false,
            "error": "Forbidden, teacher access required"
        });
        return; // Added return to prevent double next() if logic changes later
    }
    next();
};
exports.teacherMiddleware = teacherMiddleware;
/**
 * Student authorization middleware.
 * Ensures the authenticated user has the "student" role.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
const studentMiddleware = (req, res, next) => {
    if (req.role !== "student") {
        res.status(403).json({
            "success": false,
            "error": "Forbidden, not a student"
        });
        return; // Added return to prevent double next() if logic changes later
    }
    next();
};
exports.studentMiddleware = studentMiddleware;
