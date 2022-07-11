"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const data_1 = require("../data");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const page = path_1.default.join(config_1.HTML_FILES_PATH, 'game.html');
    res.sendFile(page);
});
router.get('/texts/:id', (req, res) => {
    const id = req.params.id;
    res.send(JSON.stringify(data_1.texts[id]));
});
exports.default = router;
