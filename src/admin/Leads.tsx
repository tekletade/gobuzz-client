import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  language: string;
  interest: string | null;
  status: string;
  created_at: string;
  founding_number: number | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  registered: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const url = search
        ? `${API_URL}/api/admin/leads/search?q=${encodeURIComponent(search)}`
        : `${API_URL}/api/admin/leads${filter ? `?status=${filter}` : ''}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    await axios.patch(
      `${API_URL}/api/admin/leads/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadLeads();
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Are you sure? Deleting a Founding Member will free up their spot.')) return;
    await axios.delete(`${API_URL}/api/admin/leads/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadLeads();
  };

  const exportCSV = async () => {
    const res = await axios.get(`${API_URL}/api/admin/leads/export`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads.csv');
    document.body.appendChild(link);
    link.click();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      await axios.patch(`${API_URL}/api/admin/leads/${editingLead.id}/details`, editingLead, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingLead(null);
      loadLeads();
    } catch (error) {
      alert('Failed to update lead details.');
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Leads & Members</h1>
          <p className="text-gray-600 text-sm mt-1">
            {leads.length} lead{leads.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-[#86691c] text-white px-6 py-3 tracking-widest hover:bg-[#6b5416] transition text-sm rounded shadow-sm"
        >
          EXPORT CSV
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 mb-6 rounded-lg border border-gray-200 shadow-sm flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
          className="flex-1 min-w-[240px] px-4 py-3 border border-gray-300 outline-none focus:border-[#86691c] focus:ring-1 focus:ring-[#86691c] text-sm rounded text-gray-900"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 outline-none focus:border-[#86691c] focus:ring-1 focus:ring-[#86691c] text-sm rounded text-gray-900 bg-white"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="registered">Registered</option>
          <option value="converted">Converted</option>
        </select>
        <button
          onClick={loadLeads}
          className="bg-gray-900 text-white px-6 py-3 text-sm tracking-widest rounded hover:bg-gray-800 transition"
        >
          SEARCH
        </button>
      </div>

      {/* EDIT MODAL */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-serif mb-4">Edit Lead Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">First Name</label>
                <input type="text" value={editingLead.first_name} onChange={(e) => setEditingLead({...editingLead, first_name: e.target.value})} className="w-full p-2 border rounded outline-none focus:border-[#86691c]" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name</label>
                <input type="text" value={editingLead.last_name} onChange={(e) => setEditingLead({...editingLead, last_name: e.target.value})} className="w-full p-2 border rounded outline-none focus:border-[#86691c]" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" value={editingLead.email} onChange={(e) => setEditingLead({...editingLead, email: e.target.value})} className="w-full p-2 border rounded outline-none focus:border-[#86691c]" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input type="text" value={editingLead.phone} onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})} className="w-full p-2 border rounded outline-none focus:border-[#86691c]" required />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="submit" className="flex-1 bg-[#86691c] text-white py-2 rounded font-medium hover:bg-[#6b5416]">Save Changes</button>
              <button type="button" onClick={() => setEditingLead(null)} className="px-4 py-2 border rounded font-medium hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">ID</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">NAME</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">CONTACT</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">LANG</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">STATUS</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">FOUNDING</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">DATE</th>
                <th className="p-3 text-left text-xs font-semibold tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading leads...</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-3 text-sm text-gray-700">{lead.id}</td>
                  <td className="p-3 text-sm text-gray-900 font-medium">
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-gray-900">{lead.email}</p>
                    <p className="text-xs text-gray-500">{lead.phone}</p>
                  </td>
                  <td className="p-3 text-sm text-gray-700 uppercase">{lead.language}</td>
                  <td className="p-3">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded border-0 outline-none cursor-pointer ${
                        statusColors[lead.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="registered">Registered</option>
                      <option value="converted">Converted</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {lead.founding_number ? (
                      <span className="bg-[#86691c] text-white text-xs font-bold px-2 py-1 rounded inline-block">
                        ★ #{lead.founding_number}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="text-[#86691c] text-sm font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600 text-sm font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && leads.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No leads found.</p>
          </div>
        )}
      </div>
    </div>
  );
}