'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  RotateCcw, Trash2, Activity, Crown,
  Target, BarChart3, Upload,
  ShieldAlert, Database, Cpu, Radio, Gauge, Scale, ArrowDownRight, TrendingUp, Flame
} from 'lucide-react';

export type SymbolId = 
  | 'tomato' | 'pepper' | 'corn' | 'carrot' 
  | 'rooster' | 'sheep' | 'shrimp' | 'fish';

export interface SymbolInfo {
  id: SymbolId;
  name: string;
  emoji: string;
  color: string;
  type: 'vegetable' | 'animal';
  multiplier: number;
}

export const SYMBOLS: SymbolInfo[] = [
  { id: 'tomato',  name: 'بندورة', emoji: '🍅', color: '#EF4444', type: 'vegetable', multiplier: 5 },
  { id: 'pepper',  name: 'فلفل',   emoji: '🌶️', color: '#F97316', type: 'vegetable', multiplier: 5 },
  { id: 'corn',    name: 'ذرة',    emoji: '🌽', color: '#EAB308', type: 'vegetable', multiplier: 5 },
  { id: 'carrot',  name: 'جزر',    emoji: '🥕', color: '#FB923C', type: 'vegetable', multiplier: 5 },
  { id: 'rooster', name: 'ديك',    emoji: '🐓', color: '#DC2626', type: 'animal', multiplier: 45 },
  { id: 'sheep',   name: 'خروف',   emoji: '🐑', color: '#A3A3A3', type: 'animal', multiplier: 15 },
  { id: 'shrimp',  name: 'جمبري',  emoji: '🦐', color: '#EC4899', type: 'animal', multiplier: 10 },
  { id: 'fish',    name: 'سمكة',   emoji: '🐟', color: '#3B82F6', type: 'animal', multiplier: 25 },
];

const THEORETICAL_WEIGHTS: Record<SymbolId, number> = (() => {
  const raw: Record<string, number> = {};
  let sum = 0;
  SYMBOLS.forEach(s => { raw[s.id] = 1 / s.multiplier; sum += raw[s.id]; });
  const normalized: Record<string, number> = {};
  SYMBOLS.forEach(s => { normalized[s.id] = (raw[s.id] / sum) * 100; });
  return normalized as Record<SymbolId, number>;
})();

interface ResultRow {
  id: number;
  symbol_id: SymbolId;
  created_at: string;
}

