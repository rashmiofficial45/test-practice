"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classSchema = exports.signInSchema = exports.signUpSchema = void 0;
const zod_1 = require("zod");
exports.signUpSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.email(),
    password: zod_1.z.string().min(4),
    role: zod_1.z.enum(["student", "teacher"])
});
exports.signInSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(4)
});
exports.classSchema = zod_1.z.object({
    className: zod_1.z.string()
});
