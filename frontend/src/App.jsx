import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import Movimientos from './pages/Movimientos';
import Productos   from './pages/Productos';
import Proveedores from './pages/Proveedores';
import Clientes    from './pages/Clientes';
import Categorias  from './pages/Categorias';
import Almacenes   from './pages/Almacenes';
import Unidades    from './pages/Unidades';
import Compras     from './pages/Compras';
import Ventas      from './pages/Ventas';
import Usuarios    from './pages/Usuarios';
import Perfil      from './pages/Perfil';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-white text-sm">Cargando...</div>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.rol !== 'admin') return <Navigate to="/" replace />;
    return children;
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/login"       element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/movimientos" element={<ProtectedRoute><Movimientos /></ProtectedRoute>} />
            <Route path="/productos"   element={<ProtectedRoute><Productos /></ProtectedRoute>} />
            <Route path="/categorias"  element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
            <Route path="/almacenes"   element={<ProtectedRoute><Almacenes /></ProtectedRoute>} />
            <Route path="/unidades"    element={<ProtectedRoute><Unidades /></ProtectedRoute>} />
            <Route path="/compras"     element={<ProtectedRoute><Compras /></ProtectedRoute>} />
            <Route path="/ventas"      element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
            <Route path="/proveedores" element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
            <Route path="/clientes"    element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/usuarios"    element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
            <Route path="/perfil"      element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <NotificationProvider>
                    <AppRoutes />
                </NotificationProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}
