import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        email,
        password,
      });

      localStorage.setItem('adminToken', response.data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.data.admin));
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-parchment p-12 max-w-md w-full"
      >
        <h1 className="text-gold font-serif text-3xl tracking-widest mb-8 text-center">
          GO'BUZZ
        </h1>
        <p className="text-warmgray text-center mb-8 text-sm">Admin Login</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-ink text-sm mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white border border-warmgray/30 text-ink focus:border-gold outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-ink text-sm mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white border border-warmgray/30 text-ink focus:border-gold outline-none"
            required
          />
        </div>

        <div className="flex justify-end mb-6">
  <button type="button" onClick={() => window.location.href='/admin/forgot-password'} className="text-xs text-[#86691c] hover:underline">
    Forgot Password?
  </button>
</div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-white py-3 tracking-widest hover:bg-deepgold transition disabled:opacity-50"
        >
          {loading ? 'LOGGING IN...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
}