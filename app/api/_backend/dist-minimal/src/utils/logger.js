"use strict";
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logJournalEntry = exports.logAdjusterInsight = exports.logger = void 0;
const winston = __importStar(require("winston"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// import { config } from '@/config'; // Temporarily disabled
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log colors
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};
// Register color scheme with winston
winston.addColors(colors);
// Define log format
const format = winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
// Define log transports
const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: path.join(logsDir, "error.log"),
        level: "error",
    }),
    new winston.transports.File({ filename: path.join(logsDir, "all.log") }),
];
// Create the logger
exports.logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    levels,
    format,
    transports,
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "exceptions.log"),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "rejections.log"),
        }),
    ],
});
// Export specific logging functions for backwards compatibility
const logAdjusterInsight = (data) => exports.logger.info("Adjuster Insight", data);
exports.logAdjusterInsight = logAdjusterInsight;
const logJournalEntry = (data) => exports.logger.info("Journal Entry", data);
exports.logJournalEntry = logJournalEntry;
// Export default logger
exports.default = exports.logger;
