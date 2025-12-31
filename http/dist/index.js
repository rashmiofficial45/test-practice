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
    console.log(err);
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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
