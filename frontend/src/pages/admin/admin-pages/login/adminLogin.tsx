// frontend/src/pages/AdminLogin.tsx
import React from 'react';
import './adminLogin.css';
import { authenticate } from '../../../../services/auth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already logged in, skip login page and go to dashboard
    useEffect(() => {
        if (authenticate.isLoggedIn()) {
            navigate('/admin');
        }
    }, [navigate]);



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('')

        if (!email || !password) {
            setError("Email and password must be provided");
            return;
        }

        setLoading(true);
        try {

            const response = await authenticate.login(email, password);
            if (response?.status !== 200) {
                setError(response.data.message || "Invalid email or password");
                return;
            }

            localStorage.setItem("token", response.data.data.token);
            navigate("/admin");

        } catch (error: any) {
            setError(error?.response?.data?.message || "Something went wrong, please try again.");
        } finally {
            setLoading(false)
        }


    }
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Admin Login</h2>
                    <p>LogisticLens Courier Services</p>
                </div>

                {error && (<div className="error-message" style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '12px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', border: '1px solid #f5c6cb', fontSize: '14px' }}>
                    {error}
                </div>)}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="admin@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "loging in .." : "login"}
                    </button>
                </form>


            </div>
        </div>
    );
};

export default AdminLogin;