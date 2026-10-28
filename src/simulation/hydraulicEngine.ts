/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FlowRates,
  NodeHeads,
  SimulationParams,
  SimulationState,
  TankConfig,
  TankRuntimeState,
  ValveState,
} from '../types/simulation';

export const DEFAULT_TANK_NOU: TankConfig = {
  cotaRadier: 200.5,
  nivelIncendiu: 201.71,
  nivelMaxim: 202.93,
  volumTotal: 100, // mc
  suprafata: 100 / (202.93 - 200.5), // ~41.152 mp
  alarmLL: 200.7,
  alarmL: 201.2,
  alarmH: 202.6,
  alarmHH: 202.9,
};

export const DEFAULT_TANK_EXISTENT: TankConfig = {
  cotaRadier: 198.0,
  nivelIncendiu: 198.95,
  nivelMaxim: 200.2,
  volumTotal: 100, // mc
  suprafata: 100 / (200.2 - 198.0), // ~45.455 mp
  alarmLL: 198.2,
  alarmL: 198.5,
  alarmH: 199.9,
  alarmHH: 200.18,
};

export const DEFAULT_PARAMS: SimulationParams = {
  pompaPornita: true,
  cotaPiezometricaAductiune: 213.84, // m (Cota piezometrică a pompelor este până la cota 213.84)
  debitMaxPompa: 20.0, // l/s
  diametruAductiuneMm: 90, // De 90 mm
  pnAductiune: 16, // PN 16
  diametruDistributieMm: 110, // De 110 mm
  pnDistributie: 10, // PN 10
  debitConsumCerut: 12.0, // l/s
  profilConsumActiv: false,
  kV1: 8.5,
  kV2: 8.5,
  kV3: 9.0,
  kV4: 9.0,
  kV5: 12.0,
  kV6: 7.5,
  regimIncendiu: false,
  plutitorDefectNou: false,
  plutitorDefectExistent: false,
  histerezisPlutitor: 0.05, // 5 cm
};

export function getHourlyConsumptionFactor(simSeconds: number): number {
  // Simulates a 24-hour cycle (e.g. 1 sim-day = 24 * 3600 seconds)
  const hour = (simSeconds / 3600) % 24;
  // Bimodal curve: morning peak around 8:00 (1.4), evening peak around 19:00 (1.5), night minimum around 3:00 (0.4)
  const base = 1.0;
  const morning = 0.45 * Math.exp(-Math.pow((hour - 8) / 2.5, 2));
  const evening = 0.55 * Math.exp(-Math.pow((hour - 19) / 2.5, 2));
  const night = -0.45 * Math.exp(-Math.pow((hour - 3.5) / 2.5, 2));
  return Math.max(0.3, base + morning + evening + night);
}

export function computeTankAlarm(cota: number, cfg: TankConfig): 'NORMAL' | 'LL' | 'L' | 'H' | 'HH' {
  if (cota <= cfg.alarmLL) return 'LL';
  if (cota <= cfg.alarmL) return 'L';
  if (cota >= cfg.alarmHH) return 'HH';
  if (cota >= cfg.alarmH) return 'H';
  return 'NORMAL';
}

