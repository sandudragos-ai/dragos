/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  AlertTriangle,
  Flame,
  Droplets,
  BookOpen,
  Grid3X3,
  CheckCircle,
  ArrowLeftRight,
} from 'lucide-react';

interface Props {
  running: boolean;
  speed: number;
  simTimeSeconds: number;
  onTogglePlay: () => void;
  onChangeSpeed: (speed: number) => void;
  onReset: () => void;
  onExportPng: () => void;
  onOpenHypotheses: () => void;
  onOpenCombos: () => void;
  alertaContaminare: boolean;
  alertaDeficit: boolean;
  deficitVal: number;
  alertaPreaplinNou?: boolean;
  alertaPreaplinExistent?: boolean;
  qPreaplinNou?: number;
  qPreaplinExistent?: number;
  tipAvertizare?: 'NORMAL' | 'NERECOMANDAT' | 'INTERZIS';
  titluAvertizare?: string;
  mesajAvertizare?: string;
  scenariuNerecomandat?: boolean;
  preclorinareActiva?: boolean;
  dezinfectieFinalaActiva?: boolean;
  alertaCurgereBidirectionala?: boolean;
  tronsonBidirectional?: string;
  detaliiCurgereBidirectionala?: string;
  alertaStagnareExistent?: boolean;
}

