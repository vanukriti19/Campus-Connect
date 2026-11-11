import React, { useState } from 'react';
import { X, Users, Download, Trash2, Search, Mail } from 'lucide-react';
import { useRegistrations } from '../../context/RegistrationContext';
import { formatDate } from '../../utils/formatters';

export default function AttendeeRosterModal({ event, isOpen, onClose }) {
  const { getRegistrationsByEvent, cancelRegistration } = useRegistrations();
  const [search, setSearch] = useState('');

  if (!isOpen || !event) return null;

  const roster = getRegistrationsByEvent(event.id);
  const filteredRoster = roster.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q) ||
      r.studentRollNo.toLowerCase().includes(q) ||
      r.ticketCode.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    if (roster.length === 0) return;
    const headers = ['Student Name', 'Email', 'Roll Number', 'Department', 'Ticket Code', 'Registered At'];
    const rows = roster.map((r) => [
      `"${r.studentName}"`,
      `"${r.studentEmail}"`,
      `"${r.studentRollNo}"`,
      `"${r.department || ''}"`,
      `"${r.ticketCode}"`,
      `"${r.registeredAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d070b]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1117] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#382332] flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#382332] flex items-center justify-between bg-[#1e131b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#241822] text-[#e89a92] border border-[#382332] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee] line-clamp-1">{event.title}</h2>
              <p className="text-xs font-mono text-[#a89490]">
                ATTENDEE ROSTER • <strong className="text-[#e89a92]">{roster.length}</strong> of {event.maxCapacity} seats filled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              disabled={roster.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#e89a92] text-[#120c10] hover:bg-[#f2aba3] disabled:opacity-50 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#a89490] hover:text-[#faf3ee] rounded-lg hover:bg-[#241822] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search within Roster */}
        <div className="p-4 border-b border-[#382332] bg-[#1e131b] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#e89a92] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter roster by student name, roll number, or ticket code..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
            />
          </div>
        </div>

        {/* Table or Empty State */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRoster.length === 0 ? (
            <div className="text-center py-12 text-[#a89490]">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#e89a92]" />
              <p className="font-display text-xl uppercase tracking-tight text-[#faf3ee]">No Attendees Registered</p>
              <p className="text-xs text-[#bdaaa2] font-light mt-1">
                {roster.length === 0 ? 'Nobody has registered for this event yet.' : 'No results match your search query.'}
              </p>
            </div>
          ) : (
            <div className="border border-[#382332] rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1e131b] border-b border-[#382332] text-[#a89490] font-mono uppercase tracking-wider">
                    <th className="p-3">Attendee</th>
                    <th className="p-3">Roll / Dept</th>
                    <th className="p-3">Ticket Code</th>
                    <th className="p-3">Registered On</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a1b27]">
                  {filteredRoster.map((r) => (
                    <tr key={r.id} className="hover:bg-[#221620] transition">
                      <td className="p-3">
                        <div className="font-bold text-[#faf3ee]">{r.studentName}</div>
                        <div className="text-[#a89490] font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#e89a92]" />
                          {r.studentEmail}
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-medium text-[#faf3ee]">{r.studentRollNo}</div>
                        <div className="text-[#a89490] text-[10px]">{r.department || 'General'}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-[#e89a92] bg-[#241822] px-2 py-0.5 rounded text-[11px] font-bold border border-[#382332]">
                          {r.ticketCode}
                        </span>
                      </td>
                      <td className="p-3 text-[#a89490] font-mono text-[11px]">
                        {formatDate(r.registeredAt)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Revoke registration for ${r.studentName}?`)) {
                              cancelRegistration(r.id);
                            }
                          }}
                          title="Revoke registration"
                          className="p-1.5 text-[#a89490] hover:text-[#df7e74] hover:bg-rose-950/30 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
