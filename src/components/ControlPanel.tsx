/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  SimulationParams,
  SimulationState,
  TankConfig,
  ValveState,
} from '../types/simulation';
import { PRESET_SCENARIOS } from '../simulation/combos64';
import {
  Sliders,
  Flame,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Settings2,
  Gauge,
  Layers,
} from 'lucide-react';

interface Props {
  state: SimulationState;
  params: SimulationParams;
  tankNouCfg: TankConfig;
  tankExistentCfg: TankConfig;
  onUpdateParams: (params: Partial<SimulationParams>) => void;
  onUpdateTankNou: (cfg: Partial<TankConfig>) => void;
  onUpdateTankExistent: (cfg: Partial<TankConfig>) => void;
  onToggleValve: (valve: keyof ValveState) => void;
  onSetAllValves: (valves: ValveState) => void;
  onApplyPreset: (presetId: number) => void;
  onResetSimulation: () => void;
  onOpenHypotheses: () => void;
  onOpenCombos: () => void;
}

export const ControlPanel: React.FC<Props> = ({
  state,
  params,
  tankNouCfg,
  tankExistentCfg,
  onUpdateParams,
  onUpdateTankNou,
  onUpdateTankExistent,
  onToggleValve,
  onSetAllValves,
  onApplyPreset,
  onResetSimulation,
  onOpenHypotheses,
  onOpenCombos,
}) => {
  const [activeTab, setActiveTab] = useState<'operare' | 'scenarii' | 'pompe_conducte' | 'hidraulica' | 'alarme'>('operare');

  const valveLabels: Record<keyof ValveState, { title: string; desc: string; type: string }> = {
    V1: { title: 'Vana V1 (Dn80)', desc: 'Intrare aducțiune în Rezervor NOU', type: 'Electrovană ON/OFF' },
    V2: { title: 'Vana V2 (Dn80)', desc: 'Intrare aducțiune în Rezervor EXISTENT', type: 'Electrovană ON/OFF' },
    V3: { title: 'Vana V3 (Dn80)', desc: 'Ieșire Rezervor NOU spre colector H1', type: 'Electrovană ON/OFF' },
    V4: { title: 'Vana V4 (Dn100)', desc: 'Ieșire Rezervor EXISTENT (+ Clapetă sens unic)', type: 'Electrovană ON/OFF' },
    V5: { title: 'Vana V5 (Dn100)', desc: 'Separare colector vertical între H1 și H2', type: 'Manuală' },
    V6: { title: 'Vana V6 (Dn100)', desc: 'Derivație gravitațională H1 -> N2 (atenție la V2!)', type: 'Manuală' },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Control Panel Tab Header */}
      <div className="flex flex-wrap border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 text-[11px] font-medium">
        <button
          onClick={() => setActiveTab('operare')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'operare'
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Vane</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarii')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'scenarii'
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Presetări</span>
        </button>

        <button
          onClick={() => setActiveTab('pompe_conducte')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'pompe_conducte'
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          <span>Pompe & Conducte</span>
        </button>

        <button
          onClick={() => setActiveTab('hidraulica')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'hidraulica'
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Parametri k</span>
        </button>

        <button
          onClick={() => setActiveTab('alarme')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'alarme'
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Alarme</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* ========================================================= */}
        {/* TAB 1: OPERARE VANE & POMPA                               */}
        {/* ========================================================= */}
        {activeTab === 'operare' && (
          <div className="space-y-4">
            {/* Visual Regime Alert Card */}
            {state.tipAvertizare === 'INTERZIS' ? (
              <div className="p-3 bg-red-950/80 border-2 border-red-500 rounded-lg text-red-100 animate-pulse shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>SCENARIU INTERZIS: Scurtcircuitare rezervoare!</span>
                </div>
                <p className="text-[11px] text-red-200 mt-1 leading-relaxed">
                  V2 și V6 sunt deschise simultan. Apa din aducțiune ajunge direct în colectorul de distribuție fără timpul normat de retenție și dezinfectare în rezervor.
                </p>
              </div>
            ) : state.tipAvertizare === 'NERECOMANDAT' ? (
              <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-lg text-amber-100 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{state.titluAvertizare || 'Scenariu Nerecomandat'}</span>
                </div>
                <p className="text-[11px] text-amber-200 mt-1 leading-relaxed">
                  {state.mesajAvertizare}
                </p>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Regim Recomandat & Conform</span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  Contact Rezervor Asigurat
                </span>
              </div>
            )}

            {/* Bidirectional Flow Warning in ControlPanel */}
            {state.alertaCurgereBidirectionala && (
              <div className="p-3 bg-orange-950/80 border-2 border-orange-500 rounded-lg text-orange-100 animate-pulse shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                  <span className="text-base font-extrabold">⇄</span>
                  <span>AVERTIZARE: Risc de Curgere în Ambele Sensuri pe Conductă!</span>
                </div>
                <p className="text-[11px] text-orange-200 mt-1 leading-relaxed">
                  <strong>Tronson:</strong> {state.tronsonBidirectional}
                  <br />
                  {state.detaliiCurgereBidirectionala}
                </p>
              </div>
            )}

            {/* Stagnation in Existing Tank Warning */}
            {state.alertaStagnareExistent && (
              <div className="p-3 bg-amber-950/90 border-2 border-amber-500 rounded-lg text-amber-100 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>AVERTIZARE: Risc de Stagnare a Apei în Rezervorul Existent!</span>
                </div>
                <p className="text-[11px] text-amber-200 mt-1 leading-relaxed">
                  Cota Rezervorului Nou (+200.50...+202.93m) este superioară cotei maxime din Rezervorul Existent (+200.20m). Presiunea creată în colectorul H2 ține <strong>clapeta de reținere V4 forțat închisă</strong> (debit ieșire = 0 l/s).
                  <br />
                  La atingerea nivelului maxim, plutitorul oprește intrarea, transformând Rezervorul Existent într-o zonă moartă unde apa stagnează, își pierde clorul dezinfectant și riscă alterarea calității.
                </p>
              </div>
            )}

            {/* Chlorination & Water Quality SCADA Block */}
            <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${state.preclorinareActiva ? 'bg-fuchsia-400 animate-pulse' : 'bg-slate-600'}`} />
                <div>
                  <div className="font-bold text-slate-300">Preclorinare Cl₂</div>
                  <div className="text-[10px] text-slate-400">după FT1: {state.preclorinareActiva ? 'ACTIVĂ' : 'OPRITĂ'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${state.dezinfectieFinalaActiva ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`} />
                <div>
                  <div className="font-bold text-slate-300">Dezinfecție Clor</div>
                  <div className="text-[10px] text-slate-400">înainte FT2: {state.dezinfectieFinalaActiva ? 'ACTIVĂ' : 'OPRITĂ'}</div>
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400">Combinație curentă:</span>
                <span className="ml-2 font-mono font-bold text-sky-400 text-sm">
                  {Object.entries(state.valves)
                    .map(([_, v]) => (v ? '1' : '0'))
                    .join('')}
                </span>
              </div>
              <button
                onClick={onOpenCombos}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-medium transition"
              >
                Vezi toate cele 64 combinații →
              </button>
            </div>

            {/* V1 ... V6 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(state.valves) as (keyof ValveState)[]).map((vKey) => {
                const isOpen = state.valves[vKey];
                const info = valveLabels[vKey];
                const isContamHighlight = state.alertaContaminare && (vKey === 'V2' || vKey === 'V6');

                return (
                  <div
                    key={vKey}
                    onClick={() => onToggleValve(vKey)}
                    className={`cursor-pointer p-3 rounded-lg border transition-all select-none flex items-center justify-between ${
                      isContamHighlight
                        ? 'bg-red-950/60 border-red-500 shadow-lg shadow-red-950/50'
                        : isOpen
                        ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{vKey}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({info.type})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{info.desc}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isOpen ? 'DESCHIS' : 'ÎNCHIS'}
                      </span>
                      {isOpen ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  onSetAllValves({ V1: true, V2: true, V3: true, V4: true, V5: true, V6: false })
                }
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 transition"
              >
                Deschide Vane Normale (V1-V5)
              </button>
              <button
                onClick={() =>
                  onSetAllValves({ V1: false, V2: false, V3: false, V4: false, V5: false, V6: false })
                }
                className="flex-1 py-1.5 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded text-xs font-medium border border-rose-800/50 transition"
              >
                Închide Toate Vanele
              </button>
            </div>

            {/* Primary Sliders: Pump & Consumer Demand */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-magenta-400" />
                  Pompă aducțiune (Q_max)
                </span>
                <span className="font-mono text-sky-400 font-bold">{params.debitMaxPompa.toFixed(1)} l/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={params.debitMaxPompa}
                onChange={(e) => onUpdateParams({ debitMaxPompa: Number(e.target.value) })}
                className="w-full accent-magenta-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Cerere consumatori (Q_consum)
                </span>
                <span className="font-mono text-blue-400 font-bold">{params.debitConsumCerut.toFixed(1)} l/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={params.debitConsumCerut}
                onChange={(e) => onUpdateParams({ debitConsumCerut: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={params.profilConsumActiv}
                    onChange={(e) => onUpdateParams({ profilConsumActiv: e.target.checked })}
                    className="rounded accent-blue-600"
                  />
                  <span>Aplică profil orar zilnic de consum (vârf dimineață / seară)</span>
                </label>
              </div>
            </div>

            {/* Fault Injections */}
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="text-slate-400 font-medium block">Simulare defecțiuni mecanice:</span>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={params.plutitorDefectNou}
                    onChange={(e) => onUpdateParams({ plutitorDefectNou: e.target.checked })}
                    className="rounded accent-rose-600"
                  />
                  <span>Plutitor blocat Rezervor Nou (provoacă preaplin)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={params.plutitorDefectExistent}
                    onChange={(e) => onUpdateParams({ plutitorDefectExistent: e.target.checked })}
                    className="rounded accent-rose-600"
                  />
                  <span>Plutitor blocat Rezervor Existent (provoacă preaplin)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRESETARI DE SCENARII                              */}
        {/* ========================================================= */}
        {activeTab === 'scenarii' && (
          <div className="space-y-2.5">
            <p className="text-slate-400 text-xs">
              Selectează un scenariu preset pentru a configura automat vanele și regimul de funcționare:
            </p>
            {PRESET_SCENARIOS.map((sc) => {
              const isContam = sc.id === 7;
              const isFire = sc.id === 8;

              return (
                <div
                  key={sc.id}
                  onClick={() => onApplyPreset(sc.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition select-none ${
                    isContam
                      ? 'bg-red-950/40 border-red-800 hover:bg-red-900/50 hover:border-red-600'
                      : isFire
                      ? 'bg-amber-950/40 border-amber-800 hover:bg-amber-900/50 hover:border-amber-600'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold ${
                        isContam ? 'text-red-400' : isFire ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {sc.nume}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {Object.entries(sc.valves)
                        .map(([_, v]) => (v ? '1' : '0'))
                        .join('')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-snug">{sc.descriere}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: POMPE & CONDUCTE (EDITARE CARACTERISTICI)          */}
        {/* ========================================================= */}
        {activeTab === 'pompe_conducte' && (
          <div className="space-y-4">
            {/* Header info card */}
            <div className="p-3 bg-gradient-to-r from-sky-950/80 to-blue-950/80 rounded-xl border border-sky-800/60 shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-xs">Caracteristici Pompe & Conducte</h3>
                    <p className="text-[10px] text-slate-400">Parametri de proiectare rețea aducțiune și distribuție</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateParams({
                      cotaPiezometricaAductiune: 213.84,
                      debitMaxPompa: 20.0,
                      diametruAductiuneMm: 90,
                      pnAductiune: 16,
                      diametruDistributieMm: 110,
                      pnDistributie: 10,
                    })
                  }
                  title="Resetează caracteristicile la valorile nominale de proiect"
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] font-semibold transition"
                >
                  Reset Proiect
                </button>
              </div>
            </div>

            {/* SECTIUNEA 1: AGREGAT DE POMPARE ADUCTIUNE */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-200">Pompa Aducțiune (Stație Pompare)</span>
                </div>
                <button
                  onClick={() => onUpdateParams({ pompaPornita: !params.pompaPornita })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    params.pompaPornita
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {params.pompaPornita ? 'PORNITĂ' : 'OPRITĂ'}
                </button>
              </div>

              {/* Cota Piezometrica Pompa */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Cota Piezometrică Refulare Pompare:</label>
                  <span className="font-mono font-bold text-sky-400 text-xs">
                    {params.cotaPiezometricaAductiune.toFixed(2)} m M.N.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="202.0"
                    max="230.0"
                    step="0.05"
                    value={params.cotaPiezometricaAductiune}
                    onChange={(e) => onUpdateParams({ cotaPiezometricaAductiune: Number(e.target.value) })}
                    className="flex-1 accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={params.cotaPiezometricaAductiune}
                    onChange={(e) => onUpdateParams({ cotaPiezometricaAductiune: Number(e.target.value) })}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs text-right"
                  />
                </div>
                {/* Presets cota */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Preset:</span>
                  {[208.0, 213.84, 218.0, 222.0].map((c) => (
                    <button
                      key={c}
                      onClick={() => onUpdateParams({ cotaPiezometricaAductiune: c })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                        Math.abs(params.cotaPiezometricaAductiune - c) < 0.05
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {c === 213.84 ? '213.84m (Proiect)' : `${c}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Debit Maxim Pompa */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Debit Nominal / Maxim Pompă (Q):</label>
                  <span className="font-mono font-bold text-sky-400 text-xs">
                    {params.debitMaxPompa.toFixed(1)} l/s ({((params.debitMaxPompa * 3600) / 1000).toFixed(0)} m³/h)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5.0"
                    max="45.0"
                    step="0.5"
                    value={params.debitMaxPompa}
                    onChange={(e) => onUpdateParams({ debitMaxPompa: Number(e.target.value) })}
                    className="flex-1 accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={params.debitMaxPompa}
                    onChange={(e) => onUpdateParams({ debitMaxPompa: Number(e.target.value) })}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono text-xs text-right"
                  />
                </div>
              </div>

              {/* Hydraulic Head Margin Indicators */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] border-t border-slate-900">
                <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-400 block">Sarcina peste Rez. Nou (+202.93m):</span>
                  <span className="font-mono font-bold text-emerald-400 text-[11px]">
                    +{(params.cotaPiezometricaAductiune - 202.93).toFixed(2)} mCA (~
                    {((params.cotaPiezometricaAductiune - 202.93) / 10.2).toFixed(2)} bar)
                  </span>
                </div>
                <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                  <span className="text-slate-400 block">Sarcina peste Rez. Existent (+200.20m):</span>
                  <span className="font-mono font-bold text-emerald-400 text-[11px]">
                    +{(params.cotaPiezometricaAductiune - 200.2).toFixed(2)} mCA (~
                    {((params.cotaPiezometricaAductiune - 200.2) / 10.2).toFixed(2)} bar)
                  </span>
                </div>
              </div>
            </div>

            {/* SECTIUNEA 2: CONDUCTA DE ADUCTIUNE */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-fuchsia-500" />
                  <span className="font-bold text-slate-200">Conductă Aducțiune (PEID Pompată)</span>
                </div>
                <span className="font-mono text-[11px] text-fuchsia-300 font-semibold">
                  PEID De{params.diametruAductiuneMm} PN{params.pnAductiune}
                </span>
              </div>

              {/* Diametru Aductiune */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] block">Diametru Exterior De (mm):</label>
                <div className="flex flex-wrap gap-1.5">
                  {[75, 90, 110, 125, 160].map((d) => (
                    <button
                      key={d}
                      onClick={() => onUpdateParams({ diametruAductiuneMm: d })}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                        params.diametruAductiuneMm === d
                          ? 'bg-fuchsia-600 text-white font-bold shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      De {d} mm
                    </button>
                  ))}
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="300"
                    value={params.diametruAductiuneMm}
                    onChange={(e) => onUpdateParams({ diametruAductiuneMm: Number(e.target.value) })}
                    className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-100 font-mono text-xs text-center"
                    placeholder="custom"
                  />
                </div>
              </div>

              {/* Presiune Nominala PN Aductiune */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] block">Clasă de Presiune Nominală PN (bar):</label>
                <div className="flex gap-2">
                  {[10, 16, 20, 25].map((pn) => (
                    <button
                      key={pn}
                      onClick={() => onUpdateParams({ pnAductiune: pn })}
                      className={`flex-1 py-1 rounded text-xs font-mono transition ${
                        params.pnAductiune === pn
                          ? 'bg-fuchsia-600 text-white font-bold shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      PN {pn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viteza apei in timp real pe aductiune */}
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Viteză apă prin conductă (FT1 = {state.flows.qFT1.toFixed(1)} l/s):</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      state.vitezaAductiune > 1.8
                        ? 'text-red-400'
                        : state.vitezaAductiune >= 0.7 && state.vitezaAductiune <= 1.5
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    v = {state.vitezaAductiune.toFixed(2)} m/s
                  </span>
                </div>
                {/* Visual Velocity Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      state.vitezaAductiune > 1.8
                        ? 'bg-red-500'
                        : state.vitezaAductiune >= 0.7 && state.vitezaAductiune <= 1.5
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (state.vitezaAductiune / 2.5) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0 m/s</span>
                  <span className="text-emerald-500">Optim normativ: 0.7 – 1.5 m/s</span>
                  <span>2.5 m/s</span>
                </div>
              </div>
            </div>

            {/* SECTIUNEA 3: CONDUCTA DE DISTRIBUTIE */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500" />
                  <span className="font-bold text-slate-200">Conductă Distribuție Consumatori</span>
                </div>
                <span className="font-mono text-[11px] text-sky-300 font-semibold">
                  PEID De{params.diametruDistributieMm} PN{params.pnDistributie}
                </span>
              </div>

              {/* Diametru Distributie */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] block">Diametru Exterior De (mm):</label>
                <div className="flex flex-wrap gap-1.5">
                  {[90, 110, 125, 140, 160, 200].map((d) => (
                    <button
                      key={d}
                      onClick={() => onUpdateParams({ diametruDistributieMm: d })}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                        params.diametruDistributieMm === d
                          ? 'bg-sky-600 text-white font-bold shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      De {d} mm
                    </button>
                  ))}
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="300"
                    value={params.diametruDistributieMm}
                    onChange={(e) => onUpdateParams({ diametruDistributieMm: Number(e.target.value) })}
                    className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-100 font-mono text-xs text-center"
                    placeholder="custom"
                  />
                </div>
              </div>

              {/* Presiune Nominala PN Distributie */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] block">Clasă de Presiune Nominală PN (bar):</label>
                <div className="flex gap-2">
                  {[6, 10, 16].map((pn) => (
                    <button
                      key={pn}
                      onClick={() => onUpdateParams({ pnDistributie: pn })}
                      className={`flex-1 py-1 rounded text-xs font-mono transition ${
                        params.pnDistributie === pn
                          ? 'bg-sky-600 text-white font-bold shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      PN {pn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viteza apei in timp real pe distributie */}
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Viteză apă prin conductă (FT2 = {state.flows.qFT2.toFixed(1)} l/s):</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      state.vitezaDistributie > 1.8
                        ? 'text-red-400'
                        : state.vitezaDistributie >= 0.7 && state.vitezaDistributie <= 1.5
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    v = {state.vitezaDistributie.toFixed(2)} m/s
                  </span>
                </div>
                {/* Visual Velocity Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      state.vitezaDistributie > 1.8
                        ? 'bg-red-500'
                        : state.vitezaDistributie >= 0.7 && state.vitezaDistributie <= 1.5
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (state.vitezaDistributie / 2.5) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0 m/s</span>
                  <span className="text-emerald-500">Optim normativ: 0.7 – 1.5 m/s</span>
                  <span>2.5 m/s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: HIDRAULICA & PARAMETRI CONDUCTE                    */}
        {/* ========================================================= */}
        {activeTab === 'hidraulica' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="text-slate-300 font-semibold block">Aducțiune (Pompă)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[11px]">Cota Piezom. Nod A (mMN):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={params.cotaPiezometricaAductiune}
                    onChange={(e) => onUpdateParams({ cotaPiezometricaAductiune: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Histerezis plutitor (m):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={params.histerezisPlutitor}
                    onChange={(e) => onUpdateParams({ histerezisPlutitor: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="text-slate-300 font-semibold block">Suprafețe orizontale rezervoare (A = V / ΔH)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[11px]">Suprafață Rezervor Nou (m²):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={Number(tankNouCfg.suprafata.toFixed(2))}
                    onChange={(e) => onUpdateTankNou({ suprafata: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Calculat: 100 / 2.43 = 41.15 m²</span>
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Suprafață Rez. Existent (m²):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={Number(tankExistentCfg.suprafata.toFixed(2))}
                    onChange={(e) => onUpdateTankExistent({ suprafata: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Calculat: 100 / 2.20 = 45.45 m²</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="text-slate-300 font-semibold block">Coeficienți hidraulici k vane (l/s per √m)</span>
              <div className="grid grid-cols-3 gap-2">
                {(['kV1', 'kV2', 'kV3', 'kV4', 'kV5', 'kV6'] as (keyof SimulationParams)[]).map((kKey) => (
                  <div key={kKey}>
                    <label className="text-slate-400 text-[10px] font-mono">{kKey}:</label>
                    <input
                      type="number"
                      step="0.5"
                      value={Number(params[kKey])}
                      onChange={(e) => onUpdateParams({ [kKey]: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PRAGURI ALARME LT / LS                             */}
        {/* ========================================================= */}
        {activeTab === 'alarme' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="text-sky-400 font-semibold block">Alarme Nivel Rezervor Nou (LT2 / LS)</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă LL (Foarte scăzut):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankNouCfg.alarmLL}
                    onChange={(e) => onUpdateTankNou({ alarmLL: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă L (Scăzut):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankNouCfg.alarmL}
                    onChange={(e) => onUpdateTankNou({ alarmL: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă H (Ridicat):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankNouCfg.alarmH}
                    onChange={(e) => onUpdateTankNou({ alarmH: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă HH (Preaplin / critic):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankNouCfg.alarmHH}
                    onChange={(e) => onUpdateTankNou({ alarmHH: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <span className="text-blue-400 font-semibold block">Alarme Nivel Rezervor Existent (LT1 / LS)</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă LL:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankExistentCfg.alarmLL}
                    onChange={(e) => onUpdateTankExistent({ alarmLL: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă L:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankExistentCfg.alarmL}
                    onChange={(e) => onUpdateTankExistent({ alarmL: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă H:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankExistentCfg.alarmH}
                    onChange={(e) => onUpdateTankExistent({ alarmH: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px]">Alarmă HH:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={tankExistentCfg.alarmHH}
                    onChange={(e) => onUpdateTankExistent({ alarmHH: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={onOpenHypotheses}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Ipoteze de calcul</span>
        </button>

        <button
          onClick={onResetSimulation}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Niveluri</span>
        </button>
      </div>
    </div>
  );
};
