import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Booking from './pages/Booking'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({
    children,
    adminOnly = false,
}: {
    children: React.ReactNode
    adminOnly?: boolean
}) {
    const { user } = useAuthStore()

    if (!user) {
        return <Navigate to="/login" />
    }

    if (adminOnly && user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" />
    }

    return <>{children}</>
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/booking"
                    element={
                        <ProtectedRoute>
                            <Booking />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
