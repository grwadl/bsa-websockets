"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loginRoutes_1 = __importDefault(require("./loginRoutes"));
const gameRoutes_1 = __importDefault(require("./gameRoutes"));
exports.default = (app) => {
    app.use('/login', loginRoutes_1.default);
    app.use('/game', gameRoutes_1.default);
};
