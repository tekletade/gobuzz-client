import { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/reset-password`, { token, newPassword: password });
      alert('Password reset! Please log in.');
      navigate('/admin/login');
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <form onSubmit={submit} className="bg-parchment p-10 max-w-md w-full rounded shadow-xl">
        <h1 className="text-2xl font-serif text-gray-900 mb-6 text-center">Set New Password</h1>
        {msg && <div className="text-red-600 bg-red-50 p-3 rounded text-sm mb-4">{msg}</div>}
        <input type="password" placeholder="New Password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-3 border rounded mb-4" />
        <button type="submit" className="w-full bg-[#86691c] text-white py-3 rounded font-medium tracking-wider">UPDATE PASSWORD</button>
      </form>
    </div>
  );
}