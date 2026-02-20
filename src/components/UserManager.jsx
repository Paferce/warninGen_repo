import React, { useState } from 'react';
import { Edit2, Plus, UserX, UserCheck, Trash2, Eye, EyeOff } from 'lucide-react';

const UserManager = ({
    usuarios,
    nuevoUsuario,
    setNuevoUsuario,
    usuarioEditando,
    guardarUsuario,
    iniciarEdicionUsuario,
    cancelarEdicionUsuario,
    toggleUsuario,
    eliminarUsuario,
    usuario // Usuario actual logueado
}) => {
    const [mostrarPasswordUsuario, setMostrarPasswordUsuario] = useState(false);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {usuarioEditando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                            <input
                                type="text"
                                value={nuevoUsuario.nombre}
                                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                value={nuevoUsuario.email}
                                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                placeholder="usuario@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña {usuarioEditando ? '(dejar vacío para no cambiar)' : '*'}
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrarPasswordUsuario ? "text" : "password"}
                                    value={nuevoUsuario.password}
                                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onMouseDown={() => setMostrarPasswordUsuario(true)}
                                    onMouseUp={() => setMostrarPasswordUsuario(false)}
                                    onMouseLeave={() => setMostrarPasswordUsuario(false)}
                                    onTouchStart={() => setMostrarPasswordUsuario(true)}
                                    onTouchEnd={() => setMostrarPasswordUsuario(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {mostrarPasswordUsuario ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                            <select
                                value={nuevoUsuario.rol}
                                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white cursor-pointer"
                            >
                                <option value="operador">Operador</option>
                                <option value="supervisor">Supervisor</option>
                                {(usuario?.rol === 'superadministrador') && (
                                    <>
                                        <option value="administrador">Administrador</option>
                                        <option value="superadministrador">Superadministrador</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Información sobre roles:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li><strong>Operador:</strong> Puede crear y enviar alertas</li>
                            <li><strong>Supervisor:</strong> Puede gestionar contactos y plantillas</li>
                            {usuario?.rol === 'superadministrador' && (
                                <>
                                    <li><strong>Administrador:</strong> Puede gestionar operadores y supervisores</li>
                                    <li><strong>Superadministrador:</strong> Acceso total al sistema</li>
                                </>
                            )}
                        </ul>
                        {usuario?.rol === 'administrador' && (
                            <p className="text-xs text-blue-700 mt-2 italic">
                                Como Administrador, solo puedes crear usuarios con rol Operador o Supervisor.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={guardarUsuario}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                        >
                            {usuarioEditando ? (
                                <>
                                    <Edit2 size={20} />
                                    Guardar Cambios
                                </>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Crear Usuario
                                </>
                            )}
                        </button>

                        {usuarioEditando && (
                            <button
                                onClick={cancelarEdicionUsuario}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Usuarios</h3>

                {(() => {
                    // Filtrar usuarios según permisos
                    let usuariosFiltrados = usuarios;
                    if (usuario?.rol === 'administrador') {
                        // Administrador solo ve operadores y supervisores
                        usuariosFiltrados = usuarios.filter(u =>
                            u.rol === 'operador' || u.rol === 'supervisor'
                        );
                    }

                    return usuariosFiltrados.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay usuarios registrados</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rol</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha Creación</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados.map((usr) => (
                                        <tr key={usr.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-800">{usr.nombre}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{usr.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs rounded ${usr.rol === 'superadministrador' ? 'bg-purple-100 text-purple-700' :
                                                    usr.rol === 'administrador' ? 'bg-blue-100 text-blue-700' :
                                                        usr.rol === 'supervisor' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {usr.rol}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(usr.fecha_creacion).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                {usr.activo ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Activo</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Inactivo</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    {usr.id !== usuario?.id && (
                                                        <>
                                                            <button
                                                                onClick={() => iniciarEdicionUsuario(usr)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                                            >
                                                                <Edit2 size={16} />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => toggleUsuario(usr.id)}
                                                                className={`text-sm flex items-center gap-1 ${usr.activo
                                                                    ? 'text-orange-500 hover:text-orange-700'
                                                                    : 'text-green-500 hover:text-green-700'
                                                                    }`}
                                                            >
                                                                {usr.activo ? (
                                                                    <>
                                                                        <UserX size={16} />
                                                                        Desactivar
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck size={16} />
                                                                        Activar
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarUsuario(usr.id)}
                                                                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                                                            >
                                                                <Trash2 size={16} />
                                                                Eliminar
                                                            </button>
                                                        </>
                                                    )}
                                                    {usr.id === usuario?.id && (
                                                        <span className="text-sm text-gray-500 italic">Tu cuenta</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default UserManager;
