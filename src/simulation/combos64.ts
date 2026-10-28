/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComboInfo, ValveState } from '../types/simulation';

export function getAllCombinations(): ComboInfo[] {
  const combos: ComboInfo[] = [];

  for (let i = 0; i < 64; i++) {
    // Bit mapping: V1=bit 5, V2=bit 4, V3=bit 3, V4=bit 2, V5=bit 1, V6=bit 0
    const v1 = Boolean((i >> 5) & 1);
    const v2 = Boolean((i >> 4) & 1);
    const v3 = Boolean((i >> 3) & 1);
    const v4 = Boolean((i >> 2) & 1);
    const v5 = Boolean((i >> 1) & 1);
    const v6 = Boolean(i & 1);

    const valves: ValveState = {
      V1: v1,
      V2: v2,
      V3: v3,
      V4: v4,
      V5: v5,
      V6: v6,
    };

    const binaryString = `${v1 ? '1' : '0'}${v2 ? '1' : '0'}${v3 ? '1' : '0'}${v4 ? '1' : '0'}${v5 ? '1' : '0'}${v6 ? '1' : '0'}`;

    // Analysis
    const isContamination = v2 && v6;

    let category: 'NORMAL' | 'AVERTIZARE' | 'INTERZIS' = 'NORMAL';
    let title = '';
    let description = '';
    let fluxAductiune = '';
    let fluxDistributie = '';

    // Description of Supply
    if (v1 && v2) {
      fluxAductiune = 'Aducțiunea alimentează ambele rezervoare (V1+V2 deschise)';
    } else if (v1 && !v2) {
      fluxAductiune = 'Aducțiunea alimentează doar Rezervorul Nou (V1 deschisă)';
    } else if (!v1 && v2) {
      fluxAductiune = 'Aducțiunea alimentează doar Rezervorul Existent (V2 deschisă)';
    } else {
      fluxAductiune = 'Aducțiune oprită la rezervoare (V1 și V2 închise)';
    }

    // Description of Distribution
    const newReachesH1 = v3;
    const h1ReachesH2 = newReachesH1 && v5;
    const h1FillsExistent = newReachesH1 && v6;
    const exReachesH2 = v4;
    const distributionActive = h1ReachesH2 || exReachesH2;

    if (h1ReachesH2 && exReachesH2) {
      fluxDistributie = 'Ambele rezervoare livrează la consumatori (H2 alimentat de Nou prin V3-V5 și de Existent prin V4)';
    } else if (h1ReachesH2 && !exReachesH2) {
      fluxDistributie = 'Doar Rezervorul Nou livrează la consumatori (prin V3-V5; V4 închisă)';
    } else if (!h1ReachesH2 && exReachesH2) {
      if (h1FillsExistent) {
        fluxDistributie = 'Rezervorul Nou umple Existentul prin V6, iar Existentul livrează la consumatori prin V4';
      } else {
        fluxDistributie = 'Doar Rezervorul Existent livrează la consumatori (prin V4; Nou izolat)';
      }
    } else {
      if (h1FillsExistent) {
        fluxDistributie = 'Rezervorul Nou transferă apă în Existent (V6), dar consumatorii nu sunt alimentați (V5 și V4 închise)';
      } else {
        fluxDistributie = 'Distribuția către consumatori este complet blocată (debit 0 la FT2)';
      }
    }

    // Classification
    if (isContamination) {
      category = 'INTERZIS';
      title = 'INTERZIS: Risc major de contaminare aducțiune-rețea tratată';
      description =
        'V2 și V6 sunt simultan deschise. Presiunea mare de pompare din aducțiune pătrunde prin V6 în colectorul de apă tratată (H1). ' +
        (v5 ? 'Apa brută ajunge direct la consumatori prin V5 deschisă!' : 'Apa brută contaminează colectorul H1 și eventual Rezervorul Nou.');
    } else if (!distributionActive && (!v1 && !v2)) {
      category = 'AVERTIZARE';
      title = 'Sistem complet blocat (fără aducțiune și fără distribuție)';
      description = 'Toate circuitele vitale sunt oprite sau izolate. Nu se înmagazinează și nu se livrează apă.';
    } else if (!distributionActive) {
      category = 'AVERTIZARE';
      title = 'Distribuție consumatori oprită';
      description = 'Niciun rezervor nu trimite apă la H2 către consumatori. Se va declanșa deficit de apă.';
    } else if (!v1 && !v2) {
      category = 'AVERTIZARE';
      title = 'Aducțiune blocată (rezervoarele se golesc)';
      description = 'Consumatorii sunt alimentați exclusiv din rezerva de înmagazinare, fără aport din aducțiune.';
    } else if (v3 && !v5 && !v6) {
      category = 'AVERTIZARE';
      title = 'Ieșire Rezervor Nou înfundată la H1';
      description = 'V3 este deschisă dar atât V5 cât și V6 sunt închise; colectorul H1 este presurizat fără descărcare.';
    } else if (v1 && v2 && v3 && v4 && v5 && !v6) {
      // Regim 111110: Utilizatorul a sesizat corect riscul hidraulic de stagnare!
      category = 'AVERTIZARE';
      title = 'Risc major de stagnare a apei în Rezervorul Existent (Contrapresiune clapeta V4)';
      description =
        'Deși vanele V1-V5 sunt deschise, apa din Rezervorul Existent NU poate debita! Cota apei din Rezervorul Nou (+200.50...+202.93m) depășește nivelul maxim din Rezervorul Existent (+200.20m). Contrapresiunea creată în colectorul H2 ține clapeta de reținere V4 forțat închisă (Q_ieșire = 0 l/s). Când plutitorul de intrare atinge nivelul maxim și se închide, apa stagnează complet fără recirculare, pierzând clorul rezidual liber și riscând contaminare microbiologică.';
    } else {
      category = 'NORMAL';
      if (h1ReachesH2 && exReachesH2 && v1 && v2) {
        title = 'Regim paralel cu ambele rezervoare (Atenție la diferența de cote)';
        description = 'Ambele rezervoare sunt conectate la aducțiune și distribuție. Rezervorul cu cota superioară va avea prioritate hidraulică.';
      } else if (h1ReachesH2 && v1 && !exReachesH2 && !v2) {
        title = 'Regim exclusiv pe Rezervorul Nou (Existent izolat)';
        description = 'Rezervorul Nou preia tot consumul și aducțiunea. Rezervorul Existent este izolat pentru mentenanță sau spălare.';
      } else if (exReachesH2 && v2 && !h1ReachesH2 && !v1) {
        title = 'Regim exclusiv pe Rezervorul Existent (Nou izolat)';
        description = 'Rezervorul Existent preia tot consumul și aducțiunea. Rezervorul Nou este izolat complet.';
      } else if (h1FillsExistent && exReachesH2 && v1 && !v2 && !v5) {
        title = 'Transfer gravitațional în cascadă (Nou -> Existent -> Consum)';
        description = 'Rezervorul Nou primește aducțiunea și alimentează Rezervorul Existent prin gravitație (V6), iar acesta livrează la consumatori prin V4 (asigură timp dublu de contact și recirculare completă fără stagnare!).';
      } else {
        title = 'Regim operațional activ';
        description = `${fluxAductiune}. ${fluxDistributie}.`;
      }
    }

    combos.push({
      index: i,
      valves,
      binaryString,
      category,
      title,
      description,
      fluxAductiune,
      fluxDistributie,
      isContamination,
    });
  }

  return combos;
}

