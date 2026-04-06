import React from 'react';

const Divider = ({ text = "OR" }) => {
  return (
    <div className="flex items-center gap-4 text-slate-600" style={{ color: '#4b5563' }}>
      <div className="h-px flex-1 bg-white/5" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
      <span className="text-[10px] uppercase tracking-widest font-bold">{text}</span>
      <div className="h-px flex-1 bg-white/5" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
    </div>
  );
};

export default Divider;
