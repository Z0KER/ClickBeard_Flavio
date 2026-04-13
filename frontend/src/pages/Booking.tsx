import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useBookingStore } from '../store/bookingStore'
import {
    format,
    parseISO,
    addDays,
    setHours,
    setMinutes,
    isBefore,
    isSameDay,
    startOfDay,
    getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Scissors,
    User,
    Calendar,
    Clock,
    ChevronLeft,
    CheckCircle,
} from 'lucide-react'
import styles from './Booking.module.css'

interface Specialty {
    id: string
    name: string
}
interface Barber {
    id: string
    name: string
}

export default function Booking() {
    const [step, setStep] = useState(1)
    const [specialties, setSpecialties] = useState<Specialty[]>([])
    const [barbers, setBarbers] = useState<Barber[]>([])
    const [availableDays, setAvailableDays] = useState<Date[]>([])
    const [occupiedTimes, setOccupiedTimes] = useState<string[]>([])
    const [availableTimes, setAvailableTimes] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const {
        specialty,
        barber,
        selectedDate,
        setSpecialty,
        setBarber,
        setDate,
        reset,
    } = useBookingStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (step === 1) fetchSpecialties()
        if (step === 2) fetchBarbers()
        if (step === 3) generateAvailableDays()
        if (step === 4) fetchOccupiedTimes()
    }, [step, specialty, barber, selectedDate])

    async function fetchSpecialties() {
        setLoading(true)
        try {
            const { data } = await api.get('/specialties')
            setSpecialties(data)
        } catch (err) {
            setError('Erro ao carregar especialidades')
        } finally {
            setLoading(false)
        }
    }

    async function fetchBarbers() {
        if (!specialty) return
        setLoading(true)
        try {
            const { data } = await api.get(
                `/barbers?specialtyId=${specialty.id}`,
            )
            setBarbers(data)
        } catch (err) {
            setError('Erro ao carregar barbeiros')
        } finally {
            setLoading(false)
        }
    }

    function generateAvailableDays() {
        const days = []
        let current = new Date()

        while (days.length < 7) {
            // Se for domingo (0), pula
            if (getDay(current) !== 0) {
                days.push(new Date(current))
            }
            current = addDays(current, 1)
        }
        setAvailableDays(days)
    }

    async function fetchOccupiedTimes() {
        if (!barber || !selectedDate) return
        setLoading(true)
        setOccupiedTimes([])
        setAvailableTimes([])
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd')
            const { data } = await api.get(
                `/appointments/availability?barberId=${barber.id}&date=${dateStr}`,
            )
            // Normalizar para HH:mm para facilitar comparação
            const occupied = data.map((d: string) =>
                format(parseISO(d), 'HH:mm'),
            )
            setOccupiedTimes(occupied)
            generateTimeSlots(occupied)
        } catch (err) {
            setError('Erro ao carregar horários')
        } finally {
            setLoading(false)
        }
    }

    function generateTimeSlots(occupied: string[]) {
        const slots: string[] = []
        let current = setMinutes(setHours(new Date(), 8), 0)
        const end = setHours(new Date(), 18)

        while (isBefore(current, end)) {
            slots.push(format(current, 'HH:mm'))
            current = new Date(current.getTime() + 30 * 60000)
        }
        setAvailableTimes(slots)
    }

    async function handleFinish() {
        if (!specialty || !barber || !selectedDate) return

        setLoading(true)
        try {
            await api.post('/appointments', {
                specialtyId: specialty.id,
                barberId: barber.id,
                startTime: selectedDate.toISOString(),
            })
            reset()
            alert('Agendamento realizado com sucesso!')
            navigate('/dashboard')
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Erro ao realizar agendamento',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <button
                    onClick={() =>
                        step > 1 ? setStep(step - 1) : navigate('/dashboard')
                    }
                >
                    <ChevronLeft /> Voltar
                </button>
                <h1>Agendamento</h1>
                <div className={styles.steps}>Passo {step} de 4</div>
            </header>

            <main className={styles.content}>
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <h2>Escolha a Especialidade</h2>
                        <div className={styles.selectionGrid}>
                            {specialties.map(s => (
                                <button
                                    key={s.id}
                                    className={`${styles.item} ${specialty?.id === s.id ? styles.selected : ''}`}
                                    onClick={() => {
                                        setSpecialty(s)
                                        setStep(2)
                                    }}
                                >
                                    <Scissors />
                                    <span>{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <h2>Escolha o Barbeiro</h2>
                        <div className={styles.selectionGrid}>
                            {barbers.map(b => (
                                <button
                                    key={b.id}
                                    className={`${styles.item} ${barber?.id === b.id ? styles.selected : ''}`}
                                    onClick={() => {
                                        setBarber(b)
                                        setStep(3)
                                    }}
                                >
                                    <User />
                                    <span>{b.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <h2>Escolha o Dia</h2>
                        <div className={styles.selectionGrid}>
                            {availableDays.map(day => (
                                <button
                                    key={day.toISOString()}
                                    className={`${styles.item} ${selectedDate && isSameDay(selectedDate, day) ? styles.selected : ''}`}
                                    onClick={() => {
                                        setDate(startOfDay(day))
                                        setStep(4)
                                    }}
                                >
                                    <Calendar />
                                    <div className={styles.dayInfo}>
                                        <span className={styles.dayName}>
                                            {format(day, 'EEEE', {
                                                locale: ptBR,
                                            })}
                                        </span>
                                        <span className={styles.dayDate}>
                                            {format(day, 'dd/MM')}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <h2>
                            Escolha o Horário (
                            {selectedDate && format(selectedDate, 'dd/MM')})
                        </h2>
                        <div className={styles.timeGrid}>
                            {availableTimes.map(time => {
                                const [h, m] = time.split(':')
                                const isOccupied = occupiedTimes.includes(time)

                                // Se for hoje, não permitir horários passados
                                const slotDate = setMinutes(
                                    setHours(
                                        new Date(selectedDate!),
                                        Number(h),
                                    ),
                                    Number(m),
                                )
                                const isPast = isBefore(slotDate, new Date())

                                return (
                                    <button
                                        key={time}
                                        disabled={isOccupied || isPast}
                                        className={`${styles.timeItem} ${selectedDate?.getTime() === slotDate.getTime() ? styles.timeSelected : ''} ${isOccupied ? styles.occupied : ''}`}
                                        onClick={() => setDate(slotDate)}
                                    >
                                        <Clock size={16} /> {time}
                                        {isOccupied && (
                                            <span
                                                className={styles.occupiedLabel}
                                            >
                                                (Reservado)
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            className={styles.finishBtn}
                            disabled={
                                !selectedDate ||
                                loading ||
                                occupiedTimes.includes(
                                    format(selectedDate, 'HH:mm'),
                                )
                            }
                            onClick={handleFinish}
                        >
                            {loading ? (
                                'Processando...'
                            ) : (
                                <>
                                    Confirmar Agendamento{' '}
                                    <CheckCircle size={20} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
