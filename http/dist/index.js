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
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
mongoose_1.default.connect(process.env.MONGO_URL || "").then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield models_1.User.create({
        name: "Atlas Check",
        email: "atlas@test.com",
        password: "123456",
        role: "student"
    });
    res.send("User created");
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
