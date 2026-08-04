import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión');
                return;
            }

            login(data.token, data.usuario);
            navigate('/');
        } catch {
            setError('No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">MO GROUP</h1>
                    <p className="text-slate-400 mt-1 text-sm">Portal administrativo</p>
                </div>

                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-slate-800 px-6 py-4">
                        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                            <LogIn className="w-5 h-5" />
                            Iniciar Sesión
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Usuario
                            </label>
                            <input
                                type="text"
                                required
                                autoFocus
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Ingresa tu usuario"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                                    placeholder="Ingresa tu contraseña"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
