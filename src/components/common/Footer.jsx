import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#382332] bg-[#0e070d] text-[#faf3ee]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Editorial Top Callout Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-14 border-b border-[#382332] items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#e89a92]">
              CAMPUS CULTURE ✦ 2026 ARCHIVE
            </span>
            <h3 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#faf3ee] leading-none">
              EXPERIENCE CAMPUS LIKE NEVER BEFORE.
            </h3>
          </div>

          <div className="md:col-span-4 flex md:justify-end">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10] text-xs font-mono uppercase tracking-widest font-bold transition shadow-xl shadow-rose-950 hover:scale-105"
            >
              <span>Explore Directory</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer Links & Credits */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-[#a89490]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#241822] border border-[#382332] flex items-center justify-center text-[#e89a92] font-display font-bold">
              CC
            </div>
            <div>
              <p className="font-bold text-[#faf3ee] uppercase tracking-wider">CampusConnect</p>
              <p className="text-[11px] text-[#7e6c69]">Unified Event Discovery & Registration Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-6 uppercase tracking-wider text-[11px]">
            <Link to="/events" className="hover:text-[#e89a92] transition">Catalog</Link>
            <Link to="/saved" className="hover:text-[#e89a92] transition">Wishlist</Link>
            <Link to="/my-registrations" className="hover:text-[#e89a92] transition">Passes</Link>
            <Link to="/admin" className="hover:text-[#e89a92] transition">Admin Console</Link>
          </div>

          <p className="text-[11px] text-[#7e6c69] uppercase tracking-widest">
            DESIGNED WITH EDITORIAL EXCELLENCE
          </p>
        </div>

      </div>
    </footer>
  );
}
