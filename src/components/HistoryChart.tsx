/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryDataPoint, SimulationState, TankConfig } from '../types/simulation';
import { TrendingUp, Droplets, Gauge, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Props {
  history: HistoryDataPoint[];
  tankNouCfg: TankConfig;
  tankExistentCfg: TankConfig;
  state?: SimulationState;
}

export const HistoryChart: React.FC<Props> = ({ history, tankNouCfg, tankExistentCfg, state }) => {
  if (history.length < 2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500 flex items-center justify-center h-48">
        Se colectează date din simulare...
      </div>
    );
  }

  const width = 800;
  const heightLevels = 130;
  const heightFlows = 110;
  const padding = { top: 18, right: 20, bottom: 22, left: 45 };

  // Levels scale: 197.5 m to 203.5 m
  const minLevel = 197.5;
  const maxLevel = 203.5;
  const levelRange = maxLevel - minLevel;

  const getLevelY = (lvl: number) => {
    const clamped = Math.max(minLevel, Math.min(maxLevel, lvl));
    return padding.top + (1 - (clamped - minLevel) / levelRange) * (heightLevels - padding.top - padding.bottom);
  };

  // Flows scale: 0 to 35 l/s
  const minFlow = 0;
  const maxFlow = 35;
  const flowRange = maxFlow - minFlow;

  const getFlowY = (q: number) => {
    const clamped = Math.max(minFlow, Math.min(maxFlow, q));
    return padding.top + (1 - (clamped - minFlow) / flowRange) * (heightFlows - padding.top - padding.bottom);
  };

  const getX = (index: number) => {
    return padding.left + (index / (history.length - 1)) * (width - padding.left - padding.right);
  };

  // Generate SVG path strings
  const pathNou = history.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getLevelY(pt.nivelNou)}`).join(' ');
  const pathEx = history.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getLevelY(pt.nivelExistent)}`).join(' ');

  const pathFT1 = history.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getFlowY(pt.debitFT1)}`).join(' ');
  const pathFT2 = history.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getFlowY(pt.debitFT2)}`).join(' ');
  const pathCerut = history.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getFlowY(pt.debitCerut)}`).join(' ');

  const latest = history[history.length - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Chart 1: Tank Water Levels (m Marea Neagră) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Evoluție Niveluri Rezervoare (Cote MN)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-400 rounded-full" />
              <span className="text-slate-300">
                Rez. Nou: <strong className="text-sky-300 font-mono">{latest.nivelNou.toFixed(2)} m</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-blue-500 rounded-full" />
              <span className="text-slate-300">
                Rez. Existent: <strong className="text-blue-300 font-mono">{latest.nivelExistent.toFixed(2)} m</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg p-1 border border-slate-800/80">
          <svg viewBox={`0 0 ${width} ${heightLevels}`} className="w-full h-auto font-mono text-[9px]">
            {/* Grid Lines */}
            {[198, 199, 200, 201, 202, 203].map((lvl) => {
              const y = getLevelY(lvl);
              return (
                <g key={lvl}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1e293b" strokeWidth="1" />
                  <text x={padding.left - 6} y={y + 3} textAnchor="end" fill="#64748b">
                    {lvl}m
                  </text>
                </g>
              );
            })}

            {/* Fire and Max thresholds as dashed lines */}
            <line
              x1={padding.left}
              y1={getLevelY(tankNouCfg.nivelIncendiu)}
              x2={width - padding.right}
              y2={getLevelY(tankNouCfg.nivelIncendiu)}
              stroke="#f59e0b"
              strokeDasharray="3,3"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1={padding.left}
              y1={getLevelY(tankExistentCfg.nivelIncendiu)}
              x2={width - padding.right}
              y2={getLevelY(tankExistentCfg.nivelIncendiu)}
              stroke="#f59e0b"
              strokeDasharray="3,3"
              strokeWidth="1"
              opacity="0.6"
            />

            {/* Lines */}
            <path d={pathNou} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <path d={pathEx} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Chart 2: Flow Rates FT1 & FT2 (l/s) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-magenta-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Evoluție Debite (FT1 Aducțiune / FT2 Livrat / Q Consum)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-magenta-500 rounded-full" />
              <span className="text-slate-300">
                FT1 (Aducțiune): <strong className="text-magenta-300 font-mono">{latest.debitFT1.toFixed(1)} l/s</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-400 rounded-full" />
              <span className="text-slate-300">
                FT2 (Livrat): <strong className="text-sky-300 font-mono">{latest.debitFT2.toFixed(1)} l/s</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-500 rounded-full border border-dashed" />
              <span className="text-slate-400">
                Cerut: <strong className="text-slate-300 font-mono">{latest.debitCerut.toFixed(1)} l/s</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg p-1 border border-slate-800/80">
          <svg viewBox={`0 0 ${width} ${heightFlows}`} className="w-full h-auto font-mono text-[9px]">
            {/* Grid Lines */}
            {[0, 10, 20, 30].map((flow) => {
              const y = getFlowY(flow);
              return (
                <g key={flow}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1e293b" strokeWidth="1" />
                  <text x={padding.left - 6} y={y + 3} textAnchor="end" fill="#64748b">
                    {flow}
                  </text>
                </g>
              );
            })}

            {/* Target Demand (Dashed gray) */}
            <path
              d={pathCerut}
              fill="none"
              stroke="#64748b"
              strokeDasharray="4,4"
              strokeWidth="1.5"
            />

            {/* Lines */}
            <path d={pathFT1} fill="none" stroke="#d946ef" strokeWidth="2.5" strokeLinecap="round" />
            <path d={pathFT2} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Correlation Widget: Dynamic Level Variation vs Net Flow */}
      {state && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              Dinamica Variației Nivelului în Funcție de Bilanțul Debitelor
            </span>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Formula: A · dH/dt = Q_intrare - Q_ieșire
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Rezervor Nou Dynamics */}
            <div
              className={`p-2.5 rounded-lg border transition ${
                state.tankNou.tendinta === 'CRESTERE'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : state.tankNou.tendinta === 'SCADERE'
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-sky-300">Rezervor NOU:</span>
                <span className="flex items-center gap-1 font-mono">
                  {state.tankNou.tendinta === 'CRESTERE' && (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">
                        CREȘTE (+{state.tankNou.dhDtCmMin.toFixed(1)} cm/min)
                      </span>
                    </>
                  )}
                  {state.tankNou.tendinta === 'SCADERE' && (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">
                        SCADE ({state.tankNou.dhDtCmMin.toFixed(1)} cm/min)
                      </span>
                    </>
                  )}
                  {state.tankNou.tendinta === 'STABIL' && (
                    <>
                      <Minus className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">STABIL (0.0 cm/min)</span>
                    </>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1.5 text-[11px] font-mono text-slate-400">
                <div>
                  Qin: <strong className="text-magenta-400">{state.tankNou.qIn.toFixed(1)}</strong> l/s
                </div>
                <div>
                  Qout: <strong className="text-blue-400">{state.tankNou.qOut.toFixed(1)}</strong> l/s
                </div>
                <div>
                  Qnet:{' '}
                  <strong
                    className={
                      state.tankNou.qNet > 0
                        ? 'text-emerald-400'
                        : state.tankNou.qNet < 0
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }
                  >
                    {state.tankNou.qNet > 0 ? '+' : ''}
                    {state.tankNou.qNet.toFixed(1)}
                  </strong>{' '}
                  l/s
                </div>
              </div>
              {state.tankNou.timpEstimatMin !== null && (
                <div className="text-[10px] text-slate-400 mt-1 italic">
                  Timp estimat până la atingerea pragului:{' '}
                  <strong className="text-white font-mono">~{state.tankNou.timpEstimatMin} min</strong>
                </div>
              )}
            </div>

            {/* Rezervor Existent Dynamics */}
            <div
              className={`p-2.5 rounded-lg border transition ${
                state.tankExistent.tendinta === 'CRESTERE'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : state.tankExistent.tendinta === 'SCADERE'
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-blue-300">Rezervor EXISTENT:</span>
                <span className="flex items-center gap-1 font-mono">
                  {state.tankExistent.tendinta === 'CRESTERE' && (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">
                        CREȘTE (+{state.tankExistent.dhDtCmMin.toFixed(1)} cm/min)
                      </span>
                    </>
                  )}
                  {state.tankExistent.tendinta === 'SCADERE' && (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">
                        SCADE ({state.tankExistent.dhDtCmMin.toFixed(1)} cm/min)
                      </span>
                    </>
                  )}
                  {state.tankExistent.tendinta === 'STABIL' && (
                    <>
                      <Minus className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">STABIL (0.0 cm/min)</span>
                    </>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1.5 text-[11px] font-mono text-slate-400">
                <div>
                  Qin: <strong className="text-magenta-400">{state.tankExistent.qIn.toFixed(1)}</strong> l/s
                </div>
                <div>
                  Qout: <strong className="text-blue-400">{state.tankExistent.qOut.toFixed(1)}</strong> l/s
                </div>
                <div>
                  Qnet:{' '}
                  <strong
                    className={
                      state.tankExistent.qNet > 0
                        ? 'text-emerald-400'
                        : state.tankExistent.qNet < 0
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }
                  >
                    {state.tankExistent.qNet > 0 ? '+' : ''}
                    {state.tankExistent.qNet.toFixed(1)}
                  </strong>{' '}
                  l/s
                </div>
              </div>
              {state.tankExistent.timpEstimatMin !== null && (
                <div className="text-[10px] text-slate-400 mt-1 italic">
                  Timp estimat până la atingerea pragului:{' '}
                  <strong className="text-white font-mono">~{state.tankExistent.timpEstimatMin} min</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
