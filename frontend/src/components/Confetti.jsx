import { useEffect, useState } from 'react';

const COLORS = ['#FF3D9A','#8B5CF6','#06B6D4','#14F0C0','#FFD60A','#FF8C00','#6366F1'];

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!active) return;
    setPieces(Array.from({ length: 72 }, (_, i) => ({
      id: i,
      x:    Math.random() * 100,
      color: COLORS[i % COLORS.length],
      spd:  Math.random() * 2.5 + 2,
      dl:   Math.random() * 1.2,
      w:    Math.random() * 8 + 5,
      h:    Math.random() * 14 + 6,
      rot:  Math.random() * 360,
      br:   Math.random() > 0.4 ? '2px' : '50%',
    })));
    const t = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(t);
  }, [active]);

  return pieces.map(p => (
    <div key={p.id} className="confetti-piece" style={{
      left: `${p.x}%`,
      width: `${p.w}px`, height: `${p.h}px`,
      background: p.color,
      borderRadius: p.br,
      transform: `rotate(${p.rot}deg)`,
      '--spd': `${p.spd}s`,
      '--dl': `${p.dl}s`,
    }} />
  ));
}