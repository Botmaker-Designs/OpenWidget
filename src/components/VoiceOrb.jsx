export function VoiceOrb({ state = 'idle' }) {
  return (
    <>
      <style>{`
        @keyframes orb-morph-idle {
          0%,100% { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; transform: scale(1); }
          33%      { border-radius: 45% 55% 40% 60% / 60% 40% 55% 45%; transform: scale(1.03); }
          66%      { border-radius: 55% 45% 60% 40% / 45% 55% 50% 50%; transform: scale(0.98); }
        }
        @keyframes orb-morph-listening {
          0%,100% { border-radius: 50% 50% 45% 55% / 55% 45% 55% 45%; transform: scale(1.08); }
          25%      { border-radius: 40% 60% 55% 45% / 45% 55% 40% 60%; transform: scale(1.14); }
          50%      { border-radius: 60% 40% 45% 55% / 55% 45% 60% 40%; transform: scale(1.10); }
          75%      { border-radius: 45% 55% 60% 40% / 40% 60% 45% 55%; transform: scale(1.16); }
        }
        @keyframes orb-morph-speaking {
          0%,100% { border-radius: 55% 45% 50% 50% / 50% 55% 45% 55%; transform: scale(1.05); }
          20%      { border-radius: 40% 60% 60% 40% / 55% 45% 55% 45%; transform: scale(1.12); }
          40%      { border-radius: 60% 40% 40% 60% / 45% 55% 45% 55%; transform: scale(1.08); }
          60%      { border-radius: 45% 55% 55% 45% / 60% 40% 60% 40%; transform: scale(1.14); }
          80%      { border-radius: 55% 45% 45% 55% / 40% 60% 40% 60%; transform: scale(1.10); }
        }
        @keyframes orb-morph-processing {
          0%,100% { border-radius: 50% 50% 50% 50%; transform: scale(0.95) rotate(0deg); }
          50%      { border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%; transform: scale(1) rotate(180deg); }
        }
        @keyframes orb-glow-idle {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes orb-glow-active {
          0%,100% { opacity: 0.6; transform: scale(1.1); }
          50%      { opacity: 1;   transform: scale(1.25); }
        }

        .orb-body {
          position: relative;
          width: 110px; height: 110px;
        }
        .orb-glow {
          position: absolute; inset: -16px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96,165,250,0.35) 0%, transparent 70%);
        }
        .orb-shape {
          width: 100%; height: 100%;
          background: radial-gradient(ellipse at 35% 30%, #ffffff 0%, #93c5fd 25%, #3b82f6 55%, #1d4ed8 85%);
          box-shadow: inset -8px -8px 20px rgba(29,78,216,0.4), inset 6px 6px 16px rgba(255,255,255,0.5), 0 8px 32px rgba(59,130,246,0.4);
        }
        .orb-shine {
          position: absolute;
          top: 14%; left: 20%;
          width: 32%; height: 22%;
          background: radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .orb-state-idle .orb-shape      { animation: orb-morph-idle       3.5s ease-in-out infinite; }
        .orb-state-idle .orb-glow        { animation: orb-glow-idle         3.5s ease-in-out infinite; }
        .orb-state-listening .orb-shape  { animation: orb-morph-listening   1.4s ease-in-out infinite; }
        .orb-state-listening .orb-glow   { animation: orb-glow-active       1.4s ease-in-out infinite; }
        .orb-state-speaking .orb-shape   { animation: orb-morph-speaking    0.9s ease-in-out infinite; }
        .orb-state-speaking .orb-glow    { animation: orb-glow-active       0.9s ease-in-out infinite; }
        .orb-state-processing .orb-shape { animation: orb-morph-processing  1.8s ease-in-out infinite; }
        .orb-state-processing .orb-glow  { animation: orb-glow-idle         1.8s ease-in-out infinite; }
      `}</style>

      <div className={`orb-body orb-state-${state}`}>
        <div className="orb-glow" />
        <div className="orb-shape">
          <div className="orb-shine" />
        </div>
      </div>
    </>
  )
}
