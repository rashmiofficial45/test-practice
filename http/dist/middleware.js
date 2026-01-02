"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const teacherMiddleware = (req, res, next) => {
    if (req.role !== "teacher") {
        res.status(403).json({
            "success": false,
            "error": "Forbidden, teacher access required"
        });
    }
    next();
};
exports.teacherMiddleware = teacherMiddleware;
