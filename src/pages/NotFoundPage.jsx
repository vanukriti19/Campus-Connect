import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-24 text-center max-w-md mx-auto">
      <div className="text-6xl font-black text-brand-600 mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 mb-8">
        The page you are looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition"
      >
        <Compass className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  );
}
