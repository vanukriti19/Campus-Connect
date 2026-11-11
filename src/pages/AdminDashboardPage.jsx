import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  Calendar, 
  Users, 
  Percent, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Search
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useRegistrations } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, getEventStatus } from '../utils/formatters';
import StatCard from '../components/admin/StatCard';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage({ 
  onOpenCreateModal, 
  onOpenEditModal, 
  onViewAttendees 
}) {
  const { events, deleteEvent } = useEvents();
  const { registrations } = useRegistrations();
  const { isAdmin, toggleRole, isSupabaseMode, user, signOut } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Compute Analytics
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = registrations.length;
    const totalCapacity = events.reduce((acc, e) => acc + (e.maxCapacity || 0), 0);
    const avgFillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
    const upcomingCount = events.filter((e) => new Date(e.endTime) > new Date()).length;

    return {
      totalEvents,
      totalRegistrations,
      avgFillRate,
      upcomingCount,
    };
  }, [events, registrations]);

  // Filtered Events for table
  const tableEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;
    const q = searchTerm.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.organizerName.toLowerCase().includes(q)
    );
  }, [events, searchTerm]);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#1a1117] rounded-3xl border border-[#382332] p-12 text-center max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#241822] text-[#e89a92] border border-[#382332] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-[#faf3ee] mb-2">
          Admin Console Locked
        </h2>
        {isSupabaseMode ? (
          <>
            <p className="text-sm text-[#bdaaa2] font-light mb-6">
              {user ? (
                <>Your account (<strong>{user.email}</strong>) is currently designated with the <strong>Student</strong> role. Administrative access requires an account with administrator privileges in the database.</>
              ) : (
                <>You must be signed in with an authorized administrator account to access the Event Studio Console.</>
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10] font-mono text-xs font-bold uppercase tracking-wider transition shadow-md shadow-rose-950"
                >
                  Sign Out &amp; Switch Account
                </button>
              ) : (
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10] font-mono text-xs font-bold uppercase tracking-wider transition shadow-md shadow-rose-950"
                >
                  Return to Events
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-[#bdaaa2] font-light mb-6">
              You are currently in <strong>Student Mode</strong>. Toggle to Admin mode to publish new events, monitor student rosters, and inspect analytics.
            </p>
            <button
              type="button"
              onClick={toggleRole}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10] font-mono text-xs font-bold uppercase tracking-wider transition shadow-md shadow-rose-950"
            >
              <ShieldCheck className="w-4 h-4" />
              Switch to Admin View
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#382332]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e131b] text-[#e89a92] text-xs font-mono uppercase tracking-widest mb-2 border border-[#382332]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Studio</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#faf3ee]">
            Event Studio Console
          </h1>
          <p className="text-sm text-[#bdaaa2] font-light mt-1">
            Publish events, monitor student registration fill rates, and export attendee rosters.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10] text-xs font-mono uppercase tracking-widest font-bold shadow-lg shadow-rose-950 transition hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle={`${stats.upcomingCount} upcoming / active`}
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Student Registrations"
          value={stats.totalRegistrations}
          subtitle="Across all campus events"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Average Fill Rate"
          value={`${stats.avgFillRate}%`}
          subtitle="Total capacity utilization"
          icon={Percent}
          color="purple"
        />
        <StatCard
          title="Active Live Events"
          value={stats.upcomingCount}
          subtitle="Accepting registrations"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* Management Table Section */}
      <div className="bg-[#1a1117] rounded-3xl border border-[#382332] shadow-2xl overflow-hidden">
        
        {/* Table Filters & Search */}
        <div className="p-5 border-b border-[#382332] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1e131b]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#e89a92] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search table by title or host..."
              className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
            />
          </div>

          <div className="text-xs font-mono text-[#a89490]">
            DISPLAYING <strong className="text-[#faf3ee]">{tableEvents.length}</strong> EVENTS
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1e131b] text-[#a89490] font-mono uppercase tracking-wider border-b border-[#382332]">
                <th className="p-4">Event Details</th>
                <th className="p-4">Discipline</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Capacity Status</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a1b27]">
              {tableEvents.map((event) => {
                const status = getEventStatus(event);
                const pct = Math.min(
                  100,
                  Math.round(((event.registeredCount || 0) / event.maxCapacity) * 100)
                );

                return (
                  <tr key={event.id} className="hover:bg-[#221620] transition">
                    {/* Event Details */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={event.bannerUrl}
                          alt={event.title}
                          className="w-12 h-12 rounded-xl object-cover border border-[#382332] shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/events/${event.id}`}
                            className="font-bold text-[#faf3ee] hover:text-[#e89a92] truncate block transition"
                          >
                            {event.title}
                          </Link>
                          <span className="text-[11px] font-mono text-[#a89490]">
                            HOST: {event.organizerName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#241822] text-[#e89a92] border border-[#382332] font-mono uppercase text-[10px] font-bold">
                        {event.category}
                      </span>
                    </td>

                    {/* Date & Venue */}
                    <td className="p-4 font-mono text-xs">
                      <div className="font-semibold text-[#faf3ee]">{formatDate(event.startTime)}</div>
                      <div className="text-[11px] text-[#a89490] truncate max-w-[150px]">{event.venue}</div>
                    </td>

                    {/* Capacity */}
                    <td className="p-4 min-w-[140px] font-mono">
                      <div className="flex items-center justify-between text-[11px] text-[#a89490] mb-1">
                        <span>{event.registeredCount || 0} / {event.maxCapacity}</span>
                        <span className="text-[#e89a92] font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-[#120c10] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 90 ? 'bg-[#df7e74]' : 'bg-[#e89a92]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#241822] text-[#e89a92] border border-[#382332]">
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewAttendees(event)}
                          title="View Attendee Roster & Export"
                          className="p-2 text-[#a89490] hover:text-[#e89a92] hover:bg-[#241822] rounded-lg transition"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(event)}
                          title="Edit Event"
                          className="p-2 text-[#a89490] hover:text-[#faf3ee] hover:bg-[#241822] rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(event)}
                          title="Delete Event"
                          className="p-2 text-[#a89490] hover:text-[#df7e74] hover:bg-rose-950/30 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Event"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? All existing student registrations and bookmarks will also be deleted.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
