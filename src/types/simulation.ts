/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ValveState {
  V1: boolean; // Electrovană intrare Rezervor Nou
  V2: boolean; // Electrovană intrare Rezervor Existent
  V3: boolean; // Electrovană ieșire Rezervor Nou
  V4: boolean; // Electrovană ieșire Rezervor Existent (+ clapetă sens unic)
  V5: boolean; // Vană manuală colector vertical între H1 și H2
  V6: boolean; // Vană manuală derivație H1 -> N2 (gravitațional nou -> existent)
}

export interface TankConfig {
  cotaRadier: number; // m Marea Neagră
  nivelIncendiu: number; // m Marea Neagră
  nivelMaxim: number; // m Marea Neagră
  volumTotal: number; // mc (100 mc)
  suprafata: number; // mp
  alarmLL: number; // m Marea Neagră
  alarmL: number; // m Marea Neagră
  alarmH: number; // m Marea Neagră
  alarmHH: number; // m Marea Neagră
}

export interface SimulationParams {
  // Pompă aducțiune
  pompaPornita: boolean;
  cotaPiezometricaAductiune: number; // m (ex: 213.84 m)
  debitMaxPompa: number; // l/s (ex: 20 l/s)
  
  // Caracteristici conducte (diametru și clasă de presiune PN)
  diametruAductiuneMm: number; // mm (De90 default)
  pnAductiune: number; // bar (PN16 default)
  diametruDistributieMm: number; // mm (De110 default)
  pnDistributie: number; // bar (PN10 default)

  // Consumatori
  debitConsumCerut: number; // l/s (ex: 12 l/s)
  profilConsumActiv: boolean; // profil orar zi/noapte
  
  // Coeficienți hidraulici conducte / vane k (l/s per sqrt(m))
  kV1: number;
  kV2: number;
  kV3: number;
  kV4: number;
  kV5: number;
  kV6: number;
  
  // Mod de funcționare special
  regimIncendiu: boolean; // deschide priza de fund în ambele rezervoare
  plutitorDefectNou: boolean; // permite depășirea nivelului maxim (preaplin)
  plutitorDefectExistent: boolean;
  
  // Histerezis plutitor (m)
  histerezisPlutitor: number; // 0.05 m
}

export interface TankRuntimeState {
  cotaApa: number; // m Marea Neagră curentă
  inaltimeApa: number; // m deasupra radierului
  volumCurent: number; // mc
  procentNivel: number; // 0 - 100%
  plutitorInchis: boolean;
  preaplinActiv: boolean;
  prizaSifonBlocata: boolean; // când nivelul coboară sub nivelul de incendiu și nu e mod incendiu
  prizaFundDeschisa: boolean;
  alarmState: 'NORMAL' | 'LL' | 'L' | 'H' | 'HH';
  
  // Dinamică nivel în funcție de debit
  qIn: number; // l/s debit intrare
  qOut: number; // l/s debit ieșire
  qNet: number; // l/s bilanț net (qIn - qOut)
  dhDtCmMin: number; // cm/min viteză de variație a nivelului (dH/dt)
  timpEstimatMin: number | null; // minute până la plin sau gol
  tendinta: 'CRESTERE' | 'SCADERE' | 'STABIL';
}

export interface FlowRates {
  // Debite în l/s (+ indică sens normal, - invers)
  qFT1: number; // Aducțiune total
  qAductiuneNou: number; // Ramura V1 spre Rezervor Nou
  qAductiuneExistent: number; // Ramura V2 spre N2
  
  qIesireNou: number; // Ieșire din Rezervor Nou prin V3
  qV5: number; // Curgere H1 -> H2
  qV6: number; // Curgere H1 <-> N2 (pozitiv: H1 -> N2; negativ: N2 -> H1 contaminare!)
  
  qIesireExistent: number; // Ieșire din Rezervor Existent prin V4 spre H2
  qFT2: number; // Plecare consumatori din H2
  qDeficit: number; // Q cerut - Q livrat (dacă > 0)
  
  // Preaplin
  qPreaplinNou: number;
  qPreaplinExistent: number;
}

export interface NodeHeads {
  headA: number; // Cota piezometrică nod A (aducțiune)
  headN2: number; // Nod N2 (intrare rezervor existent)
  headH1: number; // Nod H1 (colector superior)
  headH2: number; // Nod H2 (colector inferior)
  headConsum: number; // Nod consumatori
}

export interface SimulationState {
  running: boolean;
  speed: number; // 1, 5, 10, 50, 100
  simTimeSeconds: number; // timp scurs în simulare
  valves: ValveState;
  tankNou: TankRuntimeState;
  tankExistent: TankRuntimeState;
  flows: FlowRates;
  nodes: NodeHeads;
  
  // Volume cumulate (mc)
  volumCumulatFT1: number;
  volumCumulatFT2: number;
  
  // Alarme active & Stare tehnologică
  alertaContaminare: boolean; // V2 + V6 deschise (INTERZIS - Bypass fără contact în rezervor)
  alertaDeficit: boolean;
  alertaPreaplinNou: boolean;
  alertaPreaplinExistent: boolean;
  
  // Avertizare scenariu nerecomandat / interzis
  tipAvertizare: 'NORMAL' | 'NERECOMANDAT' | 'INTERZIS';
  titluAvertizare: string;
  mesajAvertizare: string;
  scenariuNerecomandat: boolean;
  
  // Tratare și dezinfecție clor
  preclorinareActiva: boolean;
  dezinfectieFinalaActiva: boolean;
  byPassFaraContact: boolean;
  pompaPeVentilInchis: boolean;

  // Avertizare curgere bidirecțională / conflict de presiuni opuse pe aceeași conductă
  alertaCurgereBidirectionala: boolean;
  tronsonBidirectional: string;
  detaliiCurgereBidirectionala: string;

  // Stagnare apă în Rezervor Existent (cauzată de contrapresiune H2)
  alertaStagnareExistent: boolean;
  
  // Calcul dinamic viteze și presiuni pe conducte
  vitezaAductiune: number; // m/s
  vitezaDistributie: number; // m/s
  presiuneEfectivaAductiuneBar: number; // bar la cota radier/nod intrare
  presiuneEfectivaDistributieBar: number; // bar
}

export type ComboCategory = 'NORMAL' | 'AVERTIZARE' | 'INTERZIS';

export interface ComboInfo {
  index: number;
  valves: ValveState;
  binaryString: string;
  category: ComboCategory;
  title: string;
  description: string;
  fluxAductiune: string;
  fluxDistributie: string;
  isContamination: boolean;
}

export interface HistoryDataPoint {
  timeStr: string;
  timeSec: number;
  nivelNou: number;
  nivelExistent: number;
  debitFT1: number;
  debitFT2: number;
  debitCerut: number;
}
