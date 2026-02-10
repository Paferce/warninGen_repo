import React from 'react';
import { Send, Bell, Users, Layout, Plus, FileText } from 'lucide-react';

const Dashboard = ({ estadisticas, contactos, plantillas, setVista, iniciarFlujoAlerta }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Enviados Total</p>
                            <p className="text-3xl font-bold text-gray-800">{estadisticas.enviados}</p>
                        </div>
                        <Send className="text-primary-600" size={40} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pendientes</p>
                            <p className="text-3xl font-bold text-gray-800">{estadisticas.pendientes}</p>
                        </div>
                        <Bell className="text-yellow-500" size={40} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Contactos Activos</p>
                            <p className="text-3xl font-bold text-gray-800">{contactos.filter(c => c.activo).length}</p>
                        </div>
                        <Users className="text-green-500" size={40} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Plantillas</p>
                            <p className="text-3xl font-bold text-gray-800">{plantillas.length}</p>
                        </div>
                        <Layout className="text-purple-500" size={40} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setVista('contactos')}
                        className="bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo Contacto
                    </button>
                    <button
                        onClick={iniciarFlujoAlerta}
                        className="bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                    >
                        <Send size={20} />
                        Crear Alerta
                    </button>
                    <button
                        onClick={() => setVista('informes')}
                        className="bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                    >
                        <FileText size={20} />
                        Ver Informes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