export default function HomePage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/results', { cache: 'no-store' });
      if (!res.ok) throw new Error(`GET failed (${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Data is not an array');
      const validRows: ResultRow[] = data.map((row: any) => ({
        id: Number(row.id),
        symbol_id: row.symbol_id as SymbolId,
        created_at: row.created_at || new Date().toISOString()
      }));
      setResults(validRows);
      setError(null);
    } catch (e) {
      console.error('fetchResults error:', e);
      setError('تعذر جلب النتائج.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchResults();
      setLoading(false);
    })();
  }, [fetchResults]);

  const handleAddSymbol = useCallback(async (symbolId: SymbolId) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol_id: symbolId }),
      });
      if (!res.ok) throw new Error('POST failed');
      await fetchResults();
    } catch (e) { 
      console.error(e); 
      setError('تعذر إضافة النتيجة'); 
    }
    finally { setSubmitting(false); }
  }, [submitting, fetchResults]);

  const handleUndo = useCallback(async () => {
    if (submitting || results.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/results', { method: 'DELETE' });
      if (!res.ok) throw new Error('Undo failed');
      await fetchResults();
    } catch (e) { 
      console.error(e); 
      setError('تعذر التراجع'); 
    }
    finally { setSubmitting(false); }
  }, [submitting, results.length, fetchResults]);

  const handleClearAll = useCallback(async () => {
    if (submitting) return;
    if (!confirm('هل أنت متأكد من مسح كل النتائج؟')) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/results', { method: 'PUT' });
      if (!res.ok) throw new Error('Clear failed');
      await fetchResults();
    } catch (e) { 
      console.error(e); 
      setError('تعذر مسح النتائج'); 
    }
    finally { setSubmitting(false); }
  }, [submitting, fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050508]">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border border-violet-500/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute inset-2 border-t-2 border-violet-500 rounded-full animate-spin"></div>
          <div className="absolute inset-5 border-r-2 border-cyan-400 rounded-full animate-spin [animation-duration:1.5s]"></div>
          <Cpu className="absolute inset-0 m-auto w-6 h-6 text-violet-400 animate-pulse" />
        </div>
        <p className="text-slate-500 text-xs tracking-[0.3em] font-mono">SYSTEM INITIALIZATION</p>
      </div>
    );
  }

  const lastResult = results.length > 0 ? SYMBOLS.find(s => s.id === results[results.length - 1].symbol_id) : null;

  return (
    <main className="min-h-screen selection:bg-violet-500/30 font-sans">
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#050508]/60 backdrop-blur-3xl">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-b from-white/[0.1] to-transparent border border-white/10 shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]">
              <Scale className="w-5 h-5 text-violet-400" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#050508]"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">الراهن الذكي</h1>
              <p className="text-[9px] text-violet-400/80 font-mono tracking-widest uppercase">Statistical Reversion V3</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Total</span>
                <span className="text-sm font-bold text-white font-mono">{results.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Latest</span>
                <span className="text-sm font-bold text-white">{lastResult?.emoji ?? '—'}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-white/[0.06]"></div>
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Live</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-6">
        {error && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" /><span>{error}</span></div>
            <button onClick={() => setError(null)} className="text-rose-300 hover:text-white text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <div className="lg:col-span-5 row-span-2 relative group overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_70%)]"></div>
            <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] overflow-hidden flex flex-col border border-white/[0.04]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-[scanline_4s_linear_infinite]"></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-semibold text-white tracking-wide">محرك التوازن الإحصائي</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">REVERSION V3</span>
                </div>
                <StatisticalPredictor results={results} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative group rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(6,182,212,0.05),transparent_50%)]"></div>
            <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] p-6 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" /> وحدة الإدخال السريع
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-1">سجل النتيجة الجديدة لتحديث التحليل الفوري</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUndo} disabled={submitting || results.length === 0} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] transition-all disabled:opacity-30 text-slate-400 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={handleClearAll} disabled={submitting || results.length === 0} className="p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all disabled:opacity-30 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                  <label className="p-2 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 transition-all cursor-pointer text-cyan-400">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) { 
                        setSubmitting(true); 
                        await importCSV(file, async () => { await fetchResults(); }); 
                        setSubmitting(false); 
                      }
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {SYMBOLS.map(sym => (
                  <button key={sym.id} onClick={() => handleAddSymbol(sym.id)} disabled={submitting}
                    className="group/btn relative flex flex-col items-center justify-center gap-2 py-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 disabled:opacity-30 overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 120%, ${sym.color}30, transparent 70%)` }} />
                    <span className="relative text-3xl group-hover/btn:scale-110 group-hover/btn:-translate-y-1 transition-all duration-300 drop-shadow-lg">{sym.emoji}</span>
                    <div className="relative flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-slate-400 group-hover/btn:text-white font-medium">{sym.name}</span>
                      <span className="text-[9px] font-mono text-slate-600 group-hover/btn:text-slate-400">x{sym.multiplier}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative group rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
            <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] p-6 border border-white/[0.04]">
               <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-pink-400" /> تدفق الأحداث الحية
                </h2>
                <span className="text-[9px] font-mono text-slate-500">LAST 20 EVENTS</span>
              </div>
              <LastResults results={results} />
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 gap-5">
            <div className="relative rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
              <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] p-5 border border-white/[0.04] flex flex-col justify-center">
                <Database className="w-5 h-5 text-indigo-400 mb-3" />
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Database Size</p>
                <p className="text-3xl font-bold text-white font-mono">{results.length}</p>
              </div>
            </div>
            <div className="relative rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
              <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] p-5 border border-white/[0.04] flex flex-col justify-center">
                <Crown className="w-5 h-5 text-amber-400 mb-3" />
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Last Signal</p>
                <p className="text-3xl leading-none">{lastResult?.emoji ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
            <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] p-6 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> توزيع التكرار
                </h2>
                <span className="text-[9px] font-mono text-slate-500">DISTRIBUTION</span>
              </div>
              <FrequencyList results={results} />
            </div>
          </div>

          <div className="lg:col-span-4 relative rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
            <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] p-6 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> مؤشر الغياب
                </h2>
                <span className="text-[9px] font-mono text-slate-500">GAP INDEX</span>
              </div>
              <GapDisplay results={results} />
            </div>
          </div>

          <div className="lg:col-span-12 relative rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
            <div className="relative rounded-[1.85rem] bg-[#0B0C10] p-6 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-violet-400" /> لوحة الانحراف الإحصائي (Deviation Panel)
                </h2>
                <span className="text-[9px] font-mono text-slate-500">ROLLING 100 · THEORY vs ACTUAL</span>
              </div>
              <DeviationPanel results={results} />
            </div>
          </div>

        </div>
      </div>

      <footer className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 border-t border-white/[0.04] mt-6">
        <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          <span>Smart Bettor Intelligence</span>
          <span className="flex items-center gap-2"><Cpu className="w-3 h-3" /> Engine V4.2 · Reversion V3</span>
        </div>
      </footer>
    </main>
  );
}

