import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.post(`${API_URL}/api/admin/forgot-password`, { email });
    setMsg(res.data.message);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <form onSubmit={submit} className="bg-parchment p-10 max-w-md w-full rounded shadow-xl">
        <h1 className="text-2xl font-serif text-gray-900 mb-6 text-center">Reset Password</h1>
        {msg ? (
          <div className="text-green-700 bg-green-50 p-4 rounded text-sm text-center">{msg}</div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-6 text-center">Enter your admin email to receive a secure reset link.</p>
            <input type="email" placeholder="Admin Email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-3 border rounded mb-4" />
            <button type="submit" className="w-full bg-[#86691c] text-white py-3 rounded font-medium tracking-wider">SEND LINK</button>
          </>
        )}
        <div className="text-center mt-6">
          <Link to="/admin/login" className="text-sm text-gray-500 hover:underline">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}