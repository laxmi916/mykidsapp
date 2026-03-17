import { useMemo } from 'react';

export default function Scene() {
  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x:    Math.random() * 100,
    y:    Math.random() * 100,
    size: Math.random() * 2.5 + 0.8,
    sd:   Math.random() * 4 + 2,
    sdl:  Math.random() * 5,
  })), []);

  return (
    <div className="scene" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          '--sd':  `${s.sd}s`,
          '--sdl': `${s.sdl}s`,
        }} />
      ))}
    </div>
  );
}