import { useMemo } from 'react';

export default function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      d: Math.random() * 4 + 2,
      dl: Math.random() * 5,
    })), []);

  return (
    <div className="stars-wrap">
      {/* Gradient blobs */}
      <div className="bubble" style={{ width:500,height:500,background:'radial-gradient(circle,#9B5DE5,transparent)',top:'-100px',left:'-100px' }} />
      <div className="bubble" style={{ width:400,height:400,background:'radial-gradient(circle,#00BBF9,transparent)',bottom:'-80px',right:'-80px' }} />
      <div className="bubble" style={{ width:300,height:300,background:'radial-gradient(circle,#FF4D8D,transparent)',top:'40%',left:'60%' }} />
      {stars.map(s => (
        <div key={s.id} className="star-dot" style={{
          left:`${s.x}%`, top:`${s.y}%`,
          width:`${s.size}px`, height:`${s.size}px`,
          '--d':`${s.d}s`, '--dl':`${s.dl}s`,
        }} />
      ))}
    </div>
  );
}