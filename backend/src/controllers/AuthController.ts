import type { Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

export class AuthController {
    async register(req: Request, res: Response) {
        const registerSchema = z.object({
            name: z.string().min(3),
            email: z.email(),
            password: z.string().min(6),
        })

        const { name, email, password } = registerSchema.parse(req.body)

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        })

        return res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    }

    async login(req: Request, res: Response) {
        const loginSchema = z.object({
            email: z.email(),
            password: z.string(),
        })

        const { email, password } = loginSchema.parse(req.body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        const secret = process.env.JWT_SECRET || 'super-secret'
        const token = jwt.sign({ role: user.role }, secret, {
            subject: user.id,
            expiresIn: '1d',
        })

        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        })
    }
}
