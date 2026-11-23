import { useEffect, useState } from 'react';
import axios from 'axios';
import RichTextEditor from '../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EmailManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const [isFormMinimized, setIsFormMinimized] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });
  
  // Group selection state
  const [selectedGroup, setSelectedGroup] = useState('all');

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('adminToken');

  const loadData = async () => {
    const [logsRes, leadsRes] = await Promise.all([
      axios.get(`${API_URL}/api/admin/email-logs`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_URL}/api/admin/leads`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setLogs(logsRes.data.data);
    setAllLeads(leadsRes.data.data);
    setFilteredLeads(leadsRes.data.data);
  };

  useEffect(() => { loadData(); }, []);

  // Filter leads when the dropdown changes
  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedIds([]); // Clear selections when switching groups

    if (group === 'founding') {
      setFilteredLeads(allLeads.filter(l => l.founding_number != null));
    } else if (group === 'new') {
      setFilteredLeads(allLeads.filter(l => l.status === 'new'));
    } else {
      setFilteredLeads(allLeads);
    }
  };

  const toggleUser = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    // Selects all in the CURRENT filtered view
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(filteredLeads.map(l => l.id)); 
    }
  };

  const sendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) return alert('Subject and message required.');
    if (selectedIds.length === 0) return alert('Please select at least one recipient.');

    if (!confirm(`Send this email to ${selectedIds.length} users?`)) return;

    setSending(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/admin/bulk-email`, {
        subject: form.subject,
        message: form.message,
        leadIds: selectedIds 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMessage(res.data.message);
      setForm({ ...form, subject: '', message: '' });
      setSelectedIds([]);
      loadData();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-[#1b1710]">Email Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Select a group, then pick exactly who receives the email.</p>
      </div>

      {message && <div className="p-4 bg-[#1b1710] text-[#f5f1e6] rounded-lg shadow-md border border-[#86691c]">{message}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT: SEND FORM & PREVIEW */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* COMPOSE BOX */}
          <div className="bg-white rounded-2xl border border-[#1b1710]/10 shadow-sm overflow-hidden transition-all">
            <div 
              className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
              onClick={() => setIsFormMinimized(!isFormMinimized)}
            >
              <h2 className="text-lg font-serif flex items-center gap-2">
                <span>📝</span> Compose Email
              </h2>
              <button className="text-sm font-bold text-[#86691c]">
                {isFormMinimized ? 'Expand ▼' : 'Minimize ▲'}
              </button>
            </div>

            {!isFormMinimized && (
              <form onSubmit={sendBulk} className="p-6 space-y-5 animate-fade-in-up">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-700">Subject Line</label>
                  <input 
                    type="text" required value={form.subject} 
                    onChange={e => setForm({...form, subject: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#86691c]" 
                    placeholder="e.g. Exclusive Opening Event!" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-700">Message Content (use {"{{name}}"} for first name)</label>
                  <RichTextEditor 
                    value={form.message} 
                    onChange={(v) => setForm({...form, message: v})} 
                    placeholder="Write your message here..."
                  />
                </div>

                <button 
                  type="submit" disabled={sending || selectedIds.length === 0}
                  className="w-full bg-[#86691c] text-white py-4 rounded-xl font-bold tracking-wider hover:bg-[#6b5416] transition disabled:opacity-50"
                >
                  {sending ? 'Sending...' : `SEND TO ${selectedIds.length} SELECTED USER${selectedIds.length !== 1 ? 'S' : ''}`}
                </button>
              </form>
            )}
          </div>

          {/* RECIPIENT LIST WITH GROUP FILTER */}
          <div className="bg-white p-6 rounded-2xl border border-[#1b1710]/10 shadow-sm">
            
            {/* Group Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700">Filter Group:</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-[#86691c]"
                >
                  <option value="all">All Leads ({allLeads.length})</option>
                  <option value="founding">Founding Members ({allLeads.filter(l => l.founding_number != null).length})</option>
                  <option value="new">New Leads ({allLeads.filter(l => l.status === 'new').length})</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#86691c]">
                  {selectedIds.length} selected
                </span>
                <button 
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-bold text-gray-500 hover:text-[#1b1710] underline"
                >
                  {selectedIds.length === filteredLeads.length && filteredLeads.length > 0 ? 'Deselect All' : 'Select All Group'}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr 
                      key={lead.id} 
                      onClick={() => toggleUser(lead.id)}
                      className={`cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition ${selectedIds.includes(lead.id) ? 'bg-[#86691c]/5' : ''}`}
                    >
                      <td className="p-3 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => {}} // Handled by row click
                          className="w-4 h-4 accent-[#86691c]"
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-900">{lead.first_name} {lead.last_name}</p>
                        <p className="text-gray-500 text-xs">{lead.email}</p>
                      </td>
                      <td className="p-3 text-right">
                        {lead.founding_number && (
                          <span className="bg-[#86691c] text-white text-[10px] px-2 py-1 rounded font-bold">
                            ★ #{lead.founding_number}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <p className="p-8 text-center text-gray-500 text-sm">No users found in this group.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: LOGS */}
        <div className="bg-white p-6 rounded-2xl border border-[#1b1710]/10 shadow-sm flex flex-col h-[calc(100vh-200px)] sticky top-24">
          <h3 className="text-lg font-serif mb-4 text-[#1b1710]">Recent Logs</h3>
          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3">
            {logs.slice(0, 20).map(log => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-gray-700 truncate max-w-[150px]">{log.email_to}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>{log.status.toUpperCase()}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{log.subject}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}