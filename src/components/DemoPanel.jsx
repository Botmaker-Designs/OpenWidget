const SCENARIOS = [
  {
    id: 'chatCardVariant',
    label: 'Card de inicio',
    description: 'Variante de la card en la home',
    type: 'toggle',
    options: [
      { value: 'team',  label: 'Con equipo' },
      { value: 'hours', label: 'Con horarios' },
    ],
  },
  {
    id: 'demoActiveChat',
    label: 'Chat activo',
    description: 'Mensaje reciente en la home',
    type: 'toggle',
    options: [
      { value: 'none',   label: 'Sin chat' },
      { value: 'active', label: 'Con mensaje' },
    ],
  },
]

export function DemoPanel({ config, onChange }) {
  return (
    <>
      <style>{`
        .dp-wrap {
          position: fixed;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 192px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          z-index: 9998;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }
        .dp-header {
          padding: 12px 14px 10px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .dp-title {
          font-size: 12px;
          font-weight: 700;
          color: #111827;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .dp-badge {
          font-size: 10px;
          font-weight: 600;
          color: #6366f1;
          background: #eef2ff;
          padding: 1px 6px;
          border-radius: 99px;
        }
        .dp-body {
          padding: 10px 0 6px;
        }
        .dp-scenario {
          padding: 8px 14px;
        }
        .dp-scenario-label {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .dp-scenario-desc {
          font-size: 10px;
          color: #9ca3af;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .dp-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dp-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 8px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          transition: all 120ms ease;
          text-align: left;
          width: 100%;
        }
        .dp-option:hover {
          border-color: #a5b4fc;
          background: #f5f3ff;
        }
        .dp-option.active {
          border-color: #6366f1;
          background: #eef2ff;
        }
        .dp-option-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          flex-shrink: 0;
          transition: all 120ms ease;
        }
        .dp-option.active .dp-option-dot {
          border-color: #6366f1;
          background: #6366f1;
        }
        .dp-option-text {
          font-size: 12px;
          color: #374151;
          font-weight: 500;
        }
        .dp-option.active .dp-option-text {
          color: #4338ca;
          font-weight: 600;
        }
        .dp-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 6px 0;
        }
        .dp-footer {
          padding: 8px 14px 10px;
          font-size: 10px;
          color: #d1d5db;
          text-align: center;
        }
      `}</style>

      <div className="dp-wrap">
        <div className="dp-header">
          <span className="dp-title">Scenarios</span>
          <span className="dp-badge">Demo</span>
        </div>

        <div className="dp-body">
          {SCENARIOS.map((scenario, i) => (
            <div key={scenario.id}>
              {i > 0 && <div className="dp-divider" />}
              <div className="dp-scenario">
                <div className="dp-scenario-label">{scenario.label}</div>
                <div className="dp-scenario-desc">{scenario.description}</div>
                <div className="dp-options">
                  {scenario.options.map(opt => {
                    const active = config[scenario.id] === opt.value
                    return (
                      <button
                        key={opt.value}
                        className={`dp-option${active ? ' active' : ''}`}
                        onClick={() => onChange({ [scenario.id]: opt.value })}
                      >
                        <span className="dp-option-dot" />
                        <span className="dp-option-text">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dp-footer">OpenWidget · Dev mode</div>
      </div>
    </>
  )
}
