import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-[#1a1117] rounded-2xl border border-[#382332] p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#a89490]">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#241822] text-[#e89a92] border border-[#382332]">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="font-display text-4xl font-bold text-[#faf3ee] tracking-tight">{value}</div>
      {subtitle && <p className="text-xs font-mono text-[#bdaaa2] mt-1">{subtitle}</p>}
    </div>
  );
}