export function createInitialSimulationState(
  tankNouCfg: TankConfig = DEFAULT_TANK_NOU,
  tankExistentCfg: TankConfig = DEFAULT_TANK_EXISTENT
): SimulationState {
  const initialCotaNou = 202.2; // ~70% plin
  const initialCotaEx = 199.5; // ~68% plin

  const volNou = Math.max(0, (initialCotaNou - tankNouCfg.cotaRadier) * tankNouCfg.suprafata);
  const volEx = Math.max(0, (initialCotaEx - tankExistentCfg.cotaRadier) * tankExistentCfg.suprafata);

  const valves: ValveState = {
    V1: true,
    V2: true,
    V3: true,
    V4: true,
    V5: true,
    V6: false,
  };

  const tankNouState: TankRuntimeState = {
    cotaApa: initialCotaNou,
    inaltimeApa: initialCotaNou - tankNouCfg.cotaRadier,
    volumCurent: volNou,
    procentNivel: (volNou / tankNouCfg.volumTotal) * 100,
    plutitorInchis: false,
    preaplinActiv: false,
    prizaSifonBlocata: false,
    prizaFundDeschisa: false,
    alarmState: computeTankAlarm(initialCotaNou, tankNouCfg),
    qIn: 0,
    qOut: 0,
    qNet: 0,
    dhDtCmMin: 0,
    timpEstimatMin: null,
    tendinta: 'STABIL',
  };

  const tankExistentState: TankRuntimeState = {
    cotaApa: initialCotaEx,
    inaltimeApa: initialCotaEx - tankExistentCfg.cotaRadier,
    volumCurent: volEx,
    procentNivel: (volEx / tankExistentCfg.volumTotal) * 100,
    plutitorInchis: false,
    preaplinActiv: false,
    prizaSifonBlocata: false,
    prizaFundDeschisa: false,
    alarmState: computeTankAlarm(initialCotaEx, tankExistentCfg),
    qIn: 0,
    qOut: 0,
    qNet: 0,
    dhDtCmMin: 0,
    timpEstimatMin: null,
    tendinta: 'STABIL',
  };

  return {
    running: true,
    speed: 25,
    simTimeSeconds: 0,
    valves,
    tankNou: tankNouState,
    tankExistent: tankExistentState,
    flows: {
      qFT1: 0,
      qAductiuneNou: 0,
      qAductiuneExistent: 0,
      qIesireNou: 0,
      qV5: 0,
      qV6: 0,
      qIesireExistent: 0,
      qFT2: 0,
      qDeficit: 0,
      qPreaplinNou: 0,
      qPreaplinExistent: 0,
    },
    nodes: {
      headA: DEFAULT_PARAMS.cotaPiezometricaAductiune,
      headN2: 200.2,
      headH1: 202.0,
      headH2: 199.0,
      headConsum: 195.0,
    },
    volumCumulatFT1: 0,
    volumCumulatFT2: 0,
    alertaContaminare: false,
    alertaDeficit: false,
    alertaPreaplinNou: false,
    alertaPreaplinExistent: false,
    tipAvertizare: 'NORMAL',
    titluAvertizare: '',
    mesajAvertizare: '',
    scenariuNerecomandat: false,
    preclorinareActiva: true,
    dezinfectieFinalaActiva: true,
    byPassFaraContact: false,
    pompaPeVentilInchis: false,
    alertaCurgereBidirectionala: false,
    tronsonBidirectional: '',
    detaliiCurgereBidirectionala: '',
    alertaStagnareExistent: false,
    vitezaAductiune: 0,
    vitezaDistributie: 0,
    presiuneEfectivaAductiuneBar: Number(Math.max(0, (DEFAULT_PARAMS.cotaPiezometricaAductiune - 200.0) / 10.2).toFixed(2)),
    presiuneEfectivaDistributieBar: 0.1,
  };
}

