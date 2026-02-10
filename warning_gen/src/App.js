import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ContactsManager from './components/ContactsManager';
import CreateAlert from './components/CreateAlert';
import UserManager from './components/UserManager';
import PaginaConsentimiento from './PaginaConsentimiento';
import { LogOut, Menu, X, Shield, Users, Bell, FileText, User } from 'lucide-react';

// Ruta Protegida Componente
const ProtectedRoute = ({ children, usuario }) => {
    if (!usuario) return <Navigate to="/" />;
    return children;
};

// Componente Layout Principal
const MainLayout = ({ children, usuario, setUsuario }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUsuario(null);
        navigate('/');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Panel de Control', icon: Shield, path: '/dashboard' },
        { id: 'contactos', label: 'Contactos', icon: Users, path: '/contactos' },
        { id: 'alertas', label: 'Nueva Alerta', icon: Bell, path: '/crear-alerta' },
        { id: 'informes', label: 'Informes', icon: FileText, path: '/informes' },
    ];

    if (usuario?.rol === 'administrador' || usuario?.rol === 'superadministrador') {
        menuItems.push({ id: 'usuarios', label: 'Usuarios', icon: User, path: '/usuarios' });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className={`bg-primary-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                <div className="p-4 flex items-center justify-between border-b border-primary-800">
                    {sidebarOpen && <span className="font-bold text-lg">Sistema Alertas</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-primary-800 rounded">
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 py-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-800 transition ${location.pathname === item.path ? 'bg-primary-800 border-r-4 border-yellow-400' : ''}`}
                                >
                                    <item.icon size={20} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-primary-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 rounded transition text-red-200 hover:text-white">
                        <LogOut size={20} />
                        {sidebarOpen && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Panel de Control'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{usuario?.nombre}</p>
                            <p className="text-xs text-gray-500 capitalize">{usuario?.rol}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                            {usuario?.nombre?.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

function App() {
    const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [contactos, setContactos] = useState([]);
    const [estadisticas] = useState({ enviados: 0, pendientes: 0 }); // removed unused setEstadisticas
    const [plantillas, setPlantillas] = useState([]);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [errorLogin, setErrorLogin] = useState('');

    // Estados para ContactsManager
    const [nuevoContacto, setNuevoContacto] = useState({
        nombre: '', email: '', telefono: '', whatsapp: '',
        tipo_usuario: 'Residente', tipo_punto_critico: 'Hospital',
        zona: '1', distrito: '1', ciudad: '', pais: '',
        suscrito_email: false, suscrito_sms: false, suscrito_whatsapp: false
    });
    const [contactoEditando, setContactoEditando] = useState(null);

    // Estados para UserManager
    const [usuarios] = useState([
        { id: 1, nombre: 'Admin', email: 'admin@ejemplo.com', rol: 'administrador', fecha_creacion: new Date().toISOString(), activo: true },
        { id: 2, nombre: 'Operador', email: 'operador@ejemplo.com', rol: 'operador', fecha_creacion: new Date().toISOString(), activo: true }
    ]);
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', password: '', rol: 'operador' });
    const [usuarioEditando, setUsuarioEditando] = useState(null);

    // Estados para Alertas
    const [alertasPendientes, setAlertasPendientes] = useState([]);
    const [alertasProgramadas, setAlertasProgramadas] = useState([]);

    useEffect(() => {
        if (usuario) {
            fetchContactos();
            fetchPlantillas();
        }
    }, [usuario]);

    const fetchPlantillas = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/plantillas');
            if (res.ok) {
                const data = await res.json();
                setPlantillas(data);
            }
        } catch (error) {
            console.error('Error fetching plantillas:', error);
        }
    };

    const fetchContactos = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/contactos');
            if (res.ok) {
                const data = await res.json();
                setContactos(data);
            }
        } catch (error) {
            console.error('Error fetching contactos:', error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorLogin('');
        try {
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify({ ...data.user, rol: 'administrador' }));
                setUsuario({ ...data.user, rol: 'administrador' });
            } else {
                setErrorLogin(data.error);
            }
        } catch (error) {
            setErrorLogin('Error de conexión con el servidor');
        }
    };

    // --- Handlers Contactos ---
    const guardarContacto = async () => {
        try {
            const url = 'http://localhost:3001/api/contactos';
            const method = 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoContacto)
            });

            if (res.ok) {
                fetchContactos();
                setNuevoContacto({
                    nombre: '', email: '', telefono: '', whatsapp: '',
                    tipo_usuario: 'Residente', tipo_punto_critico: 'Hospital',
                    zona: '1', distrito: '1', ciudad: '', pais: '',
                    suscrito_email: false, suscrito_sms: false, suscrito_whatsapp: false
                });
                setContactoEditando(null);
                alert('Contacto guardado correctamente');
            } else {
                const data = await res.json();
                alert('Error al guardar contacto: ' + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión al guardar contacto');
        }
    };

    const eliminarContacto = async (id) => {
        if (!window.confirm('¿Seguro?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/contactos/${id}`, { method: 'DELETE' });
            if (res.ok) fetchContactos();
        } catch (error) {
            console.error(error);
        }
    }



    const tiposAlerta = [
        { codigo: 'GEN', nombre: 'General' },
        { codigo: 'M20', nombre: 'Meteorológica' }
    ];

    return (
        <Router>
            <Routes>
                {/* Ruta Pública: Consentimiento */}
                <Route path="/consentimiento/:token" element={<PaginaConsentimiento />} />

                {/* Ruta Login */}
                <Route path="/" element={
                    !usuario ? (
                        <Login
                            loginData={loginData}
                            setLoginData={setLoginData}
                            handleLogin={handleLogin}
                            errorLogin={errorLogin}
                        />
                    ) : (
                        <Navigate to="/dashboard" />
                    )
                } />

                {/* Rutas Protegidas */}
                <Route path="/dashboard" element={
                    <ProtectedRoute usuario={usuario}>
                        <MainLayout usuario={usuario} setUsuario={setUsuario}>
                            <Dashboard
                                estadisticas={estadisticas}
                                contactos={contactos}
                                plantillas={plantillas}
                                setVista={() => { }}
                                iniciarFlujoAlerta={() => window.location.href = '/crear-alerta'}
                            />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/contactos" element={
                    <ProtectedRoute usuario={usuario}>
                        <MainLayout usuario={usuario} setUsuario={setUsuario}>
                            <ContactsManager
                                contactos={contactos}
                                nuevoContacto={nuevoContacto}
                                setNuevoContacto={setNuevoContacto}
                                contactoEditando={contactoEditando}
                                guardarContacto={guardarContacto}
                                iniciarEdicionContacto={setContactoEditando}
                                cancelarEdicionContacto={() => setContactoEditando(null)}
                                eliminarContacto={eliminarContacto}
                                darDeBajaContacto={() => { }}
                                reactivarContacto={() => { }}
                            />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/crear-alerta" element={
                    <ProtectedRoute usuario={usuario}>
                        <MainLayout usuario={usuario} setUsuario={setUsuario}>
                            <CreateAlert
                                plantillas={plantillas}
                                contactos={contactos}
                                usuario={usuario}
                                tiposAlerta={tiposAlerta}
                                onVolver={() => window.location.href = '/dashboard'}
                                registrarActividad={() => { }}
                                setAlertasPendientes={setAlertasPendientes}
                                alertasPendientes={alertasPendientes}
                                setAlertasProgramadas={setAlertasProgramadas}
                                alertasProgramadas={alertasProgramadas}
                            />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="/usuarios" element={
                    <ProtectedRoute usuario={usuario}>
                        <MainLayout usuario={usuario} setUsuario={setUsuario}>
                            <UserManager
                                usuarios={usuarios}
                                nuevoUsuario={nuevoUsuario}
                                setNuevoUsuario={setNuevoUsuario}
                                usuarioEditando={usuarioEditando}
                                guardarUsuario={() => { }}
                                iniciarEdicionUsuario={setUsuarioEditando}
                                cancelarEdicionUsuario={() => setUsuarioEditando(null)}
                                eliminarUsuario={() => { }}
                                usuario={usuario}
                            />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
