import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, LogOut, Scissors, User, Mail } from 'lucide-react'
import styles from './Dashboard.module.css'

interface Appointment {
    id: string
    startTime: string
    status: 'SCHEDULED' | 'CANCELED'
    client: { name: string; email: string }
    barber: { name: string }
    specialty: { name: string }
}

export default function AdminDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const { logout } = useAuthStore()

    useEffect(() => {
        fetchAdminAppointments()
    }, [])

    async function fetchAdminAppointments() {
        try {
            const { data } = await api.get('/admin/appointments')
            setAppointments(data)
        } catch (err) {
            console.error('Erro ao buscar agenda admin')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <Scissors color="var(--primary-color)" />
                    <span>ClickBeard Admin</span>
                </div>
                <button onClick={logout} className={styles.logoutBtn}>
                    Sair <LogOut size={18} />
                </button>
            </header>

            <main className={styles.content}>
                <div className={styles.sectionHeader}>
                    <h2>Agenda da Barbearia</h2>
                </div>

                {loading ? (
                    <p className={styles.loading}>Carregando agenda...</p>
                ) : appointments.length === 0 ? (
                    <p className={styles.empty}>
                        Nenhum agendamento futuro encontrado.
                    </p>
                ) : (
                    <div className={styles.grid}>
                        {appointments.map(app => (
                            <div
                                key={app.id}
                                className={`${styles.card} ${app.status === 'CANCELED' ? styles.canceled : ''}`}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.specialtyIcon}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3
                                            style={{
                                                color: 'var(--primary-color)',
                                            }}
                                        >
                                            {app.client.name}
                                        </h3>
                                        <p className={styles.barberName}>
                                            <Mail size={14} />{' '}
                                            {app.client.email}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 15 }}>
                                    <p style={{ fontSize: '0.9rem' }}>
                                        <strong>Serviço:</strong>{' '}
                                        {app.specialty.name}
                                    </p>
                                    <p style={{ fontSize: '0.9rem' }}>
                                        <strong>Barbeiro:</strong>{' '}
                                        {app.barber.name}
                                    </p>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.info}>
                                        <Calendar size={14} />
                                        {format(
                                            parseISO(app.startTime),
                                            'dd/MM/yyyy',
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
