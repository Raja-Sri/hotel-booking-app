import React from 'react';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';

export default function Banner() {
  return (
    <div className="relative overflow-hidden bg-radial from-slate-900 to-indigo-950 text-white rounded-3xl py-12 px-6 sm:px-12 shadow-2xl mb-8 border border-white/5 mx-4 sm:mx-0">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl z-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-indigo-200 mb-4 border border-white/10">
          <Sparkles className="h-3 w-3 text-indigo-300" />
          <span>SIMULATED TRUSTED SECURE PORTAL</span>
        </div>
        
        <h1 className="font-sans font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
          Find your next getaway. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
            Simulated hotel bookings made solid.
          </span>
        </h1>
        
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300 font-sans leading-relaxed max-w-xl">
          Search, find, and book luxury options in Tokyo, Paris, New York, London, and Sydney. This sandboxed application features live date-availability verification and instant API logging.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-indigo-200">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Secure TLS Mock APIs</span>
          </div>
          <div className="flex items-center space-x-1">
            <Compass className="h-4 w-4 text-indigo-400" />
            <span>5 International Hubs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
