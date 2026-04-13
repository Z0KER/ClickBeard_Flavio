import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation error.',
            issues: err.format(),
        })
    }

    if (err.message.includes('Unique constraint failed')) {
        if (err.message.includes('appointments_barberId_startTime_key')) {
            return res.status(409).json({
                message:
                    'Este barbeiro já possui um agendamento neste horário.',
            })
        }
        if (err.message.includes('users_email_key')) {
            return res
                .status(409)
                .json({ message: 'Este e-mail já está em uso.' })
        }
    }

    console.error(err)

    return res.status(500).json({
        message: 'Internal server error.',
    })
}
