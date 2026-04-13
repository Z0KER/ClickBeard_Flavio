import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Scissors, UserPlus } from 'lucide-react'
import styles from './Login.module.css'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await api.post('/auth/register', { name, email, password })
            navigate('/login')
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    'Erro ao cadastrar. Tente outro e-mail.',
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
                    <p>Junte-se à nossa barbearia exclusiva</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Nome Completo</label>
                        <input
                            type="text"
                            placeholder="Como deseja ser chamado?"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            placeholder="Min. 6 caracteres"
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
                            'Cadastrando...'
                        ) : (
                            <>
                                Cadastrar <UserPlus size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p className={styles.footer}>
                    Já tem conta? <Link to="/login">Faça Login</Link>
                </p>
            </div>
        </div>
    )
}
