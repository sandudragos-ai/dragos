/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  SimulationParams,
  SimulationState,
  TankConfig,
  ValveState,
} from '../types/simulation';
import { Flame, AlertTriangle, Zap, ArrowUp, ArrowDown, Waves } from 'lucide-react';

interface Props {
  state: SimulationState;
  params: SimulationParams;
  tankNouCfg: TankConfig;
  tankExistentCfg: TankConfig;
  onToggleValve: (valve: keyof ValveState) => void;
  onToggleIncendiu: () => void;
  onTogglePompa: () => void;
  onTogglePlutitorDefectNou?: () => void;
  onTogglePlutitorDefectExistent?: () => void;
  onTestPreaplinNou?: () => void;
}

export const WaterSchemeSVG: React.FC<Props> = ({
  state,
  params,
  tankNouCfg,
  tankExistentCfg,
  onToggleValve,
  onToggleIncendiu,
  onTogglePompa,
  onTogglePlutitorDefectNou,
  onTogglePlutitorDefectExistent,
  onTestPreaplinNou,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { valves, flows, nodes, tankNou, tankExistent, alertaContaminare } = state;

  // ==============================================================
  // SPACIOUS COORDINATE SYSTEM (1360 x 820)
  // ==============================================================
  // Rezervor NOU (Top-Left): X: 150..450, Y: 100..360 (Width: 300, Height: 260)
  const tankNouBox = { x: 150, y: 100, width: 300, height: 260 };
  const hFractionNou = Math.min(
    1,
    Math.max(0, (tankNou.cotaApa - tankNouCfg.cotaRadier) / (tankNouCfg.nivelMaxim - tankNouCfg.cotaRadier))
  );
  const waterHeightNou = hFractionNou * 220;
  const waterYNou = tankNouBox.y + tankNouBox.height - waterHeightNou;
  const fireYNou =
    tankNouBox.y +
    tankNouBox.height -
    ((tankNouCfg.nivelIncendiu - tankNouCfg.cotaRadier) / (tankNouCfg.nivelMaxim - tankNouCfg.cotaRadier)) * 220;
  const maxYNou = tankNouBox.y + tankNouBox.height - 220;

  // Rezervor EXISTENT (Bottom-Right): X: 910..1210, Y: 300..560 (Width: 300, Height: 260)
  // Notice: Top (+200.20m) is visually below the radier (+200.50m) of Rezervor Nou!
  const tankExBox = { x: 910, y: 300, width: 300, height: 260 };
  const hFractionEx = Math.min(
    1,
    Math.max(0, (tankExistent.cotaApa - tankExistentCfg.cotaRadier) / (tankExistentCfg.nivelMaxim - tankExistentCfg.cotaRadier))
  );
  const waterHeightEx = hFractionEx * 210;
  const waterYEx = tankExBox.y + tankExBox.height - waterHeightEx;
  const fireYEx =
    tankExBox.y +
    tankExBox.height -
    ((tankExistentCfg.nivelIncendiu - tankExistentCfg.cotaRadier) / (tankExistentCfg.nivelMaxim - tankExistentCfg.cotaRadier)) * 210;
  const maxYEx = tankExBox.y + tankExBox.height - 210;

  // Colors
  const COLOR_ADUCTIUNE = '#d946ef'; // Magenta (aducțiune pompată)
  const COLOR_TREATED = '#38bdf8'; // Sky Blue (apă tratată)
  const COLOR_CONTAMINATION = '#ef4444'; // Red (interzis / retur)
  const COLOR_INACTIVE = '#475569'; // Slate 600

  const getPipeWidth = (flow: number) => {
    const absFlow = Math.abs(flow);
    if (absFlow < 0.05) return 3;
    return Math.min(8, Math.max(4, 3.5 + Math.sqrt(absFlow) * 1.0));
  };

  // Modern Sleek Valve Button
  const renderValve = (
    name: keyof ValveState,
    cx: number,
    cy: number,
    isElectric: boolean,
    labelPos: 'top' | 'bottom' | 'left' | 'right' = 'top'
  ) => {
    const isOpen = valves[name];
    const isContamHighlight = alertaContaminare && (name === 'V2' || name === 'V6');

    let textX = cx;
    let textY = cy - 22;
    if (labelPos === 'bottom') textY = cy + 24;
    if (labelPos === 'left') {
      textX = cx - 34;
      textY = cy + 4;
    }
    if (labelPos === 'right') {
      textX = cx + 34;
      textY = cy + 4;
    }

    return (
      <g
        className="cursor-pointer transition-all hover:scale-110 group select-none"
        onClick={() => onToggleValve(name)}
      >
        <title>{`Apasă pentru a comuta ${name} (${isOpen ? 'DESCHISĂ' : 'ÎNCHISĂ'})`}</title>

        {/* Pulse ring when open or alert */}
        {isContamHighlight ? (
          <circle cx={cx} cy={cy} r="22" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping opacity-80" />
        ) : isOpen ? (
          <circle cx={cx} cy={cy} r="20" fill="none" stroke="#10b981" strokeWidth="1" className="opacity-40 group-hover:opacity-100" />
        ) : null}

        {/* Outer Circular Valve Base */}
        <circle
          cx={cx}
          cy={cy}
          r="16"
          fill="#090d16"
          stroke={isContamHighlight ? '#ef4444' : isOpen ? '#10b981' : '#f43f5e'}
          strokeWidth="2"
        />

        {/* Bow-tie valve icon */}
        <polygon
          points={`${cx - 10},${cy - 7} ${cx},${cy} ${cx - 10},${cy + 7}`}
          fill={isOpen ? '#10b981' : '#ef4444'}
        />
        <polygon
          points={`${cx + 10},${cy - 7} ${cx},${cy} ${cx + 10},${cy + 7}`}
          fill={isOpen ? '#10b981' : '#ef4444'}
        />
        <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />

        {/* Actuator indicator (M for electric or wheel for manual) */}
        {isElectric ? (
          <rect
            x={cx - 6}
            y={cy - 19}
            width="12"
            height="7"
            rx="2"
            fill={isOpen ? '#10b981' : '#ef4444'}
            stroke="#090d16"
            strokeWidth="1"
          />
        ) : (
          <circle
            cx={cx}
            cy={cy - 16}
            r="4.5"
            fill="none"
            stroke={isOpen ? '#10b981' : '#ef4444'}
            strokeWidth="1.5"
          />
        )}

        {/* Label Badge */}
        <rect
          x={textX - 22}
          y={textY - 9}
          width="44"
          height="16"
          rx="4"
          fill="#0f172a"
          stroke={isOpen ? '#10b981' : '#ef4444'}
          strokeWidth="1.2"
        />
        <text
          x={textX}
          y={textY + 3}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="bold"
          fill={isOpen ? '#34d399' : '#f87171'}
        >
          {name} {isOpen ? 'ON' : 'OFF'}
        </text>
      </g>
    );
  };

  // Flowmeter renderer
  const renderFlowmeter = (name: string, qInstant: number, qCumulat: number, cx: number, cy: number, color: string) => (
    <g className="select-none">
      <rect x={cx - 18} y={cy - 12} width="36" height="24" rx="4" fill="#0f172a" stroke={color} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="9" fill="#1e293b" stroke={color} strokeWidth="1.5" />
      <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ffffff">
        {name}
      </text>

      {/* Digital readout card */}
      <rect x={cx - 45} y={cy - 48} width="90" height="30" rx="5" fill="#090d16" stroke={color} strokeWidth="1.2" />
      <text x={cx} y={cy - 34} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#38bdf8">
        {qInstant.toFixed(1)} l/s
      </text>
      <text x={cx} y={cy - 22} textAnchor="middle" fontSize="8" fill="#94a3b8">
        Σ {qCumulat.toFixed(1)} m³
      </text>
    </g>
  );

  // Node marker
  const renderNode = (name: string, head: number, cx: number, cy: number, offset: 'top' | 'bottom' | 'left' | 'right' = 'top') => {
    let tx = cx;
    let ty = cy - 14;
    if (offset === 'bottom') ty = cy + 18;
    if (offset === 'left') {
      tx = cx - 26;
      ty = cy + 4;
    }
    if (offset === 'right') {
      tx = cx + 26;
      ty = cy + 4;
    }

    return (
      <g className="select-none">
        <circle cx={cx} cy={cy} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
        <rect x={tx - 26} y={ty - 8} width="52" height="15" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
        <text x={tx} y={ty + 3} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fbbf24">
          {name}: {head.toFixed(1)}m
        </text>
      </g>
    );
  };

  // Chlorination Dosing Station renderer
  const renderChlorinationStation = (
    id: string,
    title: string,
    sublabel: string,
    cx: number,
    cy: number,
    active: boolean,
    side: 'top' | 'bottom' = 'top'
  ) => {
    const boxY = side === 'top' ? cy - 50 : cy + 18;
    const quillY1 = side === 'top' ? cy - 14 : cy + 14;
    const quillY2 = cy;

    return (
      <g id={id} className="select-none">
        <title>{`${title}: ${active ? 'DOZARE ACTIVĂ' : 'OPRIT'} • ${sublabel}`}</title>

        {/* Injection Quill into pipe */}
        <line x1={cx} y1={quillY1} x2={cx} y2={quillY2} stroke={active ? '#10b981' : '#64748b'} strokeWidth="3" />
        <circle cx={cx} cy={quillY2} r="3.5" fill={active ? '#34d399' : '#475569'} stroke="#ffffff" strokeWidth="1" />

        {/* Flange on pipe */}
        <line
          x1={cx - 6}
          y1={side === 'top' ? cy - 7 : cy + 7}
          x2={cx + 6}
          y2={side === 'top' ? cy - 7 : cy + 7}
          stroke="#94a3b8"
          strokeWidth="2.5"
        />

        {/* Chemical spray particles when active */}
        {active && (
          <g>
            <circle cx={cx} cy={quillY2} r="8" fill="none" stroke="#34d399" strokeWidth="1.5" className="animate-ping" />
            <circle cx={cx + (side === 'top' ? 8 : -8)} cy={quillY2} r="2" fill="#34d399" opacity="0.8" />
          </g>
        )}

        {/* Dosing Unit Cabinet */}
        <rect
          x={cx - 52}
          y={boxY}
          width="104"
          height="32"
          rx="5"
          fill="#090d16"
          stroke={active ? '#10b981' : '#475569'}
          strokeWidth="1.5"
        />

        {/* Status LED */}
        <circle
          cx={cx - 40}
          cy={boxY + 12}
          r="4"
          fill={active ? '#10b981' : '#ef4444'}
          className={active ? 'animate-pulse' : ''}
        />

        {/* Chemical symbol badge */}
        <text x={cx - 28} y={boxY + 15} fontSize="9" fontWeight="bold" fill={active ? '#34d399' : '#94a3b8'}>
          {title}
        </text>

        {/* Subtext info */}
        <text x={cx} y={boxY + 26} textAnchor="middle" fontSize="7.5" fill={active ? '#a7f3d0' : '#64748b'} className="font-mono">
          {active ? '● DOZARE Cl₂ ACTIVĂ' : '○ DOZARE OPRITĂ'}
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden p-2">
      {/* Top SCADA Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLOR_ADUCTIUNE }} />
            <span className="text-slate-200 font-semibold">
              Aducțiune (PEID De{params.diametruAductiuneMm || 90} PN{params.pnAductiune || 16} Pompată: +{params.cotaPiezometricaAductiune.toFixed(2)}m)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLOR_TREATED }} />
            <span className="text-slate-200 font-semibold">
              Apă tratată (PEID De{params.diametruDistributieMm || 110} PN{params.pnDistributie || 10} Gravitațional)
            </span>
          </div>

          {/* Regime Badge */}
          {state.tipAvertizare === 'INTERZIS' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-950 border border-red-500 rounded-lg text-red-200 font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>SCENARIU INTERZIS: Scurtcircuitare rezervoare (V2+V6)!</span>
            </div>
          ) : state.alertaStagnareExistent ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950 border border-amber-500 rounded-lg text-amber-200 font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>AVERTIZARE: Risc Stagnare Apă Rezervor Existent (Clapetă V4 Blocată)!</span>
            </div>
          ) : state.tipAvertizare === 'NERECOMANDAT' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950 border border-amber-500 rounded-lg text-amber-200 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>SCENARIU NERECOMANDAT</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Regim Tehnologic Conform</span>
            </div>
          )}

          {state.alertaCurgereBidirectionala && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-950 border border-orange-500 rounded-lg text-orange-200 font-bold animate-pulse">
              <span className="text-orange-400 font-extrabold text-sm leading-none">⇄</span>
              <span>CURGERE BIDIRECȚIONALĂ: {state.tronsonBidirectional}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePompa}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              params.pompaPornita
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {params.pompaPornita ? 'Pompă: PORNITĂ' : 'Pompă: OPRITĂ'}
          </button>

          <button
            onClick={onToggleIncendiu}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              params.regimIncendiu
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            {params.regimIncendiu ? 'INCENDIU (Prize Fund Active)' : 'Regim Normal (Prize Sifon)'}
          </button>

          {onTestPreaplinNou && (
            <button
              onClick={onTestPreaplinNou}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                state.tankNou.preaplinActiv
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 hover:border-rose-500'
              }`}
              title="Forțează deversarea pe prea-plin (umple rezervorul și blochează plutitorul)"
            >
              <Waves className="w-3.5 h-3.5" />
              {state.tankNou.preaplinActiv ? '🌊 Preaplin: ACTIV' : '🌊 Testează Preaplin'}
            </button>
          )}
        </div>
      </div>

      {/* Master SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox="0 0 1360 820"
        className="w-full h-auto select-none font-sans"
        style={{ minHeight: '560px' }}
      >
        <defs>
          {/* Water Linear Gradients */}
          <linearGradient id="gradWaterNou" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0284c7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="gradWaterEx" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#2563eb" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="1" />
          </linearGradient>

          {/* Pipe Metal Gradient */}
          <linearGradient id="pipeMetal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Arrow Markers */}
          <marker id="arr-mag" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill={COLOR_ADUCTIUNE} />
          </marker>
          <marker id="arr-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill={COLOR_TREATED} />
          </marker>
          <marker id="arr-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill={COLOR_CONTAMINATION} />
          </marker>

          {/* Background Grid Pattern */}
          <pattern id="cleanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.3" />
          </pattern>
        </defs>

        {/* Ambient Dark Tech Background */}
        <rect width="1360" height="820" fill="#070a12" />
        <rect width="1360" height="820" fill="url(#cleanGrid)" />

        {/* Elevation Reference Guide Lines */}
        <g opacity="0.35">
          <line x1="50" y1="140" x2="1310" y2="140" stroke="#334155" strokeDasharray="4,4" strokeWidth="1" />
          <text x="60" y="134" fontSize="9.5" fill="#64748b">Cota +202.93 m (Nivel Maxim Rezervor Nou)</text>

          <line x1="50" y1="230" x2="1310" y2="230" stroke="#334155" strokeDasharray="4,4" strokeWidth="1" />
          <text x="60" y="224" fontSize="9.5" fill="#64748b">Cota +201.71 m (Incendiu Intangibil Rezervor Nou)</text>

          <line x1="50" y1="360" x2="1310" y2="360" stroke="#334155" strokeDasharray="4,4" strokeWidth="1" />
          <text x="60" y="354" fontSize="9.5" fill="#64748b">Cota +200.50 m (Radier Nou) / +200.20 m (Nivel Maxim Existent)</text>

          <line x1="50" y1="460" x2="1310" y2="460" stroke="#334155" strokeDasharray="4,4" strokeWidth="1" />
          <text x="60" y="454" fontSize="9.5" fill="#64748b">Cota +198.95 m (Incendiu Intangibil Rezervor Existent)</text>

          <line x1="50" y1="560" x2="1310" y2="560" stroke="#334155" strokeDasharray="4,4" strokeWidth="1" />
          <text x="60" y="554" fontSize="9.5" fill="#64748b">Cota +198.00 m (Radier Existent)</text>
        </g>

        {/* Dynamic Technological Warning & Status Banner (Airy Upper Area X: 470..890) */}
        <g id="scada-warning-card" transform="translate(470, 16)">
          {state.tipAvertizare === 'INTERZIS' ? (
            <g className="animate-pulse">
              <rect
                x="0"
                y="0"
                width="420"
                height="62"
                rx="8"
                fill="#450a0a"
                stroke="#ef4444"
                strokeWidth="2.5"
                fillOpacity="0.95"
              />
              <circle cx="28" cy="31" r="14" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
              <path d="M 28 22 L 28 32 M 28 36 L 28 38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <text x="52" y="24" fontSize="11" fontWeight="extrabold" fill="#fecaca">
                ⛔ SCENARIU INTERZIS: BYPASS REZERVOARE
              </text>
              <text x="52" y="38" fontSize="9" fontWeight="bold" fill="#fca5a5">
                V2 și V6 sunt simultan deschise! Scurtcircuitare aducțiune direct în colector.
              </text>
              <text x="52" y="51" fontSize="8" fill="#f87171">
                Apa intră în rețea fără timpul normat de contact și dezinfectare în rezervor!
              </text>
            </g>
          ) : state.tipAvertizare === 'NERECOMANDAT' ? (
            <g>
              <rect
                x="0"
                y="0"
                width="420"
                height="62"
                rx="8"
                fill="#451a03"
                stroke="#f59e0b"
                strokeWidth="2"
                fillOpacity="0.95"
              />
              <circle cx="28" cy="31" r="14" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
              <path d="M 28 22 L 28 32 M 28 36 L 28 38" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
              <text x="52" y="24" fontSize="11" fontWeight="bold" fill="#fde68a">
                ⚠️ SCENARIU NERECOMANDAT
              </text>
              <text x="52" y="38" fontSize="9" fontWeight="bold" fill="#fed7aa">
                {state.titluAvertizare || 'Regim tranzitoriu sau izolare circuit'}
              </text>
              <text x="52" y="51" fontSize="8" fill="#fdba74">
                {state.mesajAvertizare || 'Urmăriți parametrii hidraulici și debitele debitmetrelor FT1 / FT2.'}
              </text>
            </g>
          ) : (
            <g>
              <rect
                x="0"
                y="0"
                width="420"
                height="62"
                rx="8"
                fill="#062e24"
                stroke="#10b981"
                strokeWidth="1.2"
                fillOpacity="0.9"
              />
              <circle cx="28" cy="31" r="14" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
              <path d="M 22 31 L 26 35 L 34 26" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <text x="52" y="24" fontSize="11" fontWeight="bold" fill="#a7f3d0">
                ✓ REGIM TEHNOLOGIC CONFORM (RECOMANDAT)
              </text>
              <text x="52" y="38" fontSize="9" fill="#6ee7b7">
                Apă aducțiune potabilă supusă preclorinării după FT1.
              </text>
              <text x="52" y="51" fontSize="8" fill="#94a3b8">
                Timp de contact asigurat în rezervoare • Dezinfecție finală cu clor activă înainte de FT2.
              </text>
            </g>
          )}
        </g>

        {/* ============================================================== */}
        {/* PIPES NETWORK - CLEAN & SPACIOUS                               */}
        {/* ============================================================== */}

        {/* 1. ADUCTIUNE (MAGENTA) */}
        {/* Main supply enters at bottom left (X: 20, Y: 700) to Node A (X: 165) */}
        <line
          x1="20"
          y1="700"
          x2="165"
          y2="700"
          stroke={flows.qFT1 > 0.05 ? COLOR_ADUCTIUNE : COLOR_INACTIVE}
          strokeWidth={getPipeWidth(flows.qFT1)}
          strokeDasharray={flows.qFT1 > 0.05 ? '8,6' : '4,4'}
          className={flows.qFT1 > 0.05 ? 'animate-flow' : ''}
          strokeLinecap="round"
        />

        {/* Branch 1 to Rezervor Nou: from Node A (165, 700) turns left along 700 to X: 80, then up to Y: 120 */}
        <path
          d="M 165 700 L 80 700 L 80 120 L 175 120"
          fill="none"
          stroke={flows.qAductiuneNou > 0.05 ? COLOR_ADUCTIUNE : COLOR_INACTIVE}
          strokeWidth={getPipeWidth(flows.qAductiuneNou)}
          strokeDasharray={flows.qAductiuneNou > 0.05 ? '8,6' : '4,4'}
          className={flows.qAductiuneNou > 0.05 ? 'animate-flow' : ''}
          strokeLinecap="round"
        />

        {/* Branch 2 to Rezervor Existent: horizontal along Y: 700 to Node N2 (X: 860) */}
        {/* Segment before vertical collector underpass (X: 165 to X: 615) */}
        <line
          x1="165"
          y1="700"
          x2="615"
          y2="700"
          stroke={flows.qAductiuneExistent > 0.05 ? COLOR_ADUCTIUNE : COLOR_INACTIVE}
          strokeWidth={getPipeWidth(flows.qAductiuneExistent)}
          strokeDasharray={flows.qAductiuneExistent > 0.05 ? '8,6' : '4,4'}
          className={flows.qAductiuneExistent > 0.05 ? 'animate-flow' : ''}
        />
        {/* Underpass bridge over vertical collector at X: 640 */}
        <path
          d="M 615 700 C 625 700, 625 712, 640 712 C 655 712, 655 700, 665 700"
          fill="none"
          stroke={flows.qAductiuneExistent > 0.05 ? COLOR_ADUCTIUNE : COLOR_INACTIVE}
          strokeWidth={getPipeWidth(flows.qAductiuneExistent)}
        />
        {/* Segment from underpass to Node N2 (X: 665 to X: 860) */}
        <line
          x1="665"
          y1="700"
          x2="860"
          y2="700"
          stroke={flows.qAductiuneExistent > 0.05 ? COLOR_ADUCTIUNE : COLOR_INACTIVE}
          strokeWidth={getPipeWidth(flows.qAductiuneExistent)}
          strokeDasharray={flows.qAductiuneExistent > 0.05 ? '8,6' : '4,4'}
          className={flows.qAductiuneExistent > 0.05 ? 'animate-flow' : ''}
        />

        {/* From Node N2 up to Rezervor Existent Top Inlet (X: 860, Y: 700 -> 860, 320 -> 935, 320) */}
        {(() => {
          const flowInletEx = flows.qAductiuneExistent + (flows.qV6 > 0 ? flows.qV6 : 0);
          const colorInlet =
            flows.qAductiuneExistent > 0.05
              ? COLOR_ADUCTIUNE
              : flows.qV6 > 0.05
              ? COLOR_TREATED
              : COLOR_INACTIVE;
          return (
            <path
              d="M 860 700 L 860 320 L 935 320"
              fill="none"
              stroke={colorInlet}
              strokeWidth={getPipeWidth(flowInletEx)}
              strokeDasharray={flowInletEx > 0.05 ? '8,6' : '4,4'}
              className={flowInletEx > 0.05 ? 'animate-flow' : ''}
              strokeLinecap="round"
            />
          );
        })()}

        {/* 2. DISCHARGE FROM REZERVOR NOU (Exit at X: 450, Y: 330 -> H1 at X: 640, Y: 330) */}
        <line
          x1="450"
          y1="330"
          x2="640"
          y2="330"
          stroke={flows.qIesireNou > 0.05 ? COLOR_TREATED : COLOR_INACTIVE}
          strokeWidth={getPipeWidth(flows.qIesireNou)}
          strokeDasharray={flows.qIesireNou > 0.05 ? '8,6' : '4,4'}
          className={flows.qIesireNou > 0.05 ? 'animate-flow' : ''}
        />

        {/* 3. VERTICAL COLLECTOR De110 (X: 640 from H1: 330 down to H2: 540) */}
        <line
          x1="640"
          y1="330"
          x2="640"
          y2="540"
          stroke={
            alertaContaminare && Math.abs(flows.qV6) > 0.05
              ? COLOR_CONTAMINATION
              : flows.qV5 > 0.05
              ? COLOR_TREATED
              : COLOR_INACTIVE
          }
          strokeWidth={getPipeWidth(flows.qV5 || flows.qV6)}
          strokeDasharray={Math.abs(flows.qV5) > 0.05 ? '8,6' : '4,4'}
          className={Math.abs(flows.qV5) > 0.05 ? 'animate-flow' : ''}
        />

        {/* 4. DERIVATION V6: Branches off at X: 640, Y: 380 -> X: 580 down to Y: 650 -> across to N2 (860) */}
        {(() => {
          const isReverse = flows.qV6 < -0.05; // Contamination!
          const isForward = flows.qV6 > 0.05; // Gravity filling
          const colorV6 = isReverse ? COLOR_CONTAMINATION : isForward ? COLOR_TREATED : COLOR_INACTIVE;
          const pipeW = getPipeWidth(flows.qV6);

          return (
            <g>
              <path
                d="M 640 380 L 580 380 L 580 650 L 625 650"
                fill="none"
                stroke={colorV6}
                strokeWidth={pipeW}
                strokeDasharray={isReverse || isForward ? '8,6' : '4,4'}
                className={isReverse ? 'animate-flow-reverse' : isForward ? 'animate-flow' : ''}
              />
              {/* Bridge over vertical collector at X: 640, Y: 650 */}
              <path
                d="M 625 650 C 628 640, 652 640, 655 650"
                fill="none"
                stroke={colorV6}
                strokeWidth={pipeW}
              />
              <path
                d="M 655 650 L 860 650 L 860 700"
                fill="none"
                stroke={colorV6}
                strokeWidth={pipeW}
                strokeDasharray={isReverse || isForward ? '8,6' : '4,4'}
                className={isReverse ? 'animate-flow-reverse' : isForward ? 'animate-flow' : ''}
              />
            </g>
          );
        })()}

        {/* 5. DISCHARGE FROM REZERVOR EXISTENT (Exit at X: 910, Y: 540 -> H2 at X: 640, Y: 540) */}
        <line
          x1="910"
          y1="540"
          x2="640"
          y2="540"
          stroke={flows.qIesireExistent > 0.05 ? COLOR_TREATED : COLOR_INACTIVE}
          strokeWidth={getPipeWidth(flows.qIesireExistent)}
          strokeDasharray={flows.qIesireExistent > 0.05 ? '8,6' : '4,4'}
          className={flows.qIesireExistent > 0.05 ? 'animate-flow' : ''}
        />

        {/* 6. TREATED WATER DISTRIBUTION TO CONSUMERS (H2: 640, 540 -> 640, 755 -> FT2 -> 1330, 755) */}
        <path
          d="M 640 540 L 640 755 L 1330 755"
          fill="none"
          stroke={
            alertaContaminare && flows.qFT2 > 0.05
              ? COLOR_CONTAMINATION
              : flows.qFT2 > 0.05
              ? COLOR_TREATED
              : COLOR_INACTIVE
          }
          strokeWidth={getPipeWidth(flows.qFT2)}
          strokeDasharray={flows.qFT2 > 0.05 ? '8,6' : '4,4'}
          className={flows.qFT2 > 0.05 ? 'animate-flow' : ''}
          strokeLinecap="round"
          markerEnd={
            alertaContaminare && flows.qFT2 > 0.05
              ? 'url(#arr-red)'
              : flows.qFT2 > 0.05
              ? 'url(#arr-blue)'
              : undefined
          }
        />

        {/* ============================================================== */}
        {/* REZERVOR NOU (TOP-LEFT) - LARGE, VIVID & AIRY                  */}
        {/* ============================================================== */}
        <g id="tank-nou">
          {/* Tank Outer Shell (Architectural Glass Vessel) */}
          <rect
            x={tankNouBox.x}
            y={tankNouBox.y}
            width={tankNouBox.width}
            height={tankNouBox.height}
            rx="8"
            fill="#090d16"
            stroke="#334155"
            strokeWidth="3"
          />

          {/* Water Clipping Mask */}
          <g clipPath="url(#clipNouSpacious)">
            <clipPath id="clipNouSpacious">
              <rect
                x={tankNouBox.x + 3}
                y={tankNouBox.y + 3}
                width={tankNouBox.width - 6}
                height={tankNouBox.height - 6}
                rx="6"
              />
            </clipPath>

            {/* Rising/Falling Water Body */}
            <rect
              x={tankNouBox.x + 3}
              y={waterYNou}
              width={tankNouBox.width - 6}
              height={tankNouBox.y + tankNouBox.height - waterYNou}
              fill="url(#gradWaterNou)"
              className="transition-all duration-300"
            />

            {/* Dynamic Water Surface Wave */}
            <line
              x1={tankNouBox.x + 3}
              y1={waterYNou}
              x2={tankNouBox.x + tankNouBox.width - 3}
              y2={waterYNou}
              stroke="#e0f2fe"
              strokeWidth="3"
            />

            {/* Inflow Water Cascade (When Qin > 0) */}
            {flows.qAductiuneNou > 0.05 && (
              <g>
                <line
                  x1={tankNouBox.x + 30}
                  y1={tankNouBox.y + 20}
                  x2={tankNouBox.x + 30}
                  y2={waterYNou}
                  stroke="#7dd3fc"
                  strokeWidth="5"
                  strokeDasharray="5,4"
                  className="animate-flow-fast opacity-90"
                />
                <ellipse
                  cx={tankNouBox.x + 30}
                  cy={waterYNou}
                  rx="14"
                  ry="4"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="animate-ping"
                />
              </g>
            )}

            {/* Dynamic Flow Arrows INSIDE the liquid showing Fill or Drain */}
            {tankNou.tendinta === 'CRESTERE' && (
              <g transform={`translate(${tankNouBox.x + tankNouBox.width / 2}, ${waterYNou + 40})`} className="animate-bounce opacity-80">
                <circle cx="0" cy="0" r="18" fill="#065f46" stroke="#34d399" strokeWidth="2" />
                <path d="M 0 8 L 0 -8 M -5 -3 L 0 -8 L 5 -3" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
            {tankNou.tendinta === 'SCADERE' && (
              <g transform={`translate(${tankNouBox.x + tankNouBox.width / 2}, ${waterYNou + 40})`} className="animate-bounce opacity-80">
                <circle cx="0" cy="0" r="18" fill="#881337" stroke="#f43f5e" strokeWidth="2" />
                <path d="M 0 -8 L 0 8 M -5 3 L 0 8 L 5 3" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* Graduated Scale on Left Side */}
          <g opacity="0.6">
            <line x1={tankNouBox.x + 14} y1={maxYNou} x2={tankNouBox.x + 14} y2={tankNouBox.y + tankNouBox.height - 8} stroke="#94a3b8" strokeWidth="1.5" />
            {[0, 0.5, 1.0, 1.5, 2.0, 2.43].map((val) => {
              const yT = tankNouBox.y + tankNouBox.height - (val / 2.43) * 220;
              return (
                <g key={val}>
                  <line x1={tankNouBox.x + 14} y1={yT} x2={tankNouBox.x + 22} y2={yT} stroke="#94a3b8" strokeWidth="1.5" />
                  <text x={tankNouBox.x + 26} y={yT + 3} fontSize="8" fill="#94a3b8" className="font-mono">
                    {val.toFixed(1)}m
                  </text>
                </g>
              );
            })}
          </g>

          {/* Dynamic Moving Level Indicator Needle */}
          <g transform={`translate(${tankNouBox.x + 14}, ${waterYNou})`}>
            <polygon points="0,0 -8,-5 -8,5" fill="#38bdf8" />
            <line x1="0" y1="0" x2="60" y2="0" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
          </g>

          {/* Threshold Lines */}
          {/* Max Level */}
          <line x1={tankNouBox.x} y1={maxYNou} x2={tankNouBox.x + tankNouBox.width} y2={maxYNou} stroke="#ef4444" strokeDasharray="4,3" strokeWidth="1.5" />
          <text x={tankNouBox.x + tankNouBox.width - 10} y={maxYNou - 5} textAnchor="end" fontSize="9" fill="#f87171" fontWeight="bold">
            MAX: 202.93m (100 m³)
          </text>

          {/* Fire Level */}
          <line x1={tankNouBox.x} y1={fireYNou} x2={tankNouBox.x + tankNouBox.width} y2={fireYNou} stroke="#f59e0b" strokeDasharray="4,3" strokeWidth="1.5" />
          <text x={tankNouBox.x + tankNouBox.width - 10} y={fireYNou - 5} textAnchor="end" fontSize="9" fill="#fbbf24" fontWeight="bold">
            INCENDIU: 201.71m (47.3 m³)
          </text>

          {/* Radier */}
          <text x={tankNouBox.x + 60} y={tankNouBox.y + tankNouBox.height - 8} fontSize="9" fill="#94a3b8">
            Radier CR: 200.50m
          </text>

          {/* Siphon & Bottom Intakes Inside Tank Nou */}
          {/* Priza de fund */}
          <path
            d={`M ${tankNouBox.x + 160} ${tankNouBox.y + tankNouBox.height - 12} L ${tankNouBox.x + 230} ${tankNouBox.y + tankNouBox.height - 12} L ${tankNouBox.x + 230} ${tankNouBox.y + tankNouBox.height - 30} L ${tankNouBox.x + tankNouBox.width} 330`}
            fill="none"
            stroke="url(#pipeMetal)"
            strokeWidth="4"
          />
          <circle
            cx={tankNouBox.x + 195}
            cy={tankNouBox.y + tankNouBox.height - 12}
            r="6"
            fill={params.regimIncendiu ? '#10b981' : '#ef4444'}
            stroke="#ffffff"
            strokeWidth="1"
          />

          {/* Priza Sifon (Gât lebădă) */}
          <path
            d={`M ${tankNouBox.x + 70} ${fireYNou + 20} L ${tankNouBox.x + 70} ${fireYNou - 10} Q ${tankNouBox.x + 95} ${fireYNou - 22} ${tankNouBox.x + 120} ${fireYNou - 10} L ${tankNouBox.x + 120} ${tankNouBox.y + tankNouBox.height - 30} L ${tankNouBox.x + tankNouBox.width} 330`}
            fill="none"
            stroke="url(#pipeMetal)"
            strokeWidth="4.5"
          />
          <text x={tankNouBox.x + 75} y={fireYNou - 26} fontSize="8.5" fill="#cbd5e1" fontWeight="bold">
            Sifon (Gât lebădă)
          </text>

          {/* Float valve at top inlet (Clickable) */}
          <g
            transform={`translate(${tankNouBox.x + 25}, ${tankNouBox.y + 12})`}
            className="cursor-pointer hover:scale-105 transition select-none"
            onClick={onTogglePlutitorDefectNou}
          >
            <title>Click pentru a simula Plutitor Blocat / Test Preaplin</title>
            <circle
              cx="12"
              cy={tankNou.plutitorInchis ? 0 : 16}
              r="8"
              fill={params.plutitorDefectNou ? '#f59e0b' : tankNou.plutitorInchis ? '#ef4444' : '#38bdf8'}
              stroke="#0f172a"
              strokeWidth="1.5"
              className={params.plutitorDefectNou ? 'animate-pulse' : ''}
            />
            <line x1="0" y1="0" x2="12" y2={tankNou.plutitorInchis ? 0 : 16} stroke="#94a3b8" strokeWidth="2.5" />
            <text x="26" y="8" fontSize="8.5" fontWeight="bold" fill={params.plutitorDefectNou ? '#fbbf24' : tankNou.plutitorInchis ? '#f87171' : '#94a3b8'}>
              {params.plutitorDefectNou ? 'Plutitor BLOCAT (Defect)' : tankNou.plutitorInchis ? 'Plutitor ÎNCHIS' : 'Plutitor DESCHIS'}
            </text>
          </g>

          {/* Level Transmitters LT2 / LS */}
          <g transform={`translate(${tankNouBox.x - 36}, ${tankNouBox.y + 10})`}>
            <circle cx="14" cy="14" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="14" y="17.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#38bdf8">
              LT2
            </text>
            <circle cx="14" cy="44" r="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="14" y="47.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#38bdf8">
              LS
            </text>
          </g>

          {/* Large Floating Header Card for Tank Nou */}
          <g transform={`translate(${tankNouBox.x + 30}, ${tankNouBox.y - 62})`}>
            <rect x="0" y="0" width="240" height="52" rx="8" fill="#0b1120" stroke="#38bdf8" strokeWidth="2" />
            <text x="120" y="17" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#f8fafc">
              REZERVOR NOU (V = 100 mc)
            </text>
            <text x="120" y="31" textAnchor="middle" fontSize="10" fill="#38bdf8" fontWeight="bold">
              Cota: {tankNou.cotaApa.toFixed(2)} m | {tankNou.volumCurent.toFixed(1)} mc ({tankNou.procentNivel.toFixed(0)}%)
            </text>

            {/* Live Filling/Draining Trend Banner */}
            {tankNou.tendinta === 'CRESTERE' && (
              <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#34d399" fontWeight="bold">
                ▲ SE UMPLE: +{tankNou.dhDtCmMin.toFixed(1)} cm/min (+{tankNou.qNet.toFixed(1)} l/s)
              </text>
            )}
            {tankNou.tendinta === 'SCADERE' && (
              <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#f87171" fontWeight="bold">
                ▼ SE GOLEȘTE: {tankNou.dhDtCmMin.toFixed(1)} cm/min ({tankNou.qNet.toFixed(1)} l/s)
              </text>
            )}
            {tankNou.tendinta === 'STABIL' && (
              <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#94a3b8">
                ● NIVEL STABIL (Qin = Qout = {tankNou.qIn.toFixed(1)} l/s)
              </text>
            )}
          </g>

          {/* Overflow Bellmouth Funnel & Pipe for Tank Nou */}
          <g id="preaplin-nou" transform={`translate(${tankNouBox.x + tankNouBox.width - 32}, ${maxYNou})`}>
            <polygon
              points="0,0 24,0 16,16 8,16"
              fill={tankNou.preaplinActiv ? '#0284c7' : '#334155'}
              stroke={tankNou.preaplinActiv ? '#38bdf8' : '#64748b'}
              strokeWidth="1.5"
            />
            {tankNou.preaplinActiv && (
              <ellipse cx="12" cy="2" rx="8" ry="3" fill="#e0f2fe" className="animate-ping opacity-90" />
            )}
          </g>
          {/* Overflow Discharge Pipe */}
          <path
            d={`M ${tankNouBox.x + tankNouBox.width - 20} ${maxYNou + 16} L ${tankNouBox.x + tankNouBox.width - 20} ${maxYNou + 30} L ${tankNouBox.x + tankNouBox.width + 30} ${maxYNou + 30} L ${tankNouBox.x + tankNouBox.width + 30} ${tankNouBox.y + tankNouBox.height + 50} L ${tankNouBox.x + tankNouBox.width + 75} ${tankNouBox.y + tankNouBox.height + 50}`}
            fill="none"
            stroke={tankNou.preaplinActiv ? '#f43f5e' : '#475569'}
            strokeWidth={tankNou.preaplinActiv ? '5' : '3'}
            strokeDasharray={tankNou.preaplinActiv ? '6,4' : '4,4'}
            className={tankNou.preaplinActiv ? 'animate-flow-fast' : ''}
            strokeLinecap="round"
          />
          {/* Sewer Pit */}
          <g transform={`translate(${tankNouBox.x + tankNouBox.width + 75}, ${tankNouBox.y + tankNouBox.height + 40})`}>
            <rect x="0" y="0" width="38" height="24" rx="4" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
            <text x="19" y="15" textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="bold">
              CANAL
            </text>
            {tankNou.preaplinActiv && (
              <circle cx="2" cy="10" r="7" fill="none" stroke="#f43f5e" strokeWidth="2" className="animate-ping" />
            )}
          </g>
          {tankNou.preaplinActiv && (
            <g transform={`translate(${tankNouBox.x + tankNouBox.width + 40}, ${maxYNou + 70})`}>
              <rect x="-6" y="-12" width="115" height="26" rx="5" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" className="animate-pulse" />
              <text x="51" y="-1" textAnchor="middle" fontSize="8.5" fill="#ffe4e6" fontWeight="bold">
                🌊 PREAPLIN ACTIV!
              </text>
              <text x="51" y="10" textAnchor="middle" fontSize="8" fill="#fecdd3" className="font-mono">
                {flows.qPreaplinNou.toFixed(1)} l/s la canal
              </text>
            </g>
          )}
        </g>

        {/* ============================================================== */}
        {/* REZERVOR EXISTENT (BOTTOM-RIGHT) - LARGE & SPACIOUS            */}
        {/* ============================================================== */}
        <g id="tank-existent">
          {/* Outer Tank Structure */}
          <rect
            x={tankExBox.x}
            y={tankExBox.y}
            width={tankExBox.width}
            height={tankExBox.height}
            rx="8"
            fill="#090d16"
            stroke="#334155"
            strokeWidth="3"
          />

          {/* Water Clipping Mask */}
          <g clipPath="url(#clipExSpacious)">
            <clipPath id="clipExSpacious">
              <rect
                x={tankExBox.x + 3}
                y={tankExBox.y + 3}
                width={tankExBox.width - 6}
                height={tankExBox.height - 6}
                rx="6"
              />
            </clipPath>

            {/* Rising/Falling Water Body */}
            <rect
              x={tankExBox.x + 3}
              y={waterYEx}
              width={tankExBox.width - 6}
              height={tankExBox.y + tankExBox.height - waterYEx}
              fill="url(#gradWaterEx)"
              className="transition-all duration-300"
            />

            {/* Dynamic Water Surface Wave */}
            <line
              x1={tankExBox.x + 3}
              y1={waterYEx}
              x2={tankExBox.x + tankExBox.width - 3}
              y2={waterYEx}
              stroke="#e0f2fe"
              strokeWidth="3"
            />

            {/* Inflow Water Cascade (When Qin > 0) */}
            {tankExistent.qIn > 0.05 && (
              <g>
                <line
                  x1={tankExBox.x + 30}
                  y1={tankExBox.y + 20}
                  x2={tankExBox.x + 30}
                  y2={waterYEx}
                  stroke="#93c5fd"
                  strokeWidth="5"
                  strokeDasharray="5,4"
                  className="animate-flow-fast opacity-90"
                />
                <ellipse
                  cx={tankExBox.x + 30}
                  cy={waterYEx}
                  rx="14"
                  ry="4"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="animate-ping"
                />
              </g>
            )}

            {/* Dynamic Flow Arrows INSIDE the liquid */}
            {tankExistent.tendinta === 'CRESTERE' && (
              <g transform={`translate(${tankExBox.x + tankExBox.width / 2}, ${waterYEx + 40})`} className="animate-bounce opacity-80">
                <circle cx="0" cy="0" r="18" fill="#065f46" stroke="#34d399" strokeWidth="2" />
                <path d="M 0 8 L 0 -8 M -5 -3 L 0 -8 L 5 -3" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
            {tankExistent.tendinta === 'SCADERE' && (
              <g transform={`translate(${tankExBox.x + tankExBox.width / 2}, ${waterYEx + 40})`} className="animate-bounce opacity-80">
                <circle cx="0" cy="0" r="18" fill="#881337" stroke="#f43f5e" strokeWidth="2" />
                <path d="M 0 -8 L 0 8 M -5 3 L 0 8 L 5 3" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* Graduated Scale on Left Side */}
          <g opacity="0.6">
            <line x1={tankExBox.x + 14} y1={maxYEx} x2={tankExBox.x + 14} y2={tankExBox.y + tankExBox.height - 8} stroke="#94a3b8" strokeWidth="1.5" />
            {[0, 0.5, 1.0, 1.5, 2.0, 2.2].map((val) => {
              const yT = tankExBox.y + tankExBox.height - (val / 2.2) * 210;
              return (
                <g key={val}>
                  <line x1={tankExBox.x + 14} y1={yT} x2={tankExBox.x + 22} y2={yT} stroke="#94a3b8" strokeWidth="1.5" />
                  <text x={tankExBox.x + 26} y={yT + 3} fontSize="8" fill="#94a3b8" className="font-mono">
                    {val.toFixed(1)}m
                  </text>
                </g>
              );
            })}
          </g>

          {/* Dynamic Moving Level Indicator Needle */}
          <g transform={`translate(${tankExBox.x + 14}, ${waterYEx})`}>
            <polygon points="0,0 -8,-5 -8,5" fill="#60a5fa" />
            <line x1="0" y1="0" x2="60" y2="0" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3,2" />
          </g>

          {/* Threshold Lines */}
          <line x1={tankExBox.x} y1={maxYEx} x2={tankExBox.x + tankExBox.width} y2={maxYEx} stroke="#ef4444" strokeDasharray="4,3" strokeWidth="1.5" />
          <text x={tankExBox.x + tankExBox.width - 10} y={maxYEx - 5} textAnchor="end" fontSize="9" fill="#f87171" fontWeight="bold">
            MAX: 200.20m (100 m³)
          </text>

          <line x1={tankExBox.x} y1={fireYEx} x2={tankExBox.x + tankExBox.width} y2={fireYEx} stroke="#f59e0b" strokeDasharray="4,3" strokeWidth="1.5" />
          <text x={tankExBox.x + tankExBox.width - 10} y={fireYEx - 5} textAnchor="end" fontSize="9" fill="#fbbf24" fontWeight="bold">
            INCENDIU: 198.95m (43.9 m³)
          </text>

          <text x={tankExBox.x + 60} y={tankExBox.y + tankExBox.height - 8} fontSize="9" fill="#94a3b8">
            Radier CR: 198.00m
          </text>

          {/* Siphon & Bottom Intakes inside Tank Existent */}
          <path
            d={`M ${tankExBox.x + 140} ${tankExBox.y + tankExBox.height - 12} L ${tankExBox.x + 70} ${tankExBox.y + tankExBox.height - 12} L ${tankExBox.x + 70} 540 L ${tankExBox.x} 540`}
            fill="none"
            stroke="url(#pipeMetal)"
            strokeWidth="4"
          />
          <circle
            cx={tankExBox.x + 105}
            cy={tankExBox.y + tankExBox.height - 12}
            r="6"
            fill={params.regimIncendiu ? '#10b981' : '#ef4444'}
            stroke="#ffffff"
            strokeWidth="1"
          />

          <path
            d={`M ${tankExBox.x + 200} ${fireYEx + 20} L ${tankExBox.x + 200} ${fireYEx - 10} Q ${tankExBox.x + 175} ${fireYEx - 22} ${tankExBox.x + 150} ${fireYEx - 10} L ${tankExBox.x + 150} 540 L ${tankExBox.x} 540`}
            fill="none"
            stroke="url(#pipeMetal)"
            strokeWidth="4.5"
          />
          <text x={tankExBox.x + 150} y={fireYEx - 26} fontSize="8.5" fill="#cbd5e1" fontWeight="bold">
            Sifon (Gât lebădă)
          </text>

          {/* Float valve at top inlet (Clickable) */}
          <g
            transform={`translate(${tankExBox.x + 25}, ${tankExBox.y + 12})`}
            className="cursor-pointer hover:scale-105 transition select-none"
            onClick={onTogglePlutitorDefectExistent}
          >
            <title>Click pentru a simula Plutitor Blocat / Test Preaplin</title>
            <circle
              cx="12"
              cy={tankExistent.plutitorInchis ? 0 : 16}
              r="8"
              fill={params.plutitorDefectExistent ? '#f59e0b' : tankExistent.plutitorInchis ? '#ef4444' : '#60a5fa'}
              stroke="#0f172a"
              strokeWidth="1.5"
              className={params.plutitorDefectExistent ? 'animate-pulse' : ''}
            />
            <line x1="0" y1="0" x2="12" y2={tankExistent.plutitorInchis ? 0 : 16} stroke="#94a3b8" strokeWidth="2.5" />
            <text x="26" y="8" fontSize="8.5" fontWeight="bold" fill={params.plutitorDefectExistent ? '#fbbf24' : tankExistent.plutitorInchis ? '#f87171' : '#94a3b8'}>
              {params.plutitorDefectExistent ? 'Plutitor BLOCAT (Defect)' : tankExistent.plutitorInchis ? 'Plutitor ÎNCHIS' : 'Plutitor DESCHIS'}
            </text>
          </g>

          {/* Level Transmitters LT1 / LS */}
          <g transform={`translate(${tankExBox.x - 36}, ${tankExBox.y + 10})`}>
            <circle cx="14" cy="14" r="12" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="14" y="17.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#60a5fa">
              LT1
            </text>
            <circle cx="14" cy="44" r="12" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="14" y="47.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#60a5fa">
              LS
            </text>
          </g>

          {/* Large Floating Header Card for Tank Existent */}
          <g transform={`translate(${tankExBox.x + 30}, ${tankExBox.y - 62})`}>
            <rect x="0" y="0" width="240" height="52" rx="8" fill="#0b1120" stroke="#60a5fa" strokeWidth="2" />
            <text x="120" y="17" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#f8fafc">
              REZERVOR EXISTENT (V = 100 mc)
            </text>
            <text x="120" y="31" textAnchor="middle" fontSize="10" fill="#60a5fa" fontWeight="bold">
              Cota: {tankExistent.cotaApa.toFixed(2)} m | {tankExistent.volumCurent.toFixed(1)} mc ({tankExistent.procentNivel.toFixed(0)}%)
            </text>

            {/* Live Filling/Draining Trend Banner */}
            {tankExistent.tendinta === 'CRESTERE' && (
              <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#34d399" fontWeight="bold">
                ▲ SE UMPLE: +{tankExistent.dhDtCmMin.toFixed(1)} cm/min (+{tankExistent.qNet.toFixed(1)} l/s)
              </text>
            )}
            {tankExistent.tendinta === 'SCADERE' && (
              <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#f87171" fontWeight="bold">
                ▼ SE GOLEȘTE: {tankExistent.dhDtCmMin.toFixed(1)} cm/min ({tankExistent.qNet.toFixed(1)} l/s)
              </text>
            )}
            {tankExistent.tendinta === 'STABIL' && (
              <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#94a3b8">
                ● NIVEL STABIL (Qin = Qout = {tankExistent.qIn.toFixed(1)} l/s)
              </text>
            )}
          </g>

          {/* Overflow Bellmouth Funnel & Pipe for Tank Existent */}
          <g id="preaplin-ex" transform={`translate(${tankExBox.x + tankExBox.width - 32}, ${maxYEx})`}>
            <polygon
              points="0,0 24,0 16,16 8,16"
              fill={tankExistent.preaplinActiv ? '#1d4ed8' : '#334155'}
              stroke={tankExistent.preaplinActiv ? '#60a5fa' : '#64748b'}
              strokeWidth="1.5"
            />
            {tankExistent.preaplinActiv && (
              <ellipse cx="12" cy="2" rx="8" ry="3" fill="#e0f2fe" className="animate-ping opacity-90" />
            )}
          </g>
          {/* Overflow Discharge Pipe */}
          <path
            d={`M ${tankExBox.x + tankExBox.width - 20} ${maxYEx + 16} L ${tankExBox.x + tankExBox.width - 20} ${maxYEx + 30} L ${tankExBox.x + tankExBox.width + 30} ${maxYEx + 30} L ${tankExBox.x + tankExBox.width + 30} ${tankExBox.y + tankExBox.height + 50} L ${tankExBox.x + tankExBox.width + 75} ${tankExBox.y + tankExBox.height + 50}`}
            fill="none"
            stroke={tankExistent.preaplinActiv ? '#f43f5e' : '#475569'}
            strokeWidth={tankExistent.preaplinActiv ? '5' : '3'}
            strokeDasharray={tankExistent.preaplinActiv ? '6,4' : '4,4'}
            className={tankExistent.preaplinActiv ? 'animate-flow-fast' : ''}
            strokeLinecap="round"
          />
          {/* Sewer Pit */}
          <g transform={`translate(${tankExBox.x + tankExBox.width + 75}, ${tankExBox.y + tankExBox.height + 40})`}>
            <rect x="0" y="0" width="38" height="24" rx="4" fill="#090d16" stroke="#475569" strokeWidth="1.5" />
            <text x="19" y="15" textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="bold">
              CANAL
            </text>
            {tankExistent.preaplinActiv && (
              <circle cx="2" cy="10" r="7" fill="none" stroke="#f43f5e" strokeWidth="2" className="animate-ping" />
            )}
          </g>
          {tankExistent.preaplinActiv && (
            <g transform={`translate(${tankExBox.x + tankExBox.width + 40}, ${maxYEx + 70})`}>
              <rect x="-6" y="-12" width="115" height="26" rx="5" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" className="animate-pulse" />
              <text x="51" y="-1" textAnchor="middle" fontSize="8.5" fill="#ffe4e6" fontWeight="bold">
                🌊 PREAPLIN ACTIV!
              </text>
              <text x="51" y="10" textAnchor="middle" fontSize="8" fill="#fecdd3" className="font-mono">
                {flows.qPreaplinExistent.toFixed(1)} l/s la canal
              </text>
            </g>
          )}

          {/* Visual Stagnation Badge on Tank Existent */}
          {state.alertaStagnareExistent && (
            <g transform={`translate(${tankExBox.x + 35}, ${tankExBox.y + 65})`} className="animate-pulse select-none">
              <rect x="0" y="0" width="230" height="42" rx="6" fill="#451a03" stroke="#f59e0b" strokeWidth="2" fillOpacity="0.95" />
              <circle cx="16" cy="21" r="9" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="16" y="25" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fde68a">!</text>
              <text x="32" y="17" fontSize="9" fontWeight="extrabold" fill="#fde68a">
                ⚠️ RISC STAGNARE APĂ!
              </text>
              <text x="32" y="30" fontSize="7.5" fill="#fed7aa">
                Clapeta V4 este blocată de contrapresiunea H2
              </text>
            </g>
          )}
        </g>

        {/* Check valve on Existent Outlet */}
        <g id="check-valve" transform="translate(840, 540)">
          <polygon points="-12,-8 0,0 -12,8" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#ef4444" strokeWidth="2" />
          <text x="-6" y="22" textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="bold">
            Clapetă sens unic
          </text>
          {state.alertaStagnareExistent && (
            <g transform="translate(-10, -26)" className="animate-pulse">
              <rect x="-48" y="-9" width="96" height="17" rx="4" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
              <text x="0" y="2.5" textAnchor="middle" fontSize="7.5" fontWeight="extrabold" fill="#ffedd5">
                ⛔ BLOCATĂ PE ÎNCHIS
              </text>
            </g>
          )}
        </g>

        {/* ============================================================== */}
        {/* INTERACTIVE VALVES V1 ... V6 (SPACIOUS & ELEGANT)              */}
        {/* ============================================================== */}
        {/* V1: on vertical aducțiune to Rezervor Nou (X: 80, Y: 340) */}
        {renderValve('V1', 80, 340, true, 'right')}

        {/* V2: on aducțiune before Node N2 (X: 790, Y: 700) */}
        {renderValve('V2', 790, 700, true, 'top')}

        {/* V3: on discharge of Rezervor Nou (X: 535, Y: 330) */}
        {renderValve('V3', 535, 330, true, 'top')}

        {/* V4: on discharge of Rezervor Existent (X: 740, Y: 540) */}
        {renderValve('V4', 740, 540, true, 'top')}

        {/* V5: manual valve on vertical collector between H1 and H2 (X: 640, Y: 440) */}
        {renderValve('V5', 640, 440, false, 'right')}

        {/* V6: manual valve on gravity derivation H1 -> N2 (X: 580, Y: 480) */}
        {renderValve('V6', 580, 480, false, 'left')}

        {/* ============================================================== */}
        {/* NODES A, N2, H1, H2                                            */}
        {/* ============================================================== */}
        {renderNode('A', nodes.headA, 165, 700, 'bottom')}
        {renderNode('N2', nodes.headN2, 860, 700, 'bottom')}
        {renderNode('H1', nodes.headH1, 640, 330, 'top')}
        {renderNode('H2', nodes.headH2, 640, 540, 'bottom')}

        {/* ============================================================== */}
        {/* FLOWMETERS FT1 & FT2 + CHLORINATION STATIONS                   */}
        {/* ============================================================== */}
        {/* 1. Debitmetru Intrare Aducțiune FT1 */}
        {renderFlowmeter('FT1', flows.qFT1, state.volumCumulatFT1, 55, 700, COLOR_ADUCTIUNE)}

        {/* 2. Stație Preclorinare Cl2 - Imediat după FT1, înainte de intrarea în rezervoare */}
        {renderChlorinationStation(
          'station-preclorinare',
          'Preclorinare Cl₂',
          'Apă potabilă de aducțiune • Dozare Cl₂ înainte de rezervoare',
          115,
          700,
          state.preclorinareActiva,
          'top'
        )}

        {/* 3. Stație Dezinfecție Clor - După ieșirea din rezervoare, pe distribuție, înainte de FT2 */}
        {renderChlorinationStation(
          'station-dezinfectie',
          'Dezinfecție Clor',
          'Apă tratată din rezervoare • Clorinare finală înainte de FT2',
          740,
          755,
          state.dezinfectieFinalaActiva,
          'top'
        )}

        {/* 4. Debitmetru Ieșire Distribuție FT2 */}
        {renderFlowmeter('FT2', flows.qFT2, state.volumCumulatFT2, 850, 755, COLOR_TREATED)}

        {/* ============================================================== */}
        {/* FLOW RATE BADGES ON PIPE TRONSOANE                             */}
        {/* ============================================================== */}
        {/* Tronson Aducțiune Nou (V1) */}
        {flows.qAductiuneNou > 0.05 && (
          <g transform="translate(80, 210)">
            <rect x="-32" y="-9" width="64" height="17" rx="4" fill="#0b1120" stroke={COLOR_ADUCTIUNE} strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#f0abfc" fontWeight="bold" className="font-mono">
              ↑ {flows.qAductiuneNou.toFixed(1)} l/s
            </text>
          </g>
        )}

        {/* Tronson Aducțiune Existent (V2) */}
        {flows.qAductiuneExistent > 0.05 && (
          <g transform="translate(420, 690)">
            <rect x="-32" y="-9" width="64" height="17" rx="4" fill="#0b1120" stroke={COLOR_ADUCTIUNE} strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#f0abfc" fontWeight="bold" className="font-mono">
              → {flows.qAductiuneExistent.toFixed(1)} l/s
            </text>
          </g>
        )}

        {/* Tronson Ieșire Nou (V3) */}
        {flows.qIesireNou > 0.05 && (
          <g transform="translate(490, 315)">
            <rect x="-30" y="-9" width="60" height="17" rx="4" fill="#0b1120" stroke={COLOR_TREATED} strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#93c5fd" fontWeight="bold" className="font-mono">
              → {flows.qIesireNou.toFixed(1)} l/s
            </text>
          </g>
        )}

        {/* Tronson Colector V5 */}
        {Math.abs(flows.qV5) > 0.05 && (
          <g transform="translate(640, 485)">
            <rect x="-30" y="-9" width="60" height="17" rx="4" fill="#0b1120" stroke={COLOR_TREATED} strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#93c5fd" fontWeight="bold" className="font-mono">
              ↓ {flows.qV5.toFixed(1)} l/s
            </text>
          </g>
        )}

        {/* Tronson Derivație V6 */}
        {Math.abs(flows.qV6) > 0.05 && (
          <g transform="translate(580, 560)">
            <rect
              x={state.alertaCurgereBidirectionala ? '-62' : '-40'}
              y={state.alertaCurgereBidirectionala ? '-14' : '-10'}
              width={state.alertaCurgereBidirectionala ? '124' : '80'}
              height={state.alertaCurgereBidirectionala ? '28' : '18'}
              rx="5"
              fill="#0b1120"
              stroke={state.alertaCurgereBidirectionala ? '#f97316' : flows.qV6 < 0 ? '#ef4444' : COLOR_TREATED}
              strokeWidth={state.alertaCurgereBidirectionala ? '2' : '1.5'}
              className={state.alertaCurgereBidirectionala ? 'animate-pulse' : ''}
            />
            {state.alertaCurgereBidirectionala ? (
              <g>
                <text
                  x="0"
                  y="-1"
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#fdba74"
                  fontWeight="extrabold"
                  className="font-mono"
                >
                  ⇄ SENSURI OPUSE ({Math.abs(flows.qV6).toFixed(1)} l/s)
                </text>
                <text
                  x="0"
                  y="9"
                  textAnchor="middle"
                  fontSize="7"
                  fill="#fed7aa"
                  fontWeight="bold"
                >
                  Conflict presiuni: Nou ↓ ⇄ ↑ Pompare
                </text>
              </g>
            ) : (
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="9"
                fill={flows.qV6 < 0 ? '#f87171' : '#93c5fd'}
                fontWeight="bold"
                className="font-mono"
              >
                {Math.abs(flows.qV6).toFixed(1)} l/s {flows.qV6 < 0 ? '↑ CONTAM' : '↓ GRAV'}
              </text>
            )}
          </g>
        )}

        {/* Tronson Ieșire Existent (V4) */}
        {flows.qIesireExistent > 0.05 && (
          <g transform="translate(860, 525)">
            <rect x="-30" y="-9" width="60" height="17" rx="4" fill="#0b1120" stroke={COLOR_TREATED} strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#93c5fd" fontWeight="bold" className="font-mono">
              ← {flows.qIesireExistent.toFixed(1)} l/s
            </text>
          </g>
        )}

        {/* Tronson Distribuție Consumatori */}
        <g transform="translate(1080, 740)">
          <rect
            x="-55"
            y="-12"
            width="110"
            height="22"
            rx="5"
            fill="#090d16"
            stroke={alertaContaminare ? '#ef4444' : COLOR_TREATED}
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="10"
            fill={alertaContaminare ? '#f87171' : '#38bdf8'}
            fontWeight="bold"
            className="font-mono"
          >
            LIVRAT: {flows.qFT2.toFixed(1)} / {params.debitConsumCerut.toFixed(1)} l/s
          </text>
        </g>

        {/* Directional Labels */}
        <g transform="translate(20, 625)">
          <text x="0" y="0" fontSize="10.5" fontWeight="bold" fill="#f0abfc">
            Aducțiune (Apă potabilă pompată)
          </text>
          <text x="0" y="12" fontSize="9" fill="#e879f9">
            PEID De{params.diametruAductiuneMm || 90} PN{params.pnAductiune || 16} (Cota Pompă: +{params.cotaPiezometricaAductiune.toFixed(2)}m) → FT1 → Preclorinare Cl₂ → Nod A
          </text>
        </g>

        <g transform="translate(1140, 785)">
          <text x="0" y="0" fontSize="11" fontWeight="bold" fill="#93c5fd">
            Apă tratată la consumatori
          </text>
          <text x="0" y="13" fontSize="9" fill="#60a5fa">
            PEID De{params.diametruDistributieMm || 110} PN{params.pnDistributie || 10} (Dezinfecție Clor & FT2)
          </text>
        </g>

        {/* Compact Clean Engineering Legend */}
        <g transform="translate(30, 755)">
          <rect x="0" y="0" width="460" height="52" rx="6" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
          
          <line x1="12" y1="16" x2="38" y2="16" stroke={COLOR_ADUCTIUNE} strokeWidth="3.5" />
          <text x="44" y="19" fontSize="8.5" fill="#cbd5e1">
            Aducțiune (PEID De{params.diametruAductiuneMm || 90} PN{params.pnAductiune || 16}) • Preclorinare Cl₂ după FT1
          </text>

          <line x1="260" y1="16" x2="286" y2="16" stroke={COLOR_TREATED} strokeWidth="3.5" />
          <text x="292" y="19" fontSize="8.5" fill="#cbd5e1">
            Apă tratată (PEID De{params.diametruDistributieMm || 110} PN{params.pnDistributie || 10}) • Dezinfecție Clor înainte FT2
          </text>

          <line x1="12" y1="36" x2="38" y2="36" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
          <text x="44" y="39" fontSize="8.5" fill="#cbd5e1">
            Preaplin la canal
          </text>

          <circle cx="160" cy="36" r="5" fill="#10b981" />
          <text x="172" y="39" fontSize="8.5" fill="#cbd5e1">
            Vană DESCHISĂ / ÎNCHISĂ
          </text>

          <circle cx="310" cy="36" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          <text x="320" y="39" fontSize="8.5" fill="#cbd5e1">
            Nod piezometric (A, N2, H1, H2)
          </text>
        </g>
      </svg>
    </div>
  );
};
