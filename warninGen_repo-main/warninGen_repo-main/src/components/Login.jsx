import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';

const Login = ({ loginData, setLoginData, handleLogin, errorLogin }) => {
    const [mostrarPassword, setMostrarPassword] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
                        <Shield className="text-primary-600" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Asistente de Comunicación Inmediato</h1>
                    <p className="text-gray-600 mt-2">Acceso para administradores</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                            placeholder="admin@ejemplo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onMouseDown={() => setMostrarPassword(true)}
                                onMouseUp={() => setMostrarPassword(false)}
                                onMouseLeave={() => setMostrarPassword(false)}
                                onTouchStart={() => setMostrarPassword(true)}
                                onTouchEnd={() => setMostrarPassword(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {errorLogin && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {errorLogin}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                        <Key size={20} />
                        Iniciar Sesión
                    </button>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <p className="font-semibold mb-2">Demo - Usuarios de prueba:</p>
                    <div className="space-y-1">
                        <p>Operador: operador@ejemplo.com / admin123</p>
                        <p>Supervisor: supervisor@ejemplo.com / admin123</p>
                        <p>Administrador: admin@ejemplo.com / admin123</p>
                        <p>Superadmin: superadmin@ejemplo.com / admin123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
