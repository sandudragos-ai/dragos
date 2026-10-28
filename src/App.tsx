/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HistoryDataPoint,
  SimulationParams,
  SimulationState,
  TankConfig,
  ValveState,
} from './types/simulation';
import {
  DEFAULT_PARAMS,
  DEFAULT_TANK_EXISTENT,
  DEFAULT_TANK_NOU,
  createInitialSimulationState,
  solveHydraulics,
} from './simulation/hydraulicEngine';
import { PRESET_SCENARIOS } from './simulation/combos64';
import { Header } from './components/Header';
import { WaterSchemeSVG } from './components/WaterSchemeSVG';
import { ControlPanel } from './components/ControlPanel';
import { HistoryChart } from './components/HistoryChart';
import { CombinationsTableModal } from './components/CombinationsTableModal';
import { HypothesesModal } from './components/HypothesesModal';
import { exportSvgToPng } from './utils/exportSvgToPng';

export default function App() {
  const [tankNouCfg, setTankNouCfg] = useState<TankConfig>(DEFAULT_TANK_NOU);
  const [tankExistentCfg, setTankExistentCfg] = useState<TankConfig>(DEFAULT_TANK_EXISTENT);
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

  const [state, setState] = useState<SimulationState>(() =>
    createInitialSimulationState(DEFAULT_TANK_NOU, DEFAULT_TANK_EXISTENT)
  );

  const [history, setHistory] = useState<HistoryDataPoint[]>([]);
  const lastHistoryRecordTime = useRef<number>(0);

  // Modals state
  const [isCombosModalOpen, setIsCombosModalOpen] = useState(false);
  const [isHypothesesModalOpen, setIsHypothesesModalOpen] = useState(false);

  // Keep latest params and configs in refs for the simulation tick loop
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const tankNouCfgRef = useRef(tankNouCfg);
  tankNouCfgRef.current = tankNouCfg;
  const tankExistentCfgRef = useRef(tankExistentCfg);
  tankExistentCfgRef.current = tankExistentCfg;

  // Simulation step function
  const stepSimulation = useCallback((dt: number) => {
    setState((prev) => {
      const next = solveHydraulics(
        prev,
        paramsRef.current,
        tankNouCfgRef.current,
        tankExistentCfgRef.current,
        dt
      );

      // Record history sample approximately every 1 sim-second
      if (next.simTimeSeconds - lastHistoryRecordTime.current >= 1.0) {
        lastHistoryRecordTime.current = next.simTimeSeconds;
        setHistory((h) => {
          const newPt: HistoryDataPoint = {
            timeStr: `${Math.floor(next.simTimeSeconds)}s`,
            timeSec: next.simTimeSeconds,
            nivelNou: next.tankNou.cotaApa,
            nivelExistent: next.tankExistent.cotaApa,
            debitFT1: next.flows.qFT1,
            debitFT2: next.flows.qFT2,
            debitCerut: paramsRef.current.debitConsumCerut,
          };
          const trimmed = h.length > 90 ? h.slice(h.length - 89) : h;
          return [...trimmed, newPt];
        });
      }

      return next;
    });
  }, []);

  // Main tick loop
  useEffect(() => {
    if (!state.running) return;

    const tickIntervalMs = 50; // 20 updates per second
    const interval = setInterval(() => {
      // Scale dt by speed
      const dt = (tickIntervalMs / 1000) * state.speed;
      stepSimulation(dt);
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [state.running, state.speed, stepSimulation]);

  // Initial history seed
  useEffect(() => {
    setHistory([
      {
        timeStr: '0s',
        timeSec: 0,
        nivelNou: state.tankNou.cotaApa,
        nivelExistent: state.tankExistent.cotaApa,
        debitFT1: state.flows.qFT1,
        debitFT2: state.flows.qFT2,
        debitCerut: params.debitConsumCerut,
      },
    ]);
  }, []);

  // Toggle Valve handler
  const handleToggleValve = (valveKey: keyof ValveState) => {
    setState((prev) => {
      const newV = { ...prev.valves, [valveKey]: !prev.valves[valveKey] };
      return { ...prev, valves: newV };
    });
  };

  // Set all valves directly
  const handleSetAllValves = (newValves: ValveState) => {
    setState((prev) => ({ ...prev, valves: newValves }));
  };

  // Apply a preset scenario
  const handleApplyPreset = (presetId: number) => {
    const sc = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!sc) return;

    setParams((p) => ({
      ...p,
      regimIncendiu: sc.regimIncendiu,
      pompaPornita: sc.pompaPornita,
    }));

    setState((prev) => ({
      ...prev,
      valves: { ...sc.valves },
    }));
  };

  // Reset levels to initial state
  const handleResetSimulation = () => {
    const initial = createInitialSimulationState(tankNouCfg, tankExistentCfg);
    setState({
      ...initial,
      running: state.running,
      speed: state.speed,
    });
    setHistory([]);
    lastHistoryRecordTime.current = 0;
  };

  // Export PNG of SVG schematic
  const handleExportPng = async () => {
    const svgEl = document.querySelector('svg');
    if (!svgEl) {
      alert('Eroare: Nu s-a găsit elementul SVG pe pagină.');
      return;
    }
    try {
      await exportSvgToPng(svgEl, `schema-gospodarie-apa-${Date.now()}.png`);
    } catch (err) {
      console.error('Export PNG failed:', err);
      alert('A apărut o problemă la exportul imaginii PNG.');
    }
  };

  // Quick test for Preaplin (Overflow)
  const handleTestPreaplinNou = () => {
    const isDefect = !params.plutitorDefectNou;
    setParams((p) => ({
      ...p,
      pompaPornita: true,
      plutitorDefectNou: isDefect,
    }));
    setState((prev) => ({
      ...prev,
      valves: { ...prev.valves, V1: true },
      tankNou: {
        ...prev.tankNou,
        cotaApa: tankNouCfg.nivelMaxim,
        volumCurent: tankNouCfg.volumTotal,
        procentNivel: 100,
        plutitorInchis: !isDefect,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Application Header */}
      <Header
        running={state.running}
        speed={state.speed}
        simTimeSeconds={state.simTimeSeconds}
        onTogglePlay={() => setState((p) => ({ ...p, running: !p.running }))}
        onChangeSpeed={(newSpeed) => setState((p) => ({ ...p, speed: newSpeed }))}
        onReset={handleResetSimulation}
        onExportPng={handleExportPng}
        onOpenHypotheses={() => setIsHypothesesModalOpen(true)}
        onOpenCombos={() => setIsCombosModalOpen(true)}
        alertaContaminare={state.alertaContaminare}
        alertaDeficit={state.alertaDeficit}
        deficitVal={state.flows.qDeficit}
        alertaPreaplinNou={state.alertaPreaplinNou}
        alertaPreaplinExistent={state.alertaPreaplinExistent}
        qPreaplinNou={state.flows.qPreaplinNou}
        qPreaplinExistent={state.flows.qPreaplinExistent}
        tipAvertizare={state.tipAvertizare}
        titluAvertizare={state.titluAvertizare}
        mesajAvertizare={state.mesajAvertizare}
        scenariuNerecomandat={state.scenariuNerecomandat}
        preclorinareActiva={state.preclorinareActiva}
        dezinfectieFinalaActiva={state.dezinfectieFinalaActiva}
        alertaCurgereBidirectionala={state.alertaCurgereBidirectionala}
        tronsonBidirectional={state.tronsonBidirectional}
        detaliiCurgereBidirectionala={state.detaliiCurgereBidirectionala}
        alertaStagnareExistent={state.alertaStagnareExistent}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 md:p-4 grid grid-cols-1 xl:grid-cols-12 gap-4 max-w-[1720px] mx-auto w-full">
        {/* Left Column (8 cols): Interactive SVG Drawing + Real-time History Chart */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* Technological SVG Scheme */}
          <WaterSchemeSVG
            state={state}
            params={params}
            tankNouCfg={tankNouCfg}
            tankExistentCfg={tankExistentCfg}
            onToggleValve={handleToggleValve}
            onToggleIncendiu={() => setParams((p) => ({ ...p, regimIncendiu: !p.regimIncendiu }))}
            onTogglePompa={() => setParams((p) => ({ ...p, pompaPornita: !p.pompaPornita }))}
            onTogglePlutitorDefectNou={() => setParams((p) => ({ ...p, plutitorDefectNou: !p.plutitorDefectNou }))}
            onTogglePlutitorDefectExistent={() => setParams((p) => ({ ...p, plutitorDefectExistent: !p.plutitorDefectExistent }))}
            onTestPreaplinNou={handleTestPreaplinNou}
          />

          {/* Real-time History Graph */}
          <HistoryChart
            history={history}
            tankNouCfg={tankNouCfg}
            tankExistentCfg={tankExistentCfg}
            state={state}
          />
        </div>

        {/* Right Column (4 cols): Control Panel & Parameters */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <ControlPanel
            state={state}
            params={params}
            tankNouCfg={tankNouCfg}
            tankExistentCfg={tankExistentCfg}
            onUpdateParams={(p) => setParams((prev) => ({ ...prev, ...p }))}
            onUpdateTankNou={(cfg) => setTankNouCfg((prev) => ({ ...prev, ...cfg }))}
            onUpdateTankExistent={(cfg) => setTankExistentCfg((prev) => ({ ...prev, ...cfg }))}
            onToggleValve={handleToggleValve}
            onSetAllValves={handleSetAllValves}
            onApplyPreset={handleApplyPreset}
            onResetSimulation={handleResetSimulation}
            onOpenHypotheses={() => setIsHypothesesModalOpen(true)}
            onOpenCombos={() => setIsCombosModalOpen(true)}
          />
        </div>
      </main>

      {/* Modals */}
      <CombinationsTableModal
        isOpen={isCombosModalOpen}
        onClose={() => setIsCombosModalOpen(false)}
        currentValves={state.valves}
        onLoadCombo={handleSetAllValves}
      />

      <HypothesesModal
        isOpen={isHypothesesModalOpen}
        onClose={() => setIsHypothesesModalOpen(false)}
      />
    </div>
  );
}
