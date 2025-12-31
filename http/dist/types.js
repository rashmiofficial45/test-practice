"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceSchema = exports.classSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    email: zod_1.z.email(),
    name: zod_1.z.string().min(3),
    password: zod_1.z.string().min(4),
    role: zod_1.z.enum(["student", "teacher"])
});
exports.classSchema = zod_1.z.object({
    className: zod_1.z.string().min(3),
    studentsId: zod_1.z.array(zod_1.z.string()),
    teacherId: zod_1.z.string()
});
exports.attendanceSchema = zod_1.z.object({
    classId: zod_1.z.string(),
    studentId: zod_1.z.string(),
    status: zod_1.z.enum(["present", "absent"])
});
