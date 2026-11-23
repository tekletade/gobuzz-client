import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Stats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  foundingMembers: number;
  foundingRemaining: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    axios
      .get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data.data))
      .catch(console.error);
  }, [token]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#86691c] space-y-4">
        <div className="w-12 h-12 border-4 border-[#86691c] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif text-xl animate-pulse">Loading Go'Buzz Data...</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Leads', value: stats.totalLeads, color: 'text-[#1b1710]', bg: 'bg-white', icon: '👥' },
    { label: 'New Leads', value: stats.newLeads, color: 'text-blue-700', bg: 'bg-blue-50', icon: '✨' },
    { label: 'Contacted', value: stats.contactedLeads, color: 'text-green-700', bg: 'bg-green-50', icon: '📞' },
    { label: 'Founding Members', value: stats.foundingMembers, color: 'text-[#86691c]', bg: 'bg-[#86691c]/10', icon: '★' },
    { label: 'Spots Remaining', value: stats.foundingRemaining, color: 'text-red-700', bg: 'bg-red-50', icon: '⏳' },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* HERO BANNER */}
      <div className="bg-[#1b1710] rounded-2xl p-6 sm:p-10 text-[#f5f1e6] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#86691c] rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-3">Welcome back.</h1>
          <p className="text-[#8a7f6a] text-sm sm:text-base max-w-lg leading-relaxed">
            Here is the latest overview of your Go'Buzz ecosystem. Your founding members are waiting.
          </p>
        </div>
      </div>

      {/* STATS CARDS (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} p-6 rounded-2xl shadow-sm border border-[#1b1710]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 tracking-widest uppercase">
                {card.label}
              </p>
              <span className="text-xl opacity-50">{card.icon}</span>
            </div>
            <p className={`text-4xl sm:text-5xl font-serif ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#1b1710]/5 shadow-sm">
        <h2 className="text-2xl font-serif text-[#1b1710] mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/leads"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#1b1710] text-[#f5f1e6] text-sm tracking-widest rounded-xl hover:bg-black transition-colors uppercase font-medium"
          >
            <span>👥</span> View Leads
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#86691c] text-white text-sm tracking-widest rounded-xl hover:bg-[#6b5416] transition-colors uppercase font-medium shadow-md"
          >
            <span>⚙️</span> Edit Content
          </Link>
          <Link
            to="/admin/posts"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-[#86691c] text-[#86691c] text-sm tracking-widest rounded-xl hover:bg-[#86691c]/5 transition-colors uppercase font-medium"
          >
            <span>📝</span> Create Post
          </Link>
        </div>
      </div>
    </div>
  );
}