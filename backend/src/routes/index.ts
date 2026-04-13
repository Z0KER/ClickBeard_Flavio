import express from 'express'
import { authRoutes } from './authRoutes.js'
import { BarberController } from '../controllers/BarberController.js'
import { SpecialtyController } from '../controllers/SpecialtyController.js'
import { AppointmentController } from '../controllers/AppointmentController.js'
import { authMiddleware, adminOnly } from '../middlewares/authMiddleware.js'

const routes = express.Router()

const barberController = new BarberController()
const specialtyController = new SpecialtyController()
const appointmentController = new AppointmentController()

// Public Routes
routes.use('/auth', authRoutes)

// Protected Routes
routes.use(authMiddleware)

// Specialties & Barbers
routes.get('/specialties', specialtyController.list)
routes.get('/barbers', barberController.list)

// Appointments
routes.get('/appointments/availability', appointmentController.getAvailability)
routes.post('/appointments', appointmentController.create)
routes.get('/appointments/me', appointmentController.listMine)
routes.patch('/appointments/:id/cancel', appointmentController.cancel)

// Admin Routes
routes.get('/admin/appointments', adminOnly, appointmentController.listForAdmin)

export { routes }
