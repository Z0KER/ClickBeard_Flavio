import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database...')

    // 1. Create Specialties
    const sCorte = await prisma.specialty.upsert({
        where: { name: 'Corte de Cabelo' },
        update: {},
        create: { name: 'Corte de Cabelo' },
    })

    const sBarba = await prisma.specialty.upsert({
        where: { name: 'Barba' },
        update: {},
        create: { name: 'Barba' },
    })

    const sSobrancelha = await prisma.specialty.upsert({
        where: { name: 'Sobrancelha' },
        update: {},
        create: { name: 'Sobrancelha' },
    })

    // 2. Create Barbers
    await prisma.barber.create({
        data: {
            name: 'Gabriel Barber',
            age: 28,
            hireDate: new Date('2023-01-10'),
            specialties: {
                create: [
                    { specialtyId: sCorte.id },
                    { specialtyId: sBarba.id },
                ],
            },
        },
    })

    await prisma.barber.create({
        data: {
            name: 'Thiago Master',
            age: 32,
            hireDate: new Date('2022-05-15'),
            specialties: {
                create: [
                    { specialtyId: sCorte.id },
                    { specialtyId: sSobrancelha.id },
                ],
            },
        },
    })

    // 3. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
        where: { email: 'admin@clickbeard.com' },
        update: {},
        create: {
            name: 'Admin ClickBeard',
            email: 'admin@clickbeard.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    })

    console.log('Seed finished successfully!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