export function solveHydraulics(
  prevState: SimulationState,
  params: SimulationParams,
  tankNouCfg: TankConfig,
  tankExistentCfg: TankConfig,
  dtSeconds: number
): SimulationState {
  const valves = prevState.valves;
  let cotaNou = prevState.tankNou.cotaApa;
  let cotaEx = prevState.tankExistent.cotaApa;

  // 1. Float valve state with hysteresis
  let plutitorNouInchis = prevState.tankNou.plutitorInchis;
  if (!params.plutitorDefectNou) {
    if (cotaNou >= tankNouCfg.nivelMaxim) {
      plutitorNouInchis = true;
    } else if (cotaNou <= tankNouCfg.nivelMaxim - params.histerezisPlutitor) {
      plutitorNouInchis = false;
    }
  } else {
    plutitorNouInchis = false; // defect: rămâne deschis
  }

  let plutitorExInchis = prevState.tankExistent.plutitorInchis;
  if (!params.plutitorDefectExistent) {
    if (cotaEx >= tankExistentCfg.nivelMaxim) {
      plutitorExInchis = true;
    } else if (cotaEx <= tankExistentCfg.nivelMaxim - params.histerezisPlutitor) {
      plutitorExInchis = false;
    }
  } else {
    plutitorExInchis = false; // defect: rămâne deschis
  }

  // 2. Siphon vs Fire bottom intake
  // Nou:
  const canExtractNou =
    params.regimIncendiu
      ? cotaNou > tankNouCfg.cotaRadier + 0.02
      : cotaNou > tankNouCfg.nivelIncendiu;
  const prizaSifonBlocataNou = !params.regimIncendiu && cotaNou <= tankNouCfg.nivelIncendiu;

  // Existent:
  const canExtractEx =
    params.regimIncendiu
      ? cotaEx > tankExistentCfg.cotaRadier + 0.02
      : cotaEx > tankExistentCfg.nivelIncendiu;
  const prizaSifonBlocataEx = !params.regimIncendiu && cotaEx <= tankExistentCfg.nivelIncendiu;

  // 3. Contamination Check: V2 is OPEN and V6 is OPEN
  const isContamination = valves.V2 && valves.V6;

  // 4. Hydraulic calculation with Pipe Diameter scaling
  const diamAductiune = params.diametruAductiuneMm || 90;
  const diamDistributie = params.diametruDistributieMm || 110;
  const factorAductiune = Math.pow(diamAductiune / 90, 2.5);
  const factorDistributie = Math.pow(diamDistributie / 110, 2.5);

  const effKV1 = params.kV1 * factorAductiune;
  const effKV2 = params.kV2 * factorAductiune;
  const effKV3 = params.kV3;
  const effKV4 = params.kV4;
  const effKV5 = params.kV5 * factorDistributie;
  const effKV6 = params.kV6;

  let headA = params.pompaPornita ? params.cotaPiezometricaAductiune : 0;
  let qFT1 = 0;
  let qAductiuneNou = 0;
  let qAductiuneExistent = 0;

  let headN2 = 200.2;
  let headH1 = canExtractNou ? cotaNou - 0.2 : 200.5;
  let headH2 = 197.0;
  let headConsum = 195.0;

  // Flow Aducțiune Nou (V1)
  if (params.pompaPornita && valves.V1 && !plutitorNouInchis && headA > tankNouCfg.nivelMaxim) {
    const dh1 = headA - tankNouCfg.nivelMaxim;
    qAductiuneNou = effKV1 * Math.sqrt(dh1);
  }

  // Branch Aducțiune Existent (V2) & Interaction at Node N2
  let qV6 = 0; // positive: H1 -> N2 (Gravity transfer), negative: N2 -> H1 (CONTAMINATION!)

  if (params.pompaPornita && valves.V2) {
    // Pump pressurizes N2!
    headN2 = headA - 1.5; // slight head loss from A to N2
    const dhN2Ex = Math.max(0, headN2 - tankExistentCfg.nivelMaxim);
    if (!plutitorExInchis) {
      qAductiuneExistent = effKV2 * Math.sqrt(dhN2Ex);
    } else {
      qAductiuneExistent = 0;
    }

    if (valves.V6) {
      // CONTAMINATION: Pumping pressure at N2 drives water up into H1 through V6
      const dhN2H1 = headN2 - headH1;
      if (dhN2H1 > 0) {
        // Reverse flow into H1!
        qV6 = -effKV6 * Math.sqrt(dhN2H1);
      }
    }
  } else {
    // V2 is closed or pump stopped. Node N2 can receive gravity water through V6 if V6 is open!
    if (valves.V6 && valves.V3 && canExtractNou && !plutitorExInchis) {
      // Gravity transfer from New tank to Existent tank
      const dhGrav = Math.max(0, cotaNou - tankExistentCfg.nivelMaxim);
      if (dhGrav > 0) {
        qV6 = effKV6 * Math.sqrt(dhGrav);
      }
      headN2 = tankExistentCfg.nivelMaxim;
    } else {
      headN2 = tankExistentCfg.cotaRadier;
    }
  }

  // Cap aducțiune pump flow to debitMaxPompa
  const rawPumpTotal = qAductiuneNou + qAductiuneExistent + (qV6 < 0 ? Math.abs(qV6) : 0);
  if (params.pompaPornita && rawPumpTotal > params.debitMaxPompa && rawPumpTotal > 0) {
    const scale = params.debitMaxPompa / rawPumpTotal;
    qAductiuneNou *= scale;
    qAductiuneExistent *= scale;
    if (qV6 < 0) qV6 *= scale;
  }
  qFT1 = qAductiuneNou + qAductiuneExistent + (qV6 < 0 ? Math.abs(qV6) : 0);

  // 5. Demand & Distribution network to consumers
  let qDemand = params.debitConsumCerut;
  if (params.profilConsumActiv) {
    qDemand *= getHourlyConsumptionFactor(prevState.simTimeSeconds);
  }

  // Sources available to deliver to H2 (and consumers):
  // Source A: From New Tank via V3 and V5 (or contamination water via V6 and V5)
  // Source B: From Existent Tank via V4 (with check valve)
  let qIesireNou = 0;
  let qV5 = 0;
  let qIesireExistent = 0;
  let qFT2 = 0;

  // Potential output from New Tank through V3
  let potNou = 0;
  if (valves.V3 && canExtractNou) {
    potNou = effKV3 * Math.sqrt(Math.max(0.1, cotaNou - 200.0));
  }

  // Potential head at H2 from New Tank
  const headH2FromNou = (valves.V3 && valves.V5 && canExtractNou) ? (cotaNou - 0.4) : 197.0;

  // Potential output from Existent Tank through V4 (Check valve prevents reverse flow)
  // CLAPETĂ DE REȚINERE SENS UNIC: Se deschide DOAR dacă cota din Existent depășește cota piezometrică din H2!
  // Dacă Rezervorul Nou alimentează H2 (cota ~201..202m), contrapresiunea ține clapeta V4 FORȚAT ÎNCHISĂ!
  let potExistent = 0;
  const isCheckValveBlockedByNou = valves.V3 && valves.V5 && canExtractNou && (headH2FromNou > cotaEx);
  if (valves.V4 && canExtractEx && !isCheckValveBlockedByNou) {
    potExistent = effKV4 * Math.sqrt(Math.max(0.1, cotaEx - 197.5));
  }

  if (isContamination && valves.V5) {
    // Water forced through V6 enters H1 and plunges down V5!
    qV5 = Math.abs(qV6);
    if (valves.V3 && canExtractNou) {
      qIesireNou = Math.min(potNou, 4.0);
      qV5 += qIesireNou;
    }
  } else if (valves.V5 && valves.V3 && canExtractNou) {
    // Normal feed from New Tank via V3 to V5
    if (valves.V6 && qV6 > 0) {
      // Part of New tank flow splits to V6
      const availableNou = potNou;
      const shareV6 = Math.min(availableNou * 0.45, qV6);
      qV6 = shareV6;
      qV5 = availableNou - qV6;
      qIesireNou = availableNou;
    } else {
      qV5 = potNou;
      qIesireNou = potNou;
    }
  } else if (valves.V6 && qV6 > 0 && valves.V3 && canExtractNou) {
    // V5 is closed, but V6 is open: all New tank discharge goes to Existent tank
    qIesireNou = Math.min(potNou, qV6);
    qV6 = qIesireNou;
    qV5 = 0;
  }

  // Delivery to H2:
  // H2 receives qV5 (if V5 open) and qIesireExistent (if V4 open and check valve allows)
  const availableAtH2 = (valves.V5 ? qV5 : 0) + potExistent;

  if (availableAtH2 <= 0) {
    qFT2 = 0;
    qIesireExistent = 0;
    if (valves.V5) qV5 = 0;
  } else if (availableAtH2 <= qDemand) {
    // Can only deliver what's available -> water deficit
    qFT2 = availableAtH2;
    qIesireExistent = potExistent;
  } else {
    // Available > Demand: throttle to demand
    qFT2 = qDemand;
    const ratio = qDemand / availableAtH2;
    if (!isContamination) {
      if (valves.V5) {
        qV5 *= ratio;
        qIesireNou *= ratio;
      }
    }
    qIesireExistent = potExistent * ratio;
  }

  // Calculate Node heads for visualization
  if (valves.V5 && canExtractNou) {
    headH2 = headH2FromNou;
  } else if (qIesireExistent > 0.05) {
    headH2 = cotaEx - 0.4;
  } else {
    headH2 = 197.0;
  }
  headConsum = qFT2 > 0 ? headH2 - 2.0 : 195.0;

  // 6. Tank Mass Balance & Integrator (dt in seconds)
  // Qin and Qout for Nou:
  const qInNou = qAductiuneNou;
  const qOutNou = qIesireNou;
  let dV_nou = ((qInNou - qOutNou) / 1000) * dtSeconds; // m3
  let newVolNou = prevState.tankNou.volumCurent + dV_nou;
  let qPreaplinNou = 0;

  // Max volume capacity & Preaplin (Overflow)
  const maxVolNou = (tankNouCfg.nivelMaxim - tankNouCfg.cotaRadier) * tankNouCfg.suprafata;
  if (newVolNou >= maxVolNou) {
    newVolNou = maxVolNou;
    // Overflow triggers if float is defective OR if water is pushed above max level
    if (params.plutitorDefectNou || (!plutitorNouInchis && qInNou > qOutNou)) {
      qPreaplinNou = Math.max(0, qInNou - qOutNou);
    }
  } else if (newVolNou < 0) {
    newVolNou = 0;
  }

  cotaNou = tankNouCfg.cotaRadier + newVolNou / tankNouCfg.suprafata;

  // Qin and Qout for Existent:
  // Inflow to Existent: aducțiune (qAductiuneExistent) + gravity transfer from V6 (if qV6 > 0)
  const qInEx = qAductiuneExistent + (qV6 > 0 ? qV6 : 0);
  const qOutEx = qIesireExistent;
  let dV_ex = ((qInEx - qOutEx) / 1000) * dtSeconds; // m3
  let newVolEx = prevState.tankExistent.volumCurent + dV_ex;
  let qPreaplinEx = 0;

  const maxVolEx = (tankExistentCfg.nivelMaxim - tankExistentCfg.cotaRadier) * tankExistentCfg.suprafata;
  if (newVolEx >= maxVolEx) {
    newVolEx = maxVolEx;
    if (params.plutitorDefectExistent || (!plutitorExInchis && qInEx > qOutEx)) {
      qPreaplinEx = Math.max(0, qInEx - qOutEx);
    }
  } else if (newVolEx < 0) {
    newVolEx = 0;
  }

  cotaEx = tankExistentCfg.cotaRadier + newVolEx / tankExistentCfg.suprafata;

  // 7. Cumulative Volumes (FT1 and FT2 in m3)
  const volFT1 = prevState.volumCumulatFT1 + (qFT1 / 1000) * dtSeconds;
  const volFT2 = prevState.volumCumulatFT2 + (qFT2 / 1000) * dtSeconds;

  // 8. Deficit Alert
  const deficit = Math.max(0, qDemand - qFT2);
  const alertaDeficit = deficit > 0.1;

  // 9. Rate of Level Change (Dinamică nivel în funcție de debite)
  // Tank Nou
  const qNetNou = qInNou - qOutNou;
  const dhDtNou = (qNetNou / 1000 / tankNouCfg.suprafata) * 60 * 100; // cm/min
  const tendintaNou: 'CRESTERE' | 'SCADERE' | 'STABIL' =
    qNetNou > 0.05 ? 'CRESTERE' : qNetNou < -0.05 ? 'SCADERE' : 'STABIL';

  let timpEstimatNou: number | null = null;
  if (tendintaNou === 'CRESTERE') {
    const volPanaLaMax = Math.max(0, maxVolNou - newVolNou);
    timpEstimatNou = volPanaLaMax > 0.01 && qNetNou > 0.05 ? (volPanaLaMax / (qNetNou / 1000)) / 60 : null;
  } else if (tendintaNou === 'SCADERE') {
    const volTinta = params.regimIncendiu
      ? 0
      : Math.max(0, (tankNouCfg.nivelIncendiu - tankNouCfg.cotaRadier) * tankNouCfg.suprafata);
    const volPanaLaTinta = Math.max(0, newVolNou - volTinta);
    timpEstimatNou = volPanaLaTinta > 0.01 && qNetNou < -0.05 ? (volPanaLaTinta / (Math.abs(qNetNou) / 1000)) / 60 : null;
  }

  // Tank Existent
  const qNetEx = qInEx - qOutEx;
  const dhDtEx = (qNetEx / 1000 / tankExistentCfg.suprafata) * 60 * 100; // cm/min
  const tendintaEx: 'CRESTERE' | 'SCADERE' | 'STABIL' =
    qNetEx > 0.05 ? 'CRESTERE' : qNetEx < -0.05 ? 'SCADERE' : 'STABIL';

  let timpEstimatEx: number | null = null;
  if (tendintaEx === 'CRESTERE') {
    const volPanaLaMax = Math.max(0, maxVolEx - newVolEx);
    timpEstimatEx = volPanaLaMax > 0.01 && qNetEx > 0.05 ? (volPanaLaMax / (qNetEx / 1000)) / 60 : null;
  } else if (tendintaEx === 'SCADERE') {
    const volTinta = params.regimIncendiu
      ? 0
      : Math.max(0, (tankExistentCfg.nivelIncendiu - tankExistentCfg.cotaRadier) * tankExistentCfg.suprafata);
    const volPanaLaTinta = Math.max(0, newVolEx - volTinta);
    timpEstimatEx = volPanaLaTinta > 0.01 && qNetEx < -0.05 ? (volPanaLaTinta / (Math.abs(qNetEx) / 1000)) / 60 : null;
  }

  const tankNouRuntime: TankRuntimeState = {
    cotaApa: Number(cotaNou.toFixed(3)),
    inaltimeApa: Number((cotaNou - tankNouCfg.cotaRadier).toFixed(3)),
    volumCurent: Number(newVolNou.toFixed(2)),
    procentNivel: Number(Math.min(100, Math.max(0, (newVolNou / tankNouCfg.volumTotal) * 100)).toFixed(1)),
    plutitorInchis: plutitorNouInchis,
    preaplinActiv: qPreaplinNou > 0.05,
    prizaSifonBlocata: prizaSifonBlocataNou,
    prizaFundDeschisa: params.regimIncendiu,
    alarmState: computeTankAlarm(cotaNou, tankNouCfg),
    qIn: Number(qInNou.toFixed(2)),
    qOut: Number(qOutNou.toFixed(2)),
    qNet: Number(qNetNou.toFixed(2)),
    dhDtCmMin: Number(dhDtNou.toFixed(2)),
    timpEstimatMin: timpEstimatNou ? Number(timpEstimatNou.toFixed(1)) : null,
    tendinta: tendintaNou,
  };

  const tankExistentRuntime: TankRuntimeState = {
    cotaApa: Number(cotaEx.toFixed(3)),
    inaltimeApa: Number((cotaEx - tankExistentCfg.cotaRadier).toFixed(3)),
    volumCurent: Number(newVolEx.toFixed(2)),
    procentNivel: Number(Math.min(100, Math.max(0, (newVolEx / tankExistentCfg.volumTotal) * 100)).toFixed(1)),
    plutitorInchis: plutitorExInchis,
    preaplinActiv: qPreaplinEx > 0.05,
    prizaSifonBlocata: prizaSifonBlocataEx,
    prizaFundDeschisa: params.regimIncendiu,
    alarmState: computeTankAlarm(cotaEx, tankExistentCfg),
    qIn: Number(qInEx.toFixed(2)),
    qOut: Number(qOutEx.toFixed(2)),
    qNet: Number(qNetEx.toFixed(2)),
    dhDtCmMin: Number(dhDtEx.toFixed(2)),
    timpEstimatMin: timpEstimatEx ? Number(timpEstimatEx.toFixed(1)) : null,
    tendinta: tendintaEx,
  };

  // Evaluare avertizări scenarii și tratare apă (preclorinare + dezinfecție clor)
  const preclorinareActiva = qFT1 > 0.05;
  const dezinfectieFinalaActiva = qFT2 > 0.05;
  const pompaPeVentilInchis = params.pompaPornita && !valves.V1 && !valves.V2;
  const byPassFaraContact = isContamination; // V2 && V6 deschise simultan

  let tipAvertizare: 'NORMAL' | 'NERECOMANDAT' | 'INTERZIS' = 'NORMAL';
  let titluAvertizare = '';
  let mesajAvertizare = '';
  let scenariuNerecomandat = false;

  // Verificare regim 111110 și stagnare în Rezervor Existent
  const isCombo111110 = valves.V1 && valves.V2 && valves.V3 && valves.V4 && valves.V5 && !valves.V6;
  const checkValveV4Blocked = isCheckValveBlockedByNou && valves.V4;
  const alertaStagnareExistent = checkValveV4Blocked && (plutitorExInchis || isCombo111110 || qAductiuneExistent < 0.05);

  if (byPassFaraContact) {
    tipAvertizare = 'INTERZIS';
    scenariuNerecomandat = true;
    titluAvertizare = 'CONFIGURAȚIE INTERZISĂ: Bypass aducțiune - distribuție directă';
    mesajAvertizare =
      'V2 și V6 sunt deschise simultan! Apa din aducțiune pătrunde direct în colectorul de distribuție fără timpul normat de retenție și contact chimic în rezervoare (risc de calitate și dezechilibru hidraulic).';
  } else if (isCombo111110) {
    tipAvertizare = 'NERECOMANDAT';
    scenariuNerecomandat = true;
    titluAvertizare = 'AVERTIZARE: Risc Stagnare Apă în Rezervorul Existent (Contrapresiune H2)';
    mesajAvertizare =
      'Regimul 111110 nu este conform pentru exploatare continuă! Cota superioară a apei din Rezervorul Nou (+200.50...+202.93m) menține colectorul H2 la cota ~201.5m, ținând clapeta de reținere V4 blocată pe închis (Q_ieșire = 0 l/s). Când rezervorul existent se umple la +200.20m și plutitorul oprește intrarea, apa stagnează complet fără recirculare, pierzând clorul rezidual liber și riscând degradarea microbiologică!';
  } else if (pompaPeVentilInchis) {
    tipAvertizare = 'NERECOMANDAT';
    scenariuNerecomandat = true;
    titluAvertizare = 'AVERTIZARE: Pompă de aducțiune cu refulare complet blocată';
    mesajAvertizare =
      'Pompa de aducțiune este pornită, însă vanele de intrare V1 și V2 sunt ambele închise. Presurizare excesivă și risc de avarie a agregatului de pompare (funcționare pe vană închisă).';
  } else if (params.debitConsumCerut > 0 && !((valves.V3 && valves.V5) || valves.V4)) {
    tipAvertizare = 'NERECOMANDAT';
    scenariuNerecomandat = true;
    titluAvertizare = 'AVERTIZARE: Rețea de distribuție izolată (Consum neacoperit)';
    mesajAvertizare =
      'Niciun rezervor nu poate debita către consumatori (circuitele prin V3+V5 și V4 sunt oprite). Risc de cădere de presiune în rețeaua locală de apă potabilă.';
  } else if ((!params.pompaPornita || (!valves.V1 && !valves.V2)) && qFT2 > 0.05) {
    tipAvertizare = 'NERECOMANDAT';
    scenariuNerecomandat = true;
    titluAvertizare = 'AVERTIZARE: Regim tranzitoriu - Alimentare pe stoc fără aducțiune';
    mesajAvertizare =
      'Consumatorii sunt alimentați doar din rezerva înmagazinată. Nivelul apei din rezervoare scade continuu; urmăriți pragul rezervei intangibile de incendiu.';
  } else if (tankNouRuntime.preaplinActiv || tankExistentRuntime.preaplinActiv) {
    tipAvertizare = 'NERECOMANDAT';
    scenariuNerecomandat = true;
    titluAvertizare = 'AVERTIZARE: Preaplin activat (Pierdere de apă potabilă)';
    mesajAvertizare =
      'Nivelul apei a depășit nivelul maxim admisibil. Apa se deversează gravitațional prin conducta de preaplin.';
  }

  // Evaluare posibilitate de curgere simultană în ambele sensuri / conflict de presiuni contrare
  let alertaCurgereBidirectionala = false;
  let tronsonBidirectional = '';
  let detaliiCurgereBidirectionala = '';

  if (valves.V6 && valves.V2 && valves.V3 && params.pompaPornita) {
    alertaCurgereBidirectionala = true;
    tronsonBidirectional = 'Derivația V6 (H1 ⇄ N2) și Joncțiunea H1';
    detaliiCurgereBidirectionala =
      `Conflict de presiuni contrare: Pompa de aducțiune împinge apa de jos în sus prin V6 (sarcină ~${params.cotaPiezometricaAductiune.toFixed(1)}m), în timp ce Rezervorul Nou împinge gravitațional de sus în jos prin V3 spre H1/V6 (~202m). În această conductă/nod forțele acționează simultan în ambele sensuri (risc de șoc hidraulic, reflux și turbulențe).`;
  } else if (valves.V6 && valves.V2 && params.pompaPornita) {
    alertaCurgereBidirectionala = true;
    tronsonBidirectional = 'Derivația V6 (H1 ⇄ N2)';
    detaliiCurgereBidirectionala =
      'Inversare completă de sens pe conducta V6: în loc de curgere gravitațională de sus în jos (Nou → Existent), pompa împinge forțat apa în sens invers (jos în sus spre colector).';
  } else if (valves.V4 && valves.V3 && valves.V5 && isCheckValveBlockedByNou) {
    alertaCurgereBidirectionala = true;
    tronsonBidirectional = 'Joncțiunea H2 / Clapeta de reținere V4';
    detaliiCurgereBidirectionala =
      `Contrapresiune opusă pe evacuare: sarcina piezometrică din H2 (${headH2.toFixed(1)}m adusă de Rezervor Nou) este mai mare decât nivelul din Existent (${cotaEx.toFixed(2)}m), creând forțe contrare și blocând clapeta V4.`;
  }

  // Calcul viteze efective în conducte (m/s) și presiuni
  const getInternalDiameterMm = (de: number, pn: number) => {
    if (pn >= 20) return de * 0.778; // SDR 9
    if (pn >= 16) return de * 0.818; // SDR 11
    if (pn >= 10) return de * 0.882; // SDR 17
    return de * 0.923; // SDR 26
  };

  const diAductiuneM = getInternalDiameterMm(diamAductiune, params.pnAductiune || 16) / 1000;
  const diDistributieM = getInternalDiameterMm(diamDistributie, params.pnDistributie || 10) / 1000;
  const aAductiune = (Math.PI * Math.pow(diAductiuneM, 2)) / 4;
  const aDistributie = (Math.PI * Math.pow(diDistributieM, 2)) / 4;

  const vitezaAductiune = aAductiune > 0 ? Number(((qFT1 / 1000) / aAductiune).toFixed(2)) : 0;
  const vitezaDistributie = aDistributie > 0 ? Number(((qFT2 / 1000) / aDistributie).toFixed(2)) : 0;

  // Presiuni la cota teren/nod intrare (~200.0m)
  const presiuneEfectivaAductiuneBar = Number(Math.max(0, (headA - 200.0) / 10.2).toFixed(2));
  const presiuneEfectivaDistributieBar = Number(Math.max(0, (headH2 - 198.0) / 10.2).toFixed(2));

  return {
    ...prevState,
    simTimeSeconds: prevState.simTimeSeconds + dtSeconds,
    tankNou: tankNouRuntime,
    tankExistent: tankExistentRuntime,
    flows: {
      qFT1: Number(qFT1.toFixed(2)),
      qAductiuneNou: Number(qAductiuneNou.toFixed(2)),
      qAductiuneExistent: Number(qAductiuneExistent.toFixed(2)),
      qIesireNou: Number(qIesireNou.toFixed(2)),
      qV5: Number(qV5.toFixed(2)),
      qV6: Number(qV6.toFixed(2)),
      qIesireExistent: Number(qIesireExistent.toFixed(2)),
      qFT2: Number(qFT2.toFixed(2)),
      qDeficit: Number(deficit.toFixed(2)),
      qPreaplinNou: Number(qPreaplinNou.toFixed(2)),
      qPreaplinExistent: Number(qPreaplinEx.toFixed(2)),
    },
    nodes: {
      headA: Number(headA.toFixed(2)),
      headN2: Number(headN2.toFixed(2)),
      headH1: Number(headH1.toFixed(2)),
      headH2: Number(headH2.toFixed(2)),
      headConsum: Number(headConsum.toFixed(2)),
    },
    volumCumulatFT1: Number(volFT1.toFixed(3)),
    volumCumulatFT2: Number(volFT2.toFixed(3)),
    alertaContaminare: isContamination,
    alertaDeficit,
    alertaPreaplinNou: tankNouRuntime.preaplinActiv,
    alertaPreaplinExistent: tankExistentRuntime.preaplinActiv,
    tipAvertizare,
    titluAvertizare,
    mesajAvertizare,
    scenariuNerecomandat,
    preclorinareActiva,
    dezinfectieFinalaActiva,
    byPassFaraContact,
    pompaPeVentilInchis,
    alertaCurgereBidirectionala,
    tronsonBidirectional,
    detaliiCurgereBidirectionala,
    alertaStagnareExistent,
    vitezaAductiune,
    vitezaDistributie,
    presiuneEfectivaAductiuneBar,
    presiuneEfectivaDistributieBar,
  };
}
