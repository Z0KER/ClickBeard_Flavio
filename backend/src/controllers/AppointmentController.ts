import type { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { startOfToday, isBefore, addMinutes, subHours } from 'date-fns'

export class AppointmentController {
    private normalizeDate = (date: Date) => {
        const d = new Date(date)
        d.setSeconds(0)
        d.setMilliseconds(0)
        return d
    }

    getAvailability = async (req: Request, res: Response) => {
        const { barberId, date } = req.query

        if (!barberId || !date) {
            return res
                .status(400)
                .json({ message: 'BarberId e data são obrigatórios.' })
        }

        const start = new Date(`${date}T00:00:00.000Z`)
        const end = new Date(`${date}T23:59:59.999Z`)

        const appointments = await prisma.appointment.findMany({
            where: {
                barberId: barberId as string,
                startTime: {
                    gte: start,
                    lte: end,
                },
                status: 'SCHEDULED',
            },
            select: {
                startTime: true,
            },
        })

        return res.json(
            appointments.map((a: { startTime: Date }) => a.startTime),
        )
    }

    create = async (req: Request, res: Response) => {
        const createSchema = z.object({
            barberId: z.uuid(),
            specialtyId: z.uuid(),
            startTime: z.iso.datetime(),
        })

        const { barberId, specialtyId, startTime } = createSchema.parse(
            req.body,
        )
        const start = this.normalizeDate(new Date(startTime))
        const end = addMinutes(start, 30)

        // 1. Validar horário de funcionamento (8h - 18h)
        const hour = start.getHours()
        if (hour < 8 || hour >= 18) {
            return res.status(400).json({
                message: 'A barbearia funciona apenas das 08h às 18h.',
            })
        }

        // 2. Validar se a data não é no passado
        if (isBefore(start, new Date())) {
            return res
                .status(400)
                .json({ message: 'Não é possível agendar em datas passadas.' })
        }

        // 3. Verificar se o barbeiro tem essa especialidade
        const hasSpecialty = await prisma.barberSpecialty.findUnique({
            where: {
                barberId_specialtyId: { barberId, specialtyId },
            },
        })

        if (!hasSpecialty) {
            return res.status(400).json({
                message: 'Este barbeiro não realiza esta especialidade.',
            })
        }

        // 4. Criar agendamento
        try {
            const appointment = await prisma.appointment.create({
                data: {
                    clientId: req.user!.id,
                    barberId,
                    specialtyId,
                    startTime: start,
                    endTime: end,
                },
            })

            return res.status(201).json(appointment)
        } catch (err: any) {
            if (err.code === 'P2002') {
                return res.status(400).json({
                    message: 'Este horário já está ocupado por outro cliente.',
                })
            }
            throw err
        }
    }

    cancel = async (req: Request, res: Response) => {
        const { id } = req.params

        const appointment = await prisma.appointment.findUnique({
            where: { id: id as string },
        })

        if (!appointment) {
            return res
                .status(404)
                .json({ message: 'Agendamento não encontrado.' })
        }

        // Verificar se o agendamento pertence ao usuário (a menos que seja ADMIN)
        if (
            appointment.clientId !== req.user!.id &&
            req.user!.role !== 'ADMIN'
        ) {
            return res.status(403).json({ message: 'Acesso negado.' })
        }

        // Regra: Cancelar até 2 horas antes
        const limitDate = subHours(appointment.startTime, 2)
        if (isBefore(new Date(), limitDate) || req.user!.role === 'ADMIN') {
            await prisma.appointment.update({
                where: { id: id as string },
                data: { status: 'CANCELED' },
            })
            return res.json({ message: 'Agendamento cancelado com sucesso.' })
        } else {
            return res.status(400).json({
                message:
                    'Cancelamentos só são permitidos com até 2h de antecedência.',
            })
        }
    }

    listMine = async (req: Request, res: Response) => {
        const appointments = await prisma.appointment.findMany({
            where: { clientId: req.user!.id },
            include: {
                barber: true,
                specialty: true,
            },
            orderBy: { startTime: 'desc' },
        })

        return res.json(appointments)
    }

    listForAdmin = async (_req: Request, res: Response) => {
        const today = startOfToday()

        const appointments = await prisma.appointment.findMany({
            where: {
                startTime: {
                    gte: today,
                },
            },
            include: {
                client: {
                    select: { name: true, email: true },
                },
                barber: true,
                specialty: true,
            },
            orderBy: { startTime: 'asc' },
        })

        return res.json(appointments)
    }
}
