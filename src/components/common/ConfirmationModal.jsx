import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d070b]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#1a1117] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#382332] scale-100 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDanger 
                ? 'bg-rose-950/40 text-[#df7e74] border-rose-900/60' 
                : 'bg-[#241822] text-[#e89a92] border-[#382332]'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-[#faf3ee]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#a89490] hover:text-[#faf3ee] p-1.5 rounded-lg hover:bg-[#241822] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#bdaaa2] leading-relaxed mb-6 font-light">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 font-mono">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#a89490] hover:text-[#faf3ee] hover:bg-[#241822] rounded-xl transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs uppercase tracking-wider font-bold rounded-xl shadow-md transition ${
              isDanger
                ? 'bg-[#df7e74] hover:bg-[#cc5e54] text-[#120c10]'
                : 'bg-[#e89a92] hover:bg-[#f2aba3] text-[#120c10]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
