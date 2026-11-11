import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useEvents } from '../../context/EventContext';

const BANNER_PRESETS = [
  { label: 'Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'AI & Coding', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Music & Concert', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sports', url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Auditorium Talk', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Robotics', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80' },
];

export default function EventFormModal({ isOpen, onClose, initialEvent = null }) {
  const { createEvent, updateEvent } = useEvents();
  const isEditing = !!initialEvent;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    venue: '',
    isVirtual: false,
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    maxCapacity: 100,
    bannerUrl: BANNER_PRESETS[0].url,
    organizerName: '',
    organizerEmail: '',
    tags: 'Campus, Student',
    featured: false,
  });

  const [error, setError] = useState('');

  const toInputDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title || '',
        description: initialEvent.description || '',
        category: initialEvent.category || 'Technical',
        venue: initialEvent.venue || '',
        isVirtual: !!initialEvent.isVirtual,
        startTime: toInputDateTime(initialEvent.startTime),
        endTime: toInputDateTime(initialEvent.endTime),
        registrationDeadline: toInputDateTime(initialEvent.registrationDeadline),
        maxCapacity: initialEvent.maxCapacity || 100,
        bannerUrl: initialEvent.bannerUrl || BANNER_PRESETS[0].url,
        organizerName: initialEvent.organizerName || '',
        organizerEmail: initialEvent.organizerEmail || '',
        tags: (initialEvent.tags || []).join(', '),
        featured: !!initialEvent.featured,
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      tomorrow.setHours(14, 0, 0, 0);

      const endTomorrow = new Date(tomorrow);
      endTomorrow.setHours(18, 0, 0, 0);

      const deadline = new Date(tomorrow);
      deadline.setDate(deadline.getDate() - 1);
      deadline.setHours(23, 59, 0, 0);

      setFormData({
        title: '',
        description: '',
        category: 'Technical',
        venue: 'Campus Innovation Center',
        isVirtual: false,
        startTime: toInputDateTime(tomorrow.toISOString()),
        endTime: toInputDateTime(endTomorrow.toISOString()),
        registrationDeadline: toInputDateTime(deadline.toISOString()),
        maxCapacity: 100,
        bannerUrl: BANNER_PRESETS[0].url,
        organizerName: 'Engineering Student Council',
        organizerEmail: 'events@campus.edu',
        tags: 'Campus, Technical, Workshop',
        featured: false,
      });
    }
    setError('');
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide an event title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter an event description.');
      return;
    }
    if (!formData.venue.trim()) {
      setError('Please provide the event venue or virtual link.');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const deadline = new Date(formData.registrationDeadline);

    if (end <= start) {
      setError('Event End Time must be after Start Time.');
      return;
    }

    if (deadline > start) {
      setError('Registration Deadline must be on or before the Event Start Time.');
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      venue: formData.venue.trim(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      registrationDeadline: deadline.toISOString(),
      maxCapacity: Number(formData.maxCapacity) || 50,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (isEditing) {
      const res = updateEvent(initialEvent.id, payload);
      if (res.success) onClose();
    } else {
      const res = createEvent(payload);
      if (res.success) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d070b]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1117] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#382332] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-7 py-5 border-b border-[#382332] flex items-center justify-between bg-[#1e131b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#241822] text-[#e89a92] border border-[#382332] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee]">
                {isEditing ? 'Edit Event Metadata' : 'Publish College Event'}
              </h2>
              <p className="text-xs font-mono text-[#a89490]">
                {isEditing ? 'Update schedule and admission bounds' : 'Publish to the campus catalog'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#a89490] hover:text-[#faf3ee] rounded-xl hover:bg-[#241822] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 overflow-y-auto space-y-4 flex-1 font-sans">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start gap-2.5 text-xs text-[#df7e74]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Banner Selector & Preview */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1.5 flex items-center justify-between">
              <span>Event Banner</span>
              <span className="text-[10px] text-[#a89490] font-normal">Choose preset or enter image URL</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, bannerUrl: preset.url })}
                  className={`text-[11px] font-mono uppercase px-3 py-1.5 rounded-lg border transition ${
                    formData.bannerUrl === preset.url
                      ? 'bg-[#e89a92] text-[#120c10] border-[#e89a92] font-bold'
                      : 'bg-[#241822] text-[#a89490] border-[#382332] hover:text-[#faf3ee]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
            />
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
              Event Title <span className="text-[#e89a92]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. RoboWars: Annual Battle of Bots"
              className="w-full px-3.5 py-2.5 text-sm bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
            />
          </div>

          {/* Category & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
                Discipline / Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92] cursor-pointer"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
                Seat Capacity <span className="text-[#e89a92]">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                required
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
              />
            </div>
          </div>

          {/* Venue Location */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
              Venue Location <span className="text-[#e89a92]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Auditorium Hall A or Online Meet Link"
              className="w-full px-3.5 py-2.5 text-sm bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
            />
          </div>

          {/* Date & Time Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
                Start Date <span className="text-[#e89a92]">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
                End Date <span className="text-[#e89a92]">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
                Deadline <span className="text-[#e89a92]">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
              Briefing & Highlights <span className="text-[#e89a92]">*</span>
            </label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline event briefing, speaker information, or awards..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92] resize-none"
            />
          </div>

          {/* Organizer & Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
                Organizer Club / Council <span className="text-[#e89a92]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                placeholder="e.g. ACM Student Council"
                className="w-full px-3.5 py-2 text-xs bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#faf3ee] mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="AI, Coding, Hackathon"
                className="w-full px-3.5 py-2 text-xs font-mono bg-[#140c12] border border-[#382332] text-[#faf3ee] rounded-xl focus:outline-none focus:border-[#e89a92]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#382332] flex items-center justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#a89490] hover:text-[#faf3ee] hover:bg-[#241822] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs uppercase tracking-wider font-bold text-[#120c10] bg-[#e89a92] hover:bg-[#f2aba3] rounded-xl shadow-lg shadow-rose-950 transition"
            >
              {isEditing ? 'Save Changes' : 'Publish to Catalog'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
