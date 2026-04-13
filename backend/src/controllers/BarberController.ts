import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'

export class BarberController {
    async list(req: Request, res: Response) {
        const { specialtyId } = req.query

        const barbers = await prisma.barber.findMany({
            where: specialtyId
                ? {
                      specialties: {
                          some: {
                              specialtyId: String(specialtyId),
                          },
                      },
                  }
                : {},
            include: {
                specialties: {
                    include: {
                        specialty: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        })

        return res.json(barbers)
    }
}
