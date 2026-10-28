/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HypothesesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">
              Ipoteze Tehnice & Model Hidraulic de Simulare
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* 1. Date Geometrice */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              1. Date Geometrice și Cote (Raportate la Marea Neagră)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <strong className="text-slate-100 block mb-1">Rezervor NOU (V = 100 mc):</strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Cota radier (CR): <strong>200.50 m</strong></li>
                  <li>Nivel intangibil de incendiu: <strong>201.71 m</strong> (H_rel = 1.21 m, rezerva incendiu 47.31 mc)</li>
                  <li>Nivel maxim de umplere: <strong>202.93 m</strong> (H_rel = 2.43 m)</li>
                  <li>Suprafață orizontală: <strong>A = 100 mc / (202.93 - 200.50) = 41.152 m²</strong></li>
                </ul>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <strong className="text-slate-100 block mb-1">Rezervor EXISTENT (V = 100 mc):</strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Cota radier (CR): <strong>198.00 m</strong></li>
                  <li>Nivel intangibil de incendiu: <strong>198.95 m</strong> (H_rel = 0.95 m, rezerva incendiu 43.87 mc)</li>
                  <li>Nivel maxim de umplere: <strong>200.20 m</strong> (H_rel = 2.20 m)</li>
                  <li>Suprafață orizontală: <strong>A = 100 mc / (200.20 - 198.00) = 45.455 m²</strong></li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <strong className="text-slate-100 block mb-1">Stație de Pompare & Conducte Rețea (Valori Proiect):</strong>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Cota piezometrică refulare pompe: <strong>213.84 m</strong> (asigură o sarcină de +10.91 mCA peste nivelul maxim al Rezervorului Nou și +13.64 mCA peste Rezervorul Existent).</li>
                <li>Debit nominal pompă: <strong>20.0 l/s</strong> (72 m³/h).</li>
                <li>Conductă de aducțiune: <strong>PEID De90 PN16</strong> (rezistență la presiune până la 16 bar).</li>
                <li>Conductă de distribuție consumatori: <strong>PEID De110 PN10</strong> (curgere gravitațională).</li>
                <li>Toți acești parametri pot fi editați dinamic în timp real din tab-ul dedicat <strong>«Pompe & Conducte»</strong>.</li>
              </ul>
            </div>
            <p className="mt-2 text-slate-400 italic">
              * Observație topologică cheie: Radierul rezervorului nou (+200.50 m) este situat mai sus decât nivelul maxim al rezervorului existent (+200.20 m). Acest lucru permite umplerea gravitațională din Rezervorul Nou în Rezervorul Existent prin vana V6.
            </p>
          </div>

          {/* 2. Model Hidraulic */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              2. Ecuații de Bilanț și Dinamică Hidraulică
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Bilanț de masă continuu:</strong> Pentru fiecare rezervor, variația volumului și a cotei este descrisă de ecuația diferențială:
                <br />
                <code className="text-sky-300 font-mono bg-slate-900 px-2 py-0.5 rounded inline-block my-1">
                  A · (dH / dt) = (Q_intrare - Q_ieșire) / 1000 [mc/s]
                </code>
              </p>
              <p>
                <strong>Curgeri prin conducte și vane:</strong> Scurgerea turbulentă sub sarcină este aproximată prin relația Bernoulli / orificiu:
                <br />
                <code className="text-sky-300 font-mono bg-slate-900 px-2 py-0.5 rounded inline-block my-1">
                  Q = k · sign(Δh) · √|Δh| [l/s]
                </code>
                , unde coeficientul <span className="font-mono text-amber-300">k</span> înglobează pierderile liniare și locale ale fiecărei ramuri.
              </p>
            </div>
          </div>

          {/* 3. Prizele cu Sifon vs Incendiu */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              3. Funcționarea Prizelor: Sifon (Gât de Lebădă) vs Priză de Fund (Incendiu)
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
              <li>
                <strong>Regim normal (Priza cu sifon):</strong> Priza de fund este închisă. Apa este aspirată doar prin conducta cu gât de lebădă, al cărei prag superior este situat exact la nivelul intangibil de incendiu (201.71 m Nou, 198.95 m Existent). Dacă nivelul apei scade sub această cotă, sifonul aspiră aer și curgerea se întrerupe automat, garantând protecția rezervei de incendiu.
              </li>
              <li>
                <strong>Regim Incendiu:</strong> Se deschide manual sau automat priza de fund (la radier). Astfel, întregul volum de apă (inclusiv rezerva intangibilă) poate fi extras până la golirea completă a rezervoarelor.
              </li>
            </ul>
          </div>

          {/* 4. Tratarea Apei: Preclorinare și Dezinfecție Finală cu Clor */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              4. Lanțul Tehnologic de Tratare: Preclorinare Cl₂ & Dezinfecție Finală
            </h3>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong>Apă de aducțiune potabilă:</strong> Apa sosită prin conducta PEID De90 PN16 este apă potabilă.
              </p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  <strong className="text-fuchsia-300">Preclorinare Cl₂:</strong> Se efectuează <strong>imediat după debitmetrul de intrare FT1</strong>, înainte de bifurcarea spre rezervoare (nodul A). Aceasta asigură oxidarea inițială și pregătirea apei.
                </li>
                <li>
                  <strong className="text-sky-300">Timp de contact în rezervoare:</strong> Apa staționează în cele două rezervoare de câte 100 mc (volum tampon și contact chimic), garantând timpul necesar de reacție a dezinfectantului.
                </li>
                <li>
                  <strong className="text-blue-300">Dezinfecție finală cu clor:</strong> Se efectuează <strong>după ieșirea din rezervoare, pe conducta de distribuție gravitațională De110, înainte de debitmetrul FT2</strong>. Aceasta asigură menținerea concentrației de clor rezidual liber în întreaga rețea a consumatorilor.
                </li>
              </ul>
            </div>
          </div>

          {/* 5. Regula Critică de Interdicție & Scenarii Nerecomandate */}
          <div className="p-4 bg-red-950/30 rounded-xl border border-red-800/80">
            <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              5. Avertizări Vizuale: Scenarii Nerecomandate și Interzise
            </h3>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong className="text-red-300">⛔ SCENARIU INTERZIS (V2 + V6 deschise simultan):</strong>
                <br />
                Presiunea pompei de aducțiune împinge apa prin V2 în nodul N2 și direct prin derivația V6 în colectorul de distribuție H1. Apa din aducțiune ocolește rezervoarele (bypass direct fără timpul normat de retenție și dezinfectare), provocând dezechilibru hidraulic și risc de calitate.
              </p>
              <div>
                <strong className="text-amber-300">⚠️ SCENARII NERECOMANDATE:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-300">
                  <li>
                    <strong className="text-amber-200">Regimul 111110 (Risc major de stagnare apă în Rezervorul Existent):</strong> Deși vanele V1-V5 sunt deschise, cota Rezervorului Nou (+200.50...+202.93m) impune o contrapresiune superioară în colectorul H2 (~201.5m) față de nivelul maxim al Rezervorului Existent (+200.20m). Aceasta ține clapeta de reținere V4 blocată pe închis (Q_ieșire = 0). Când rezervorul se umple și plutitorul oprește intrarea, apa devine captivă și stagnează, degradându-se calitatea apei potabile.
                  </li>
                  <li><strong>Pompă pe ventil închis:</strong> Pompa funcționează, dar V1 și V2 sunt ambele închise (risc de suprapresiune și avarie a agregatului).</li>
                  <li><strong>Distribuție izolată:</strong> Niciun rezervor nu poate livra la consumatori (deficit forțat de apă).</li>
                  <li><strong>Alimentare pe stoc fără aducțiune:</strong> Rezervoarele se golesc continuu până la pragul de incendiu.</li>
                  <li><strong>Preaplin activ:</strong> Plutitor defect sau blocat, pierdere de apă potabilă la canalizare.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. Automatizări și Senzori */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              5. Automatizări, Plutitoare și Robinet de Reținere
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
              <li>
                <strong>Robinetul cu plutitor:</strong> Închide mecanic intrarea la atingerea nivelului maxim (202.93 m / 200.20 m) și se redeschide după o scădere de 5 cm (histerezis).
              </li>
              <li>
                <strong>Robinetul de reținere (V4):</strong> Cu arc, pe descărcarea rezervorului existent, asigură că apa curge exclusiv dinspre rezervor spre colectorul H2 (niciodată invers).
              </li>
              <li>
                <strong>Preaplin:</strong> Dacă se activează opțiunea de testare «Plutitor defect», nivelul depășește cota maximă și se activează conducta de preaplin cu debit de evacuare la canalizare.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Am înțeles
          </button>
        </div>
      </div>
    </div>
  );
};
