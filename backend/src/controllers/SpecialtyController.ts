import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'

export class SpecialtyController {
    async list(_req: Request, res: Response) {
        const specialties = await prisma.specialty.findMany({
            orderBy: { name: 'asc' },
        })
        return res.json(specialties)
    }
}
