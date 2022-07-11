"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.HTML_FILES_PATH = exports.STATIC_PATH = void 0;
const path_1 = __importDefault(require("path"));
exports.STATIC_PATH = path_1.default.join(__dirname, '..', 'public');
exports.HTML_FILES_PATH = path_1.default.join(exports.STATIC_PATH, 'html');
exports.PORT = 3002;
