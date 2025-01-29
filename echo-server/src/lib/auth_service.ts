import {randomBytes, scryptSync} from 'crypto'

export function comparePasswords(userPassword: string, storedPassword: string, storedSalt: string): boolean {
    const hashedUserPassword = scryptSync(userPassword, storedSalt, 64).toString('hex')
    return hashedUserPassword === storedPassword
}

export function hashPassword(password: string): { password: string , salt: string } {
    const salt = randomBytes(16).toString('hex')
    const hashedPassword = scryptSync(password, salt, 64).toString('hex')
    return {password: hashedPassword, salt: salt}
}