export const Header: React.FC<Props> = ({
  running,
  speed,
  simTimeSeconds,
  onTogglePlay,
  onChangeSpeed,
  onReset,
  onExportPng,
  onOpenHypotheses,
  onOpenCombos,
  alertaContaminare,
  alertaDeficit,
  deficitVal,
  alertaPreaplinNou,
  alertaPreaplinExistent,
  qPreaplinNou = 0,
  qPreaplinExistent = 0,
  tipAvertizare = 'NORMAL',
  titluAvertizare = '',
  mesajAvertizare = '',
  scenariuNerecomandat = false,
  preclorinareActiva = true,
  dezinfectieFinalaActiva = true,
  alertaCurgereBidirectionala = false,
  tronsonBidirectional = '',
  detaliiCurgereBidirectionala = '',
  alertaStagnareExistent = false,
}) => {
  // Format sim time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 shadow-md px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Gospodărie Apă Potabilă – 2 Rezervoare & 6 Vane
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                SCADA SIM
              </span>

              {/* Status Badge */}
              {tipAvertizare === 'INTERZIS' ? (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  SCENARIU INTERZIS
                </span>
              ) : tipAvertizare === 'NERECOMANDAT' ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  SCENARIU NERECOMANDAT
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  REGIM CONFORM
                </span>
              )}

              {/* Chlorination Badges */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                  preclorinareActiva
                    ? 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500/50'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="Preclorinare cu clor imediat după FT1, înainte de intrarea în rezervoare"
              >
                Cl₂ Preclorinare: {preclorinareActiva ? 'ACTIV' : 'OPRIT'}
              </span>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                  dezinfectieFinalaActiva
                    ? 'bg-sky-950/60 text-sky-300 border-sky-500/50'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="Dezinfecție finală cu clor după ieșirea din rezervoare, înainte de FT2"
              >
                Cl₂ Dezinfecție: {dezinfectieFinalaActiva ? 'ACTIV' : 'OPRIT'}
              </span>

              {/* Bidirectional Flow Indicator */}
              {alertaCurgereBidirectionala && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/60 animate-pulse flex items-center gap-1">
                  <ArrowLeftRight className="w-3 h-3 text-orange-400" />
                  CURGERE BIDIRECȚIONALĂ ⇄
                </span>
              )}

              {/* Stagnation Alert Indicator */}
              {alertaStagnareExistent && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/70 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  STAGNARE REZ. EXISTENT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Simulare dinamică a curgerii apei în timp real • Desen SVG tehnic
            </p>
          </div>
        </div>

        {/* Simulation Execution Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
              running
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? 'Pauză' : 'Start'}</span>
          </button>

          <button
            onClick={onReset}
            title="Resetează simularea"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            {[1, 5, 10, 25, 50, 100].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition ${
                  speed === s
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                x{s}
              </button>
            ))}
          </div>

          {/* Time display */}
          <div className="pl-2 border-l border-slate-800 text-slate-300 font-mono text-xs font-semibold px-2">
            T: {formatTime(simTimeSeconds)}
          </div>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCombos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-sky-400" />
            <span>Toate 64 Combinații</span>
          </button>

          <button
            onClick={onOpenHypotheses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Ipoteze</span>
          </button>

          <button
            onClick={onExportPng}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Critical Alarm Alerts Bar (Shown dynamically) */}
      {(scenariuNerecomandat || alertaContaminare || alertaDeficit || alertaPreaplinNou || alertaPreaplinExistent || alertaCurgereBidirectionala) && (
        <div className="mt-2.5 space-y-1.5">
          {alertaCurgereBidirectionala && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-950/90 border-2 border-orange-500 text-orange-100 text-xs font-semibold animate-pulse shadow-lg">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <span className="font-extrabold text-orange-300 block">
                    ⚠️ AVERTIZARE: RISC DE CURGERE ÎN AMBELE SENSURI / CONFLICT HIDRAULIC DE PRESIUNI
                  </span>
                  <span className="text-[11px] text-orange-200">
                    Tronson: <strong>{tronsonBidirectional}</strong> — {detaliiCurgereBidirectionala}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-orange-600 text-white uppercase px-2.5 py-1 rounded font-extrabold tracking-wider shrink-0 ml-2">
                SENSURI OPUSE ⇄
              </span>
            </div>
          )}

          {tipAvertizare === 'INTERZIS' && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-red-950/90 border-2 border-red-500 text-red-100 text-xs font-semibold animate-pulse shadow-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <span className="font-extrabold text-red-300 block">{titluAvertizare || 'SCENARIU INTERZIS: Bypass aducțiune - distribuție'}</span>
                  <span className="text-[11px] text-red-200">
                    {mesajAvertizare || 'V2 și V6 sunt simultan deschise! Apa din aducțiune pătrunde în colector fără timpul normat de contact în rezervor.'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-red-600 text-white uppercase px-2.5 py-1 rounded-md font-extrabold tracking-wider shrink-0 ml-2">
                INTERZIS
              </span>
            </div>
          )}

          {tipAvertizare === 'NERECOMANDAT' && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/90 border border-amber-500 text-amber-100 text-xs font-semibold shadow-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 block">{titluAvertizare}</span>
                  <span className="text-[11px] text-amber-200">{mesajAvertizare}</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 uppercase px-2 py-0.5 rounded font-bold shrink-0 ml-2">
                NERECOMANDAT
              </span>
            </div>
          )}

          {alertaPreaplinNou && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-semibold animate-pulse shadow-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  PREAPLIN ACTIV (Rezervor NOU): Nivelul a depășit cota maximă (+202.93 m)! Apa se descarcă prin conducta de preaplin la canalizare ({qPreaplinNou.toFixed(1)} l/s).
                </span>
              </div>
              <span className="text-[10px] bg-rose-600 text-white uppercase px-2 py-0.5 rounded font-bold">
                PREAPLIN
              </span>
            </div>
          )}

          {alertaPreaplinExistent && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-semibold animate-pulse shadow-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  PREAPLIN ACTIV (Rezervor EXISTENT): Nivelul a depășit cota maximă (+200.20 m)! Apa se descarcă prin conducta de preaplin la canalizare ({qPreaplinExistent.toFixed(1)} l/s).
                </span>
              </div>
              <span className="text-[10px] bg-rose-600 text-white uppercase px-2 py-0.5 rounded font-bold">
                PREAPLIN
              </span>
            </div>
          )}

          {alertaDeficit && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-semibold shadow-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  AVERTIZARE: Deficit de apă la consumatori! Lipsesc {deficitVal.toFixed(1)} l/s față de cererea din rețea.
                </span>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 uppercase px-2 py-0.5 rounded font-bold">
                DEFICIT
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