export const PRESET_SCENARIOS = [
  {
    id: 1,
    nume: '1. Alimentare și consum doar Rezervor Nou',
    descriere: 'Aducțiune doar în Rezervor Nou (V1=1), ieșire spre consumatori (V3=1, V5=1). Rezervor Existent complet izolat (V2=0, V4=0, V6=0).',
    valves: { V1: true, V2: false, V3: true, V4: false, V5: true, V6: false },
    regimIncendiu: false,
    pompaPornita: true,
  },
  {
    id: 2,
    nume: '2. Alimentare și consum doar Rezervor Existent',
    descriere: 'Aducțiune doar în Rezervor Existent (V2=1), ieșire prin clapetă/vană (V4=1). Rezervor Nou complet izolat (V1=0, V3=0, V5=0, V6=0).',
    valves: { V1: false, V2: true, V3: false, V4: true, V5: false, V6: false },
    regimIncendiu: false,
    pompaPornita: true,
  },
  {
    id: 3,
    nume: '3. Regim paralel aparent (111110) - Risc Stagnare Rezervor Existent',
    descriere: 'V1-V5 deschise, V6 închisă. Contrapresiunea Rezervorului Nou pe colectorul H2 blochează clapeta V4 pe închis, cauzând stagnarea apei în Rezervorul Existent!',
    valves: { V1: true, V2: true, V3: true, V4: true, V5: true, V6: false },
    regimIncendiu: false,
    pompaPornita: true,
  },
  {
    id: 4,
    nume: '4. Umplere gravitațională Nou -> Existent (V6) și livrare Existent (V4)',
    descriere: 'Aducțiune în Rezervor Nou (V1=1). Apa curge gravitațional din Nou în Existent prin V6 (V3=1, V6=1, V5=0). Existentul livrează la consumatori (V4=1). V2 este închisă pentru siguranță.',
    valves: { V1: true, V2: false, V3: true, V4: true, V5: false, V6: true },
    regimIncendiu: false,
    pompaPornita: true,
  },
  {
    id: 5,
    nume: '5. Rezervor Nou izolat (V3 închisă)',
    descriere: 'Rezervorul Nou este izolat la ieșire (V3=0). Existentul funcționează autonom (V2=1, V4=1).',
    valves: { V1: false, V2: true, V3: false, V4: true, V5: true, V6: false },
    regimIncendiu: false,
    pompaPornita: true,
  },
  {
    id: 6,
    nume: '6. Pompă aducțiune oprită (golire pe stoc)',
    descriere: 'Pompa aducțiune oprită (Q_pompă=0, FT1=0). Distribuția continuă din rezervoare prin V3-V5 și V4 până la rezervele de incendiu.',
    valves: { V1: true, V2: true, V3: true, V4: true, V5: true, V6: false },
    regimIncendiu: false,
    pompaPornita: false,
  },
  {
    id: 7,
    nume: '7. SCENARIU INTERZIS: V2 + V6 deschise (Bypass direct rezervor)',
    descriere: 'Atenție! Apa din aducțiune pătrunde prin V2 în nodul N2 și prin V6 direct în colectorul H1 și spre consumatori, fără a asigura timpul normat de retenție și dezinfectare în rezervoare. Risc sanitar și dezechilibru hidraulic!',
    valves: { V1: false, V2: true, V3: true, V4: false, V5: true, V6: true },
    regimIncendiu: false,
    pompaPornita: true,
  },
  {
    id: 8,
    nume: '8. Scenariu Incendiu (Priză de fund activată)',
    descriere: 'Se deschid prizele de fund din ambele rezervoare. Se depășește nivelul intangibil de incendiu pentru a asigura debitul maxim cerut.',
    valves: { V1: true, V2: true, V3: true, V4: true, V5: true, V6: false },
    regimIncendiu: true,
    pompaPornita: true,
  },
];
