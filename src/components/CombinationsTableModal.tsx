/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ComboCategory, ComboInfo, ValveState } from '../types/simulation';
import { getAllCombinations } from '../simulation/combos64';
import {
  X,
  Search,
  Filter,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentValves: ValveState;
  onLoadCombo: (valves: ValveState) => void;
}

export const CombinationsTableModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentValves,
  onLoadCombo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | ComboCategory>('ALL');

  const allCombos = useMemo(() => getAllCombinations(), []);

  // Compute current combo binary string
  const currentBinary = `${currentValves.V1 ? '1' : '0'}${currentValves.V2 ? '1' : '0'}${currentValves.V3 ? '1' : '0'}${currentValves.V4 ? '1' : '0'}${currentValves.V5 ? '1' : '0'}${currentValves.V6 ? '1' : '0'}`;

  const filteredCombos = useMemo(() => {
    return allCombos.filter((c) => {
      if (selectedFilter !== 'ALL' && c.category !== selectedFilter) {
        return false;
      }
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.binaryString.includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.fluxAductiune.toLowerCase().includes(term) ||
        c.fluxDistributie.toLowerCase().includes(term)
      );
    });
  }, [allCombos, selectedFilter, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Matricea celor 64 de Combinații de Vane (2⁶ = 64)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fiecare combinație este clasificată automat și include explicarea detaliată a circuitelor hidraulice.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500 mr-1" />
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Toate (64)
            </button>
            <button
              onClick={() => setSelectedFilter('NORMAL')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition ${
                selectedFilter === 'NORMAL'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Normal ({allCombos.filter((c) => c.category === 'NORMAL').length})
            </button>
            <button
              onClick={() => setSelectedFilter('AVERTIZARE')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition ${
                selectedFilter === 'AVERTIZARE'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Avertizare ({allCombos.filter((c) => c.category === 'AVERTIZARE').length})
            </button>
            <button
              onClick={() => setSelectedFilter('INTERZIS')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition ${
                selectedFilter === 'INTERZIS'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Interzis (16)
            </button>
          </div>

          {/* Search Field */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută după titlu, vană sau cod binar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-44">Stare Vane (V1-V6)</th>
                <th className="py-3 px-4 w-28">Clasificare</th>
                <th className="py-3 px-4">Explicație & Regim de Funcționare</th>
                <th className="py-3 px-4 w-28 text-right">Acțiune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCombos.map((combo) => {
                const isCurrent = combo.binaryString === currentBinary;

                return (
                  <tr
                    key={combo.index}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-sky-950/40 border-l-4 border-l-sky-500'
                        : combo.category === 'INTERZIS'
                        ? 'hover:bg-red-950/20'
                        : combo.category === 'AVERTIZARE'
                        ? 'hover:bg-amber-950/20'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 text-center text-slate-500 font-mono">
                      {combo.index + 1}
                    </td>

                    {/* Vane Badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono font-bold">
                        {(['V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as (keyof ValveState)[]).map((vKey) => {
                          const val = combo.valves[vKey];
                          const isContamHighlight = combo.isContamination && (vKey === 'V2' || vKey === 'V6');

                          return (
                            <span
                              key={vKey}
                              title={`${vKey}: ${val ? 'DESCHIS' : 'ÎNCHIS'}`}
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isContamHighlight
                                  ? 'bg-red-500 text-white font-extrabold ring-1 ring-red-300'
                                  : val
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                              }`}
                            >
                              {val ? '1' : '0'}
                            </span>
                          );
                        })}
                        <span className="ml-2 text-slate-400 text-[11px] font-normal">
                          ({combo.binaryString})
                        </span>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 px-4">
                      {combo.category === 'NORMAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Normal
                        </span>
                      )}
                      {combo.category === 'AVERTIZARE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Avertizare
                        </span>
                      )}
                      {combo.category === 'INTERZIS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <ShieldAlert className="w-3 h-3" />
                          INTERZIS
                        </span>
                      )}
                    </td>

                    {/* Explanation */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{combo.title}</div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        {combo.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-500">
                        <span>
                          <strong className="text-slate-400">Aducțiune:</strong> {combo.fluxAductiune}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-slate-400">Distribuție:</strong> {combo.fluxDistributie}
                        </span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      {isCurrent ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold text-sky-400 bg-sky-950/60 rounded border border-sky-800">
                          Activ acum
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onLoadCombo(combo.valves);
                            onClose();
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded font-medium border border-slate-700 hover:border-blue-500 transition flex items-center gap-1 ml-auto"
                        >
                          <span>Încarcă</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <div>
            Afișate: <strong className="text-white">{filteredCombos.length}</strong> din 64 de combinații
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
};
