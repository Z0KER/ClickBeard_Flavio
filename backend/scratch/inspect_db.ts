import { prisma } from '../src/lib/prisma.js'

async function main() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        barber: true,
        specialty: true
      },
      orderBy: { startTime: 'asc' }
    })
    
    console.log('COUNT:', appointments.length)
    appointments.forEach((app: any) => {
      console.log(`[${app.id}] Barber: ${app.barber.name} | Time: ${app.startTime.toISOString()} | Status: ${app.status}`)
    })
  } catch (err) {
    console.error('Error fetching appointments:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
