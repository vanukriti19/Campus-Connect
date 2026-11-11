import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Bookmark, 
  Compass,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/events/EventCard';
import Popout3DCard from '../components/events/Popout3DCard';
import CinematicParallaxSlideshow from '../components/events/CinematicParallaxSlideshow';
import { INITIAL_CATEGORIES } from '../services/mockData';

export default function HomePage({ onRegisterClick, onEditClick, onDeleteClick }) {
  const { events, setSelectedCategory } = useEvents();
  const { isAdmin, toggleRole } = useAuth();

  const featuredEvents = events.filter((e) => e.featured).slice(0, 3);
  const upcomingEvents = events
    .filter((e) => new Date(e.endTime) > new Date())
    .slice(0, 6);

  return (
    <div className="space-y-20 pb-20">
      
      {/* Editorial Hero Cover Section */}
      <section className="relative overflow-hidden pt-8 pb-16 border-b border-[#382332]">
        
        {/* Top Editorial Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono tracking-widest uppercase text-[#a89490] pb-6 border-b border-[#382332]/60">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e89a92] animate-pulse" />
            <span>Campus Event Directory & Registration Hub</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Vol. 2026</span>
            <span>•</span>
            <span>All Departments</span>
            <span>•</span>
            <span className="text-[#e89a92]">Live Feed ✦</span>
          </div>
        </div>

        {/* Campus Connect Hero Artwork Banner with Blended Faded Edges */}
        <div className="relative my-8 select-none overflow-hidden rounded-[40px] bg-[#120c10]">
          {/* Main Artwork with CSS feather mask */}
          <div 
            className="relative w-full overflow-hidden"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 96% 90% at 50% 50%, black 50%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 96% 90% at 50% 50%, black 50%, transparent 100%)',
            }}
          >
            <img
              src="/campus-connect-hero.jpg"
              alt="Campus Connect"
              className="w-full h-auto max-h-[620px] object-cover object-center transform transition-transform duration-1000 ease-out hover:scale-[1.015]"
            />

            {/* Seamless 4-way edge feathering gradients blending into page background (#120c10) */}
            {/* Top edge fade */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#120c10] via-[#120c10]/60 to-transparent pointer-events-none" />
            
            {/* Bottom edge fade */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#120c10] via-[#120c10]/70 to-transparent pointer-events-none" />
            
            {/* Left edge fade */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#120c10] via-[#120c10]/60 to-transparent pointer-events-none" />
            
            {/* Right edge fade */}
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#120c10] via-[#120c10]/60 to-transparent pointer-events-none" />

            {/* Subtle radial atmosphere blend */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(18, 12, 16, 0.45) 80%, rgba(18, 12, 16, 0.95) 100%)'
              }}
            />
          </div>
        </div>

        {/* Hero Editorial Sub-Grid & Interactive Stamp */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-8 border-t border-[#382332]/80">
          
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#e89a92] flex items-center gap-1.5">
              <span>✦</span> Curated Collegiate Archive
            </div>
            <p className="text-sm sm:text-base text-[#bdaaa2] leading-relaxed font-light">
              One centralized architectural space for collegiate hackathons, cultural battles, technical masterclasses, and athletic championships.
            </p>
          </div>

          <div className="md:col-span-5 flex flex-wrap items-center gap-3">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10] font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950 transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" />
              Explore All Events
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/saved"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#20151e] hover:bg-[#2a1c27] text-[#faf3ee] font-semibold text-xs uppercase tracking-wider border border-[#382332] transition"
            >
              <Bookmark className="w-4 h-4 text-[#e89a92]" />
              Saved Events
            </Link>

            <button
              onClick={toggleRole}
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[#181016] text-[#a89490] hover:text-[#faf3ee] hover:bg-[#20151e] text-xs font-mono uppercase tracking-wider border border-[#2a1926] transition"
            >
              <Zap className="w-3.5 h-3.5 text-[#e89a92]" />
              Role: <strong className="text-[#faf3ee]">{isAdmin ? 'Admin' : 'Student'}</strong>
            </button>
          </div>

          {/* Rotating Editorial Stamp Seal */}
          <div className="md:col-span-3 flex justify-start md:justify-end">
            <div className="relative w-28 h-28 flex items-center justify-center group cursor-pointer">
              {/* Circular SVG text rotating */}
              <div className="absolute inset-0 animate-spin-slow">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[9.5px] uppercase font-mono tracking-widest fill-[#e89a92]">
                    <textPath href="#circlePath">
                      ✦ CAMPUSCONNECT ✦ OFFICIAL HUB ✦
                    </textPath>
                  </text>
                </svg>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#241822] border border-[#e89a92]/60 flex items-center justify-center text-[#e89a92] group-hover:scale-110 group-hover:bg-[#e89a92] group-hover:text-[#120c10] transition-all">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 mt-10 border-t border-[#382332]">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#a89490]">Archive Size</div>
            <div className="font-display text-4xl font-bold text-[#faf3ee] mt-1">{events.length}</div>
            <div className="text-[11px] text-[#bdaaa2]">Active Campus Events</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#a89490]">Key Disciplines</div>
            <div className="font-display text-4xl font-bold text-[#e89a92] mt-1">4</div>
            <div className="text-[11px] text-[#bdaaa2]">Technical, Cultural, Sports, Workshop</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#a89490]">Admission Access</div>
            <div className="font-display text-4xl font-bold text-[#faf3ee] mt-1">100%</div>
            <div className="text-[11px] text-[#bdaaa2]">Free for College Students</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#a89490]">Sync Protocol</div>
            <div className="font-display text-4xl font-bold text-[#e89a92] mt-1">Instant</div>
            <div className="text-[11px] text-[#bdaaa2]">Verified Multi-Tab Local Storage</div>
          </div>
        </div>
      </section>

      {/* Categories Section Styled as Editorial Columns */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#382332] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#e89a92] block mb-1">
              DISCIPLINES ↘
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#faf3ee] tracking-tight uppercase">
              Curated Categories
            </h2>
          </div>
          <Link
            to="/events"
            className="text-xs font-mono uppercase tracking-wider text-[#e89a92] hover:text-[#f2aba3] flex items-center gap-1.5"
          >
            <span>View Catalog</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {INITIAL_CATEGORIES.filter((c) => c.slug !== 'all').map((cat, index) => (
            <Link
              key={cat.slug}
              to="/events"
              onClick={() => setSelectedCategory(cat.slug)}
              className="group p-6 bg-[#1a1117] hover:bg-[#241822] rounded-2xl border border-[#382332] hover:border-[#e89a92] transition-all duration-300 flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs font-mono text-[#a89490]">
                <span>0{index + 1}</span>
                <ArrowUpRight className="w-4 h-4 text-[#e89a92] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div>
                <span className="font-display text-2xl font-bold text-[#faf3ee] group-hover:text-[#e89a92] uppercase tracking-tight block transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] text-[#bdaaa2] tracking-wider uppercase font-mono mt-1 block">
                  Campus Program
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Spotlight Section */}
      {featuredEvents.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#382332] pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#e89a92] block mb-1">
                SELECTED WORK ↘
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#faf3ee] tracking-tight uppercase">
                Spotlight Events
              </h2>
            </div>
            <Link
              to="/events"
              className="text-xs font-mono uppercase tracking-wider text-[#e89a92] hover:text-[#f2aba3] flex items-center gap-1.5"
            >
              <span>All Featured ({featuredEvents.length})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <CinematicParallaxSlideshow
            events={featuredEvents}
            onRegisterClick={onRegisterClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
          />
        </section>
      )}

      {/* Happening Soon Feed */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#382332] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#e89a92] block mb-1">
              THE TIMELINE ↘
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#faf3ee] tracking-tight uppercase">
              Happening Soon
            </h2>
          </div>
          <Link
            to="/events"
            className="text-xs font-mono uppercase tracking-wider text-[#e89a92] hover:text-[#f2aba3] flex items-center gap-1.5"
          >
            <span>See Full Schedule</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {upcomingEvents.map((event, idx) => (
            <Popout3DCard
              key={event.id}
              event={event}
              indexNumber={idx + 1}
              onRegisterClick={onRegisterClick}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
