"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("./models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("./types");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
mongoose_1.default.connect(process.env.MONGO_URL || "").then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error(err);
});
app.use(express_1.default.json());
app.post("/auth/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { success, data } = types_1.signUpSchema.safeParse(yield (req.body));
        if (!success) {
            res.status(400).json({
                "success": false,
                "error": "Invalid data"
            });
            return;
        }
        const existingUser = yield models_1.User.findOne({
            email: data.email,
        });
        if (existingUser) {
            res.status(400).json({
                "success": false,
                "error": "Email already exists"
            });
        }
        const user = yield models_1.User.create({
            email: data.email,
            name: data.name,
            password: data.password,
            role: data.role
        });
        res.status(201).json({
            "success": true,
            "data": {
                "_id": user._id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            },
        });
    }
    catch (error) {
        console.error("Error: ", error);
        res.status(500).json({
            "success": false,
            "error": "Internal Server Error"
        });
    }
}));
app.post("/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { success, data } = types_1.signInSchema.safeParse(yield (req.body));
        if (!success) {
            res.status(401).json({
                "success": false,
                "error": "Invalid data"
            });
            return;
        }
        const user = yield models_1.User.findOne({
            email: data.email,
            password: data.password
        });
        if (!user) {
            res.status(401).json({
                "success": false,
                "error": "Invalid email or password"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).json({
            "success": true,
            "data": {
                "token": token
            }
        });
    }
    catch (error) {
        console.error("Error: ", error);
        res.status(500).json({
            "success": false,
            "error": "Internal Server Error"
        });
    }
}));
app.get("/auth/me", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield models_1.User.findOne({
            _id: req.userId
        });
        if (!user) {
            res.status(401).json({
                "success": false,
                "error": "Unauthorized"
            });
            return;
        }
        res.status(200).json({
            "success": true,
            "data": {
                "_id": user._id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        });
    }
    catch (error) {
        console.error("Error: ", error);
        res.status(500).json({
            "success": false,
            "error": "Internal Server Error"
        });
    }
}));
app.post("/class", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success, data } = types_1.classSchema.safeParse(yield (req.body));
    if (!success) {
        res.status(400).json({
            "success": false,
            "error": "Invalid data"
        });
        return;
    }
    const userId = req.userId;
    const role = req.role;
    if (role !== "teacher") {
        res.status(401).json({
            "success": false,
            "error": "Unauthorized"
        });
        return;
    }
    const newClass = yield models_1.Class.create({
        className: data.className,
        teacherId: userId,
        studentsId: []
    });
    if (!newClass) {
        res.status(500).json({
            "success": false,
            "error": "Internal Server Error"
        });
        return;
    }
    res.status(200).json({
        "success": true,
        "data": {
            "_id": newClass._id,
            "className": newClass.className,
            "teacherId": newClass.teacherId,
            "studentIds": newClass.studentsId
        }
    });
}));
app.post("/class/:id/add-student", middleware_1.authMiddleware, middleware_1.teacherMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { success, data } = types_1.addStudentSchema.safeParse(yield (req.body));
    if (!success) {
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema"
        });
        return;
    }
    const teacherId = req.userId;
    const classId = req.params.id;
    const studentsId = data.studentId;
    const isTeacherOwner = yield models_1.Class.findOne({
        _id: classId
    });
    // console.log(isTeacherOwner?.teacherId) //new ObjectId('695660ac76069f6a091434e2')
    // console.log(teacherId) //695660ac76069f6a091434e2
    if (((_a = isTeacherOwner === null || isTeacherOwner === void 0 ? void 0 : isTeacherOwner.teacherId) === null || _a === void 0 ? void 0 : _a.toString()) !== teacherId) {
        res.status(403).json({
            "success": false,
            "error": "Forbidden, not class teacher"
        });
    }
    const addStudent = yield models_1.Class.findOneAndUpdate({
        _id: classId,
        teacherId: teacherId
    }, {
        $addToSet: { studentsId: studentsId } // prevents duplicates
    }, {
        new: true
    });
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
    });
}));
app.get("/class/:id", middleware_1.authMiddleware, middleware_1.teacherMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teacherId = req.userId;
    const classId = req.params.id;
    const classExist = yield models_1.Class.findOne({
        _id: classId
    });
    if (!classExist) {
        res.json(404).json({
            "success": false,
            "error": "Class not found"
        });
    }
    const studentsInClass = yield models_1.User.find({
        _id: { $in: classExist === null || classExist === void 0 ? void 0 : classExist.studentsId }
    });
    if (!studentsInClass) {
        res.status(404).json({
            "success": false,
            "error": "Student not found"
        });
        return;
    }
    res.status(200).json({
        "success": true,
        "data": {
            "_id": classId,
            "className": classExist === null || classExist === void 0 ? void 0 : classExist.className,
            "teacherId": classExist === null || classExist === void 0 ? void 0 : classExist.teacherId,
            "students": studentsInClass.map((student) => ({
                id: student._id,
                name: student.name,
                email: student.email
            }))
        }
    });
}));
app.get("/students", middleware_1.authMiddleware, middleware_1.teacherMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield models_1.User.find({ role: "student" });
    if (!student) {
        res.status(404).json({
            "success": false,
            "error": "Student not found"
        });
        return;
    }
    res.status(200).json({
        "success": true,
        "data": student.map((s) => ({
            _id: s.id,
            name: s.name,
            email: s.email
        }))
    });
}));
app.get("/teachers", middleware_1.authMiddleware, middleware_1.teacherMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = yield models_1.User.find({ role: "teacher" });
    if (!teacher) {
        res.status(404).json({
            "success": false,
            "error": "Teacher not found"
        });
        return;
    }
    res.status(200).json({
        "success": true,
        "data": teacher.map((t) => ({
            _id: t.id,
            name: t.name,
            email: t.email
        }))
    });
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
