import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Calendar,
    Clock,
    LogOut,
    Plus,
    User,
    Scissors,
    XCircle,
} from 'lucide-react'
import styles from './Dashboard.module.css'

interface Appointment {
    id: string
    startTime: string
    status: 'SCHEDULED' | 'CANCELED'
    barber: { name: string }
    specialty: { name: string }
}

export default function Dashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchAppointments()
    }, [])

    async function fetchAppointments() {
        try {
            const { data } = await api.get('/appointments/me')
            setAppointments(data)
        } catch (err) {
            console.error('Erro ao buscar agendamentos')
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel(id: string) {
        if (!confirm('Deseja realmente cancelar este agendamento?')) return

        try {
            await api.patch(`/appointments/${id}/cancel`)
            fetchAppointments()
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erro ao cancelar')
        }
    }

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <Scissors color="var(--primary-color)" />
                    <span>ClickBeard</span>
                </div>
                <div className={styles.userMenu}>
                    <span>
                        Olá, <strong>{user?.name}</strong>
                    </span>
                    <button onClick={logout} className={styles.logoutBtn}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <main className={styles.content}>
                <div className={styles.sectionHeader}>
                    <h2>Seus Agendamentos</h2>
                    <button
                        className={styles.addBtn}
                        onClick={() => navigate('/booking')}
                    >
                        <Plus size={20} /> Novo Agendamento
                    </button>
                </div>

                {loading ? (
                    <p className={styles.loading}>Carregando...</p>
                ) : appointments.length === 0 ? (
                    <div className={styles.empty}>
                        <Calendar size={48} />
                        <p>Você ainda não possui agendamentos.</p>
                        <button onClick={() => navigate('/booking')}>
                            Agendar agora
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {appointments.map(app => (
                            <div
                                key={app.id}
                                className={`${styles.card} ${app.status === 'CANCELED' ? styles.canceled : ''}`}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.specialtyIcon}>
                                        <Scissors size={20} />
                                    </div>
                                    <div>
                                        <h3>{app.specialty.name}</h3>
                                        <p className={styles.barberName}>
                                            <User size={14} /> {app.barber.name}
                                        </p>
                                    </div>
                                    {app.status === 'SCHEDULED' && (
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={() => handleCancel(app.id)}
                                            title="Cancelar"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.info}>
                                        <Calendar size={14} />
                                        {format(
                                            parseISO(app.startTime),
                                            "dd 'de' MMMM",
                                            { locale: ptBR },
                                        )}
                                    </div>
                                    <div className={styles.info}>
                                        <Clock size={14} />
                                        {format(
                                            parseISO(app.startTime),
                                            'HH:mm',
                                        )}
                                    </div>
                                    {app.status === 'CANCELED' && (
                                        <span className={styles.statusBadge}>
                                            Cancelado
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
