import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyLeaves from './pages/MyLeaves';
import TeamRequests from './pages/TeamRequests';
import AdminPanel from './pages/AdminPanel';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/my-leaves" element={
                        <ProtectedRoute>
                            <Layout>
                                <MyLeaves />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/team-requests" element={
                        <ProtectedRoute roles={['Manager', 'Admin']}>
                            <Layout>
                                <TeamRequests />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute roles={['Admin']}>
                            <Layout>
                                <AdminPanel />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
