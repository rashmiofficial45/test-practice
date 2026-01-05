"use strict";
/**
 * @file models.ts
 * @description Mongoose schemas and models for the application's database.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendance = exports.Class = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * User schema definition.
 * Stores user information including name, email, password, and role.
 */
const userSchema = new mongoose_1.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
        type: String,
        enum: ["teacher", "student"]
    }
});
/**
 * Class schema definition.
 * Represents a class with a name, a teacher, and a list of enrolled students.
 */
const classSchema = new mongoose_1.Schema({
    className: String,
    teacherId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    studentsId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});
/**
 * Attendance schema definition.
 * Records the attendance status of a student for a specific class.
 */
const attendanceSchema = new mongoose_1.Schema({
    classId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Class"
    },
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["present", "absent"]
    }
});
// Create and export models
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
const Class = mongoose_1.default.model("Class", classSchema);
exports.Class = Class;
const Attendance = mongoose_1.default.model("Attendance", attendanceSchema);
exports.Attendance = Attendance;
