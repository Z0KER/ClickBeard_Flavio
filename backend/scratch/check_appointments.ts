import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { startTime: 'asc' }
  })
  
  console.log('--- Agendamentos ---')
  appointments.forEach((app: any) => {
    console.log(`ID: ${app.id} | Barber: ${app.barberId} | Start: ${app.startTime.toISOString()} | Status: ${app.status}`)
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
