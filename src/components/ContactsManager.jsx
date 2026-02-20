import React from 'react';
import { Edit2, Plus, UserX, UserCheck, Trash2 } from 'lucide-react';

const ContactsManager = ({
    contactos,
    nuevoContacto,
    setNuevoContacto,
    contactoEditando,
    guardarContacto,
    iniciarEdicionContacto,
    cancelarEdicionContacto,
    darDeBajaContacto,
    reactivarContacto,
    eliminarContacto
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Contactos</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {contactoEditando ? 'Editar Contacto' : 'Nuevo Contacto'}
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                            <input
                                type="text"
                                value={nuevoContacto.nombre}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, nombre: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={nuevoContacto.email}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                                placeholder="email@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                            <input
                                type="tel"
                                value={nuevoContacto.telefono}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, telefono: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                                placeholder="+34666777888"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                            <input
                                type="tel"
                                value={nuevoContacto.whatsapp}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, whatsapp: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                                placeholder="+34666777888"
                            />
                        </div>

                        {/* NUEVO: Tipo de Usuario */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario *</label>
                            <select
                                value={nuevoContacto.tipo_usuario}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, tipo_usuario: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                            >
                                <option value="Residente">Residente</option>
                                <option value="Empresa">Empresa</option>
                                <option value="Institución">Institución</option>
                                <option value="Colaborador">Colaborador</option>
                            </select>
                        </div>

                        {/* NUEVO: Tipo de Punto Crítico */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Punto Crítico</label>
                            <select
                                value={nuevoContacto.tipo_punto_critico}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, tipo_punto_critico: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                            >
                                <option value="Hospital">Hospital</option>
                                <option value="Colegio">Colegio</option>
                                <option value="Residencia">Residencia</option>
                                <option value="Centro Comercial">Centro Comercial</option>
                                <option value="Camping">Camping</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Zona</label>
                            <select
                                value={nuevoContacto.zona}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, zona: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                            <select
                                value={nuevoContacto.distrito}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, distrito: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                            <input
                                type="text"
                                value={nuevoContacto.ciudad}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, ciudad: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                                placeholder="Ciudad"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                            <input
                                type="text"
                                value={nuevoContacto.pais}
                                onChange={(e) => setNuevoContacto({ ...nuevoContacto, pais: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                                placeholder="País"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Suscripciones</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={nuevoContacto.suscrito_email}
                                    onChange={(e) => setNuevoContacto({ ...nuevoContacto, suscrito_email: e.target.checked })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm text-gray-700">Email</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={nuevoContacto.suscrito_sms}
                                    onChange={(e) => setNuevoContacto({ ...nuevoContacto, suscrito_sms: e.target.checked })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm text-gray-700">SMS</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={nuevoContacto.suscrito_whatsapp}
                                    onChange={(e) => setNuevoContacto({ ...nuevoContacto, suscrito_whatsapp: e.target.checked })}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm text-gray-700">WhatsApp</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={guardarContacto}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                        >
                            {contactoEditando ? (
                                <>
                                    <Edit2 size={20} />
                                    Guardar Cambios
                                </>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Guardar Contacto
                                </>
                            )}
                        </button>

                        {contactoEditando && (
                            <button
                                onClick={cancelarEdicionContacto}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Contactos</h3>

                {contactos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay contactos registrados</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo Usuario</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Punto Crítico</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactos.map((contacto) => (
                                    <tr key={contacto.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-800">{contacto.nombre}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{contacto.email || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{contacto.tipo_usuario}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{contacto.tipo_punto_critico || '-'}</td>
                                        <td className="py-3 px-4">
                                            {contacto.activo ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Activo</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Inactivo</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => iniciarEdicionContacto(contacto)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                                >
                                                    <Edit2 size={16} />
                                                    Editar
                                                </button>
                                                {contacto.activo ? (
                                                    <button
                                                        onClick={() => darDeBajaContacto(contacto.id)}
                                                        className="text-orange-500 hover:text-orange-700 text-sm flex items-center gap-1"
                                                    >
                                                        <UserX size={16} />
                                                        Dar de baja
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => reactivarContacto(contacto.id)}
                                                        className="text-green-500 hover:text-green-700 text-sm flex items-center gap-1"
                                                    >
                                                        <UserCheck size={16} />
                                                        Reactivar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => eliminarContacto(contacto.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsManager;