// ==========================================
// Components
// ==========================================
function LastResults({ results }: { results: ResultRow[] }) {
  const last = results.slice(-20).reverse();
  if (last.length === 0) return <div className="py-8 text-center text-xs text-slate-600 font-mono">AWAITING DATA...</div>;
  return (
    <div className="flex flex-wrap gap-2">
      {last.map((row, index) => {
        const sym = SYMBOLS.find(s => s.id === row.symbol_id);
        const isLatest = index === 0;
        return (
          <div key={row.id} 
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-300
              ${isLatest ? 'bg-white/[0.1] border border-white/20 shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] scale-110 z-10' : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05]'}`}
            title={`${sym?.name} (${index + 1})`}>
            {isLatest && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-[#0B0C10] animate-pulse"></div>}
            <span className="relative z-10 drop-shadow-md">{sym?.emoji}</span>
          </div>
        );
      })}
    </div>
  );
}

function FrequencyList({ results }: { results: ResultRow[] }) {
  const total = results.length;
  const counts: Record<string, number> = {};
  SYMBOLS.forEach(s => { counts[s.id] = 0; });
  results.forEach(s => { counts[s.symbol_id]++; });
  const sortedSymbols = [...SYMBOLS].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
  return (
    <div className="space-y-4">
      {sortedSymbols.map(sym => {
        const count = counts[sym.id] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={sym.id} className="flex items-center gap-4 group">
            <span className="text-lg w-6 text-center grayscale group-hover:grayscale-0 transition-all">{sym.emoji}</span>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1 font-mono">
                <span className="text-slate-400 group-hover:text-white transition-colors">{sym.name}</span>
                <span className="text-slate-500">{count} ({pct.toFixed(0)}%)</span>
              </div>
              <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.max(pct, 1)}%`, background: `linear-gradient(90deg, ${sym.color}aa, ${sym.color})` }}>
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GapDisplay({ results }: { results: ResultRow[] }) {
  const gaps = SYMBOLS.map(sym => {
    let gap = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].symbol_id === sym.id) break;
      gap++;
    }
    return { ...sym, gap, neverAppeared: !results.some(r => r.symbol_id === sym.id) };
  });
  const sortedGaps = [...gaps].sort((a, b) => b.gap - a.gap);
  return (
    <div className="space-y-2">
      {sortedGaps.slice(0, 6).map(g => {
        let status = 'Normal';
        let colorClass = 'text-slate-400';
        let barColor = 'bg-slate-600';
        if (g.neverAppeared) { status = 'No Data'; colorClass = 'text-slate-600'; barColor = 'bg-slate-800'; }
        else if (g.gap > 20) { status = 'Critical'; colorClass = 'text-rose-400'; barColor = 'bg-rose-500'; }
        else if (g.gap >= 10) { status = 'High'; colorClass = 'text-amber-400'; barColor = 'bg-amber-500'; }
        else if (g.gap === 0) { status = 'Active'; colorClass = 'text-emerald-400'; barColor = 'bg-emerald-500'; }
        return (
          <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
            <span className="text-base">{g.emoji}</span>
            <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div className={`h-full ${barColor}`} style={{ width: `${g.neverAppeared ? 0 : Math.min(g.gap * 4, 100)}%` }} />
            </div>
            <span className={`text-[10px] font-mono w-12 text-left ${colorClass}`}>{g.neverAppeared ? '—' : g.gap} <span className="opacity-50">{status}</span></span>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// المحرك الإحصائي (Reversion V3)
// ==========================================

interface EnhancedDeviationData {
  symbol: SymbolId;
  actualPct: number;
  theoreticalPct: number;
  deviation: number;
  deviationScore: number;
  currentGap: number;
  avgGap: number;
  relativeGap: number;
  gapScore: number;
  momentumBonus: number;
  streakBonus: number;
  totalScore: number;
  doubleBonus: boolean;
}

// حساب الزخم الحديث (Momentum)
function getRecentMomentum(results: ResultRow[]): { meatMomentum: number; vegMomentum: number } {
  const recent = results.slice(-10);
  if (recent.length === 0) return { meatMomentum: 0, vegMomentum: 0 };
  const animals = recent.filter(r => SYMBOLS.find(s => s.id === r.symbol_id)?.type === 'animal').length;
  const veggies = recent.filter(r => SYMBOLS.find(s => s.id === r.symbol_id)?.type === 'vegetable').length;
  const meatMomentum = (animals / recent.length) * 100;
  const vegMomentum = (veggies / recent.length) * 100;
  return { meatMomentum, vegMomentum };
}

function analyzeEnhancedDeviation(results: ResultRow[]): {
  deviations: EnhancedDeviationData[];
  windowSize: number;
  momentum: { meatMomentum: number; vegMomentum: number };
} {
  if (results.length < 5) {
    return { deviations: [], windowSize: 0, momentum: { meatMomentum: 0, vegMomentum: 0 } };
  }

  const windowSize = results.length;
  const window = results.slice(-windowSize);
  const momentum = getRecentMomentum(results);

  const counts: Record<string, number> = {};
  SYMBOLS.forEach(s => { counts[s.id] = 0; });
  window.forEach(r => { counts[r.symbol_id]++; });

  const currentGaps: Record<string, number> = {};
  SYMBOLS.forEach(s => {
    let gap = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].symbol_id === s.id) break;
      gap++;
    }
    currentGaps[s.id] = gap;
  });

  const avgGaps: Record<string, number> = {};
  SYMBOLS.forEach(s => {
    const indexes: number[] = [];
    results.forEach((r, i) => { if (r.symbol_id === s.id) indexes.push(i); });
    if (indexes.length < 2) {
      avgGaps[s.id] = 10;
    } else {
      let sum = 0;
      for (let i = 1; i < indexes.length; i++) sum += indexes[i] - indexes[i - 1];
      avgGaps[s.id] = sum / (indexes.length - 1);
    }
  });

    // 👇 حساب التكرار في آخر 10 نتائج (بدل السلسلة المتصلة)
  const streaks: Record<string, number> = {};
  SYMBOLS.forEach(s => { streaks[s.id] = 0; });
  
  const last10 = results.slice(-10);
  last10.forEach(r => {
    streaks[r.symbol_id] = (streaks[r.symbol_id] || 0) + 1;
  });

  const deviations: EnhancedDeviationData[] = SYMBOLS.map(sym => {
    const actualCount = counts[sym.id];
    const actualPct = (actualCount / windowSize) * 100;
    const theoreticalPct = THEORETICAL_WEIGHTS[sym.id];
    const deviation = actualPct - theoreticalPct;
    const normalizedDev = -deviation;
    const deviationScore = Math.max(0, Math.min(100, normalizedDev * 2 + 50));
    const currentGap = currentGaps[sym.id];
    const avgGap = avgGaps[sym.id];
    const relativeGap = avgGap > 0 ? currentGap / avgGap : 0;
    const gapScore = Math.min(100, relativeGap * 50);

    // 👇 الزخم العكسي (Contrarian Momentum)
    let momentumBonus = 0;
    if (sym.type === 'vegetable' && momentum.meatMomentum > 30) {
      momentumBonus = (momentum.meatMomentum - 30) * 0.5; 
    } else if (sym.type === 'animal' && momentum.vegMomentum > 70) {
      momentumBonus = (momentum.vegMomentum - 70) * 0.5;
    }

        // 👇 مكافأة التكرار (بناءً على آخر 10 نتائج)
    const streakCount = streaks[sym.id] || 0;
    let streakBonus = 0;
    if (streakCount === 1) streakBonus = 5;
    else if (streakCount === 2) streakBonus = 10;
    else if (streakCount >= 3) streakBonus = 15;

    const doubleBonus = deviation < 0 && relativeGap > 1.2;
    let totalScore = (deviationScore * 0.4) + (gapScore * 0.3) + (momentumBonus * 0.15) + (streakBonus * 0.15);
    if (doubleBonus) totalScore += 10;

    // 👇 شرط خاص للحوم: ما نتوقعها إلا إذا كانت غايبة كتير أو ظهرت كتير مؤخراً
    if (sym.type === 'animal') {
      if (relativeGap < 1.5 && streakCount < 2) {
        totalScore = totalScore * 0.5; // تخفيض النقاط للنصف إذا ما كانت مستحقة
      }
    }

    return {
      symbol: sym.id,
      actualPct,
      theoreticalPct,
      deviation,
      deviationScore,
      currentGap,
      avgGap,
      relativeGap,
      gapScore,
      momentumBonus,
      streakBonus,
      totalScore: Math.min(100, totalScore),
      doubleBonus,
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  return { deviations, windowSize, momentum };
}

// ==========================================
// مكون التوقعات (Reversion V3) - مع فلتر 3+2
// ==========================================
function StatisticalPredictor({ results }: { results: ResultRow[] }) {
  if (results.length < 5) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-8 h-8 text-amber-500/50 mb-3" />
        <p className="text-sm text-slate-400 font-medium">بحاجة إلى سجل أكبر</p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono">MINIMUM 5 RESULTS</p>
      </div>
    );
  }

  const { deviations, windowSize, momentum } = analyzeEnhancedDeviation(results);

  const veggiePicks = deviations.filter(d => SYMBOLS.find(s => s.id === d.symbol)?.type === 'vegetable').slice(0, 3);
  const animalPicks = deviations.filter(d => SYMBOLS.find(s => s.id === d.symbol)?.type === 'animal').slice(0, 2);
  const finalPicks = [...veggiePicks, ...animalPicks].sort((a, b) => b.totalScore - a.totalScore);

  const doubleBonusCount = finalPicks.filter(d => d.doubleBonus).length;
  const isMeatHot = momentum.meatMomentum > 30;

  return (
    <div className="flex-1 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-slate-500 font-mono uppercase">Statistical Reversion</span>
          <span className="text-[10px] font-mono text-cyan-400">Window: {windowSize}</span>
        </div>

        <div className={`mb-3 p-2 rounded-lg flex items-center justify-between ${
          isMeatHot ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
        }`}>
          <div className="flex items-center gap-2">
            <Flame className={`w-3.5 h-3.5 ${isMeatHot ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className={`text-[10px] ${isMeatHot ? 'text-rose-300' : 'text-emerald-300'}`}>
              {isMeatHot ? 'اللحوم سخنة' : 'الخضار مسيطرة'}
            </span>
          </div>
          <span className={`text-[10px] font-mono ${isMeatHot ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isMeatHot ? `${momentum.meatMomentum.toFixed(0)}%` : `${momentum.vegMomentum.toFixed(0)}%`}
          </span>
        </div>
        
        {doubleBonusCount > 0 && (
          <div className="mb-4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-300">
              {doubleBonusCount} رموز إشارة مزدوجة (انحراف + غياب)
            </span>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          {finalPicks.map((p, i) => {
            const sym = SYMBOLS.find(s => s.id === p.symbol)!;
            return (
              <div key={p.symbol} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:-translate-y-1 ${
                p.momentumBonus > 0 ? 'bg-rose-500/10 border-rose-500/40' :
                p.doubleBonus ? 'bg-emerald-500/10 border-emerald-500/40' :
                i === 0 ? 'bg-violet-500/10 border-violet-500/30' : 
                'bg-white/[0.02] border-white/5'
              }`}>
                {(p.momentumBonus > 0 || p.doubleBonus) && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                    p.momentumBonus > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}>
                    {p.momentumBonus > 0 ? '🔥' : '⚡'}
                  </div>
                )}
                <div className="text-2xl mb-1">{sym.emoji}</div>
                <div className="text-sm font-bold font-mono text-white">{p.totalScore.toFixed(0)}</div>
                <div className="text-[9px] text-slate-500">
                  <ArrowDownRight className={`w-3 h-3 inline ${p.deviation < 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
                  {p.deviation.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        {finalPicks.map(p => {
          const sym = SYMBOLS.find(s => s.id === p.symbol)!;
          return (
            <div key={p.symbol} className="flex items-center gap-3 text-[10px]">
              <span className="w-5 text-center">{sym.emoji}</span>
              <span className="text-slate-400 w-12">{sym.name}</span>
              <div className="flex-1 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  p.momentumBonus > 0 ? 'bg-gradient-to-r from-rose-500 to-orange-400' :
                  p.doubleBonus ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 
                  'bg-gradient-to-r from-violet-500 to-cyan-400'
                }`} style={{ width: `${p.totalScore}%` }} />
              </div>
              <span className="text-slate-500 font-mono w-16 text-left">
                {p.actualPct.toFixed(0)}% / {p.theoreticalPct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// لوحة الانحراف (Reversion V3)
// ==========================================
function DeviationPanel({ results }: { results: ResultRow[] }) {
  if (results.length < 10) {
    return <p className="text-xs text-slate-600 text-center py-6">بيانات غير كافية للتحليل الإحصائي</p>;
  }

  const { deviations } = analyzeEnhancedDeviation(results);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {deviations.map(d => {
        const sym = SYMBOLS.find(s => s.id === d.symbol)!;
        const isUnder = d.deviation < 0;
        return (
          <div key={d.symbol} className={`rounded-xl border bg-white/[0.02] p-4 ${
            d.momentumBonus > 0 ? 'border-rose-500/30' :
            d.doubleBonus ? 'border-emerald-500/30' : 'border-white/[0.05]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{sym.emoji}</span>
                <span className="text-xs text-slate-300">{sym.name}</span>
                {d.momentumBonus > 0 && <span className="text-[10px]">🔥</span>}
                {d.doubleBonus && !d.momentumBonus && <span className="text-[10px]">⚡</span>}
              </div>
              <span className={`text-[10px] font-mono font-bold ${isUnder ? 'text-emerald-400' : 'text-rose-400'}`}>
                {d.deviation > 0 ? '+' : ''}{d.deviation.toFixed(1)}%
              </span>
            </div>
            
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">فعلي</span>
                <span className="text-slate-300">{d.actualPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">نظري</span>
                <span className="text-slate-300">{d.theoreticalPct.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">غياب</span>
                <span className="text-slate-300">{d.currentGap} / {d.avgGap.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">زخم</span>
                <span className={`${d.momentumBonus > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {d.momentumBonus.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تكرار</span>
                <span className={`${d.streakBonus > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {d.streakBonus.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/5">
                <span className="text-slate-500">النقاط</span>
                <span className="text-violet-400 font-bold">{d.totalScore.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-2 h-1 bg-white/[0.03] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${
                d.momentumBonus > 0 ? 'bg-gradient-to-r from-rose-500 to-orange-400' :
                d.doubleBonus ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 
                'bg-gradient-to-r from-violet-500 to-cyan-400'
              }`} style={{ width: `${d.totalScore}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// CSV
// ==========================================
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(field.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

async function importCSV(file: File, onDone: () => Promise<unknown>) {
  try {
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) {
      alert('ملف CSV فارغ أو لا يحتوي على نتائج.');
      return;
    }
    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const symbolColIndex = header.findIndex((name) =>
      name === 'symbol_id' || name === 'symbol' || name.includes('symbol')
    );
    if (symbolColIndex < 0) {
      alert('لم يتم العثور على عمود symbol_id أو symbol في الملف.');
      return;
    }
    const validIds = new Set(SYMBOLS.map((symbol) => symbol.id));
    let added = 0;
    let skipped = 0;
    const dataRows = rows.slice(1);
    for (const row of dataRows) {
      const rawId = row[symbolColIndex]?.trim().replace(/^['"]|['"]$/g, '');
      if (!rawId || !validIds.has(rawId as SymbolId)) {
        skipped++;
        continue;
      }
      try {
        const response = await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol_id: rawId }),
        });
        if (!response.ok) throw new Error(`Import request failed (${response.status})`);
        added++;
      } catch (error) {
        console.error('CSV row import failed:', error);
        skipped++;
      }
    }
    await onDone();
    alert(`اكتمل الاستيراد: ${added} نتيجة\n${skipped ? `تم تجاهل ${skipped} صف بسبب خطأ أو قيمة غير صالحة.` : 'لم يتم تجاهل أي صف.'}`);
  } catch (error) {
    console.error('CSV import error:', error);
    alert('تعذر قراءة ملف CSV. تأكد من أن الملف صالح.');
  }
}