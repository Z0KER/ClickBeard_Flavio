import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface TokenPayload {
    sub: string
    role: 'CLIENT' | 'ADMIN'
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: 'Token not provided.' })
    }

    const [, token] = authHeader.split(' ')

    try {
        if (!token) throw new Error()
        const secret = process.env.JWT_SECRET || 'super-secret'
        const decoded = jwt.verify(token, secret) as unknown as TokenPayload

        req.user = {
            id: decoded.sub,
            role: decoded.role,
        }

        return next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' })
    }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admin only.' })
    }
    return next()
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                role: 'CLIENT' | 'ADMIN'
            }
        }
    }
}
