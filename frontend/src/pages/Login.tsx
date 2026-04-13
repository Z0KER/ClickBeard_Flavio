import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { Scissors, LogIn } from 'lucide-react'
import styles from './Login.module.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const setAuth = useAuthStore(state => state.setAuth)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data } = await api.post('/auth/login', { email, password })
            setAuth(data.user, data.token)

            if (data.user.role === 'ADMIN') {
                navigate('/admin')
            } else {
                navigate('/dashboard')
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    'Falha ao entrar. Verifique suas credenciais.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Scissors size={32} color="var(--primary-color)" />
                    </div>
                    <h1>ClickBeard</h1>
                    <p>Luxo e cuidado para o seu visual</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Senha</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? (
                            'Entrando...'
                        ) : (
                            <>
                                Entrar <LogIn size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p className={styles.footer}>
                    Novo na ClickBeard?{' '}
                    <Link to="/register">Crie sua conta</Link>
                </p>
            </div>
        </div>
    )
}
