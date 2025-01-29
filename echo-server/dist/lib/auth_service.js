"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = comparePasswords;
exports.hashPassword = hashPassword;
const crypto_1 = require("crypto");
function comparePasswords(userPassword, storedPassword, storedSalt) {
    const hashedUserPassword = (0, crypto_1.scryptSync)(userPassword, storedSalt, 64).toString('hex');
    return hashedUserPassword === storedPassword;
}
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const hashedPassword = (0, crypto_1.scryptSync)(password, salt, 64).toString('hex');
    return { password: hashedPassword, salt: salt };
}
