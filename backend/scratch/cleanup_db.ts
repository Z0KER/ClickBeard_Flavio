import { prisma } from '../src/lib/prisma.js'

async function main() {
  try {
    const appointments = await prisma.appointment.findMany()
    console.log(`Encontrados ${appointments.length} agendamentos.`)

    for (const app of appointments as any[]) {
      const normalizedTime = new Date(app.startTime)
      normalizedTime.setSeconds(0)
      normalizedTime.setMilliseconds(0)

      if (normalizedTime.getTime() !== app.startTime.getTime()) {
        console.log(`Normalizando agendamento ${app.id}: ${app.startTime.toISOString()} -> ${normalizedTime.toISOString()}`)
        
        try {
          await prisma.appointment.update({
            where: { id: app.id },
            data: { 
              startTime: normalizedTime,
              endTime: new Date(normalizedTime.getTime() + 30 * 60000)
            }
          })
        } catch (err: any) {
          if (err.code === 'P2002') {
            console.error(`ERRO: Ao normalizar ${app.id}, houve conflito com outro agendamento já existente no mesmo horário. Deletando duplicata...`)
            await prisma.appointment.delete({ where: { id: app.id } })
          } else {
            throw err
          }
        }
      }
    }
    console.log('Dados normalizados com sucesso.')
  } catch (err) {
    console.error('Erro na normalização:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
