'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  RotateCcw, Trash2, Activity, Crown,
  Target, BarChart3, Upload,
  ShieldAlert, Puzzle, Zap, Database, Cpu, Radio, Gauge
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
              <Target className="w-5 h-5 text-violet-400" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#050508]"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">الراهن الذكي</h1>
              <p className="text-[9px] text-violet-400/80 font-mono tracking-widest uppercase">Core Intelligence</p>
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
                    <Puzzle className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-semibold text-white tracking-wide">محرك الأنماط التسلسلي</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">N-GRAM</span>
                </div>
                <SequencePredictor results={results} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative group rounded-[2rem] border border-white/[0.06] bg-[#08080C] p-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(6,182,212,0.05),transparent_50%)]"></div>
            <div className="relative h-full rounded-[1.85rem] bg-[#0B0C10] p-6 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> وحدة الإدخال السريع
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
                  <Gauge className="w-4 h-4 text-violet-400" /> جودة الأنماط والاختبار التاريخي
                </h2>
                <span className="text-[9px] font-mono text-slate-500">WALK-FORWARD · NO LOOKAHEAD</span>
              </div>
              <PatternQualityPanel results={results} />
            </div>
          </div>

        </div>
      </div>

      <footer className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 border-t border-white/[0.04] mt-6">
        <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          <span>Smart Bettor Intelligence</span>
          <span className="flex items-center gap-2"><Cpu className="w-3 h-3" /> Engine V3.0</span>
        </div>
      </footer>
    </main>
  );
}

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

interface NGramResult {
  nextSymbol: SymbolId;
  occurrences: number;
  probability: number;
  patternLength: number;
  weightedScore: number;
}
interface PatternAnalysis {
  predictions: NGramResult[];
  usedPatternLength: number;
  matchCount: number;
  quality: number;
  support: number;
  targetSeq: SymbolId[];
}

function analyzePattern(history: ResultRow[], minMatches = 4): PatternAnalysis {
  const lengths = [4, 3, 2];
  const empty: PatternAnalysis = { predictions: [], usedPatternLength: 0, matchCount: 0, quality: 0, support: 0, targetSeq: [] };
  for (const len of lengths) {
    if (history.length < len + 1) continue;
    const target = history.slice(-len).map(r => r.symbol_id);
    const counts: Record<string, number> = {};
    let total = 0;
    for (let i = 0; i <= history.length - len - 1; i++) {
      let match = true;
      for (let j = 0; j < len; j++) {
        if (history[i + j].symbol_id !== target[j]) { match = false; break; }
      }
      if (!match) continue;
      const next = history[i + len].symbol_id;
      counts[next] = (counts[next] || 0) + 1;
      total++;
    }

    // 👇 التعديل الأول: تمييز الحيوانات عن الخضار
    const lastSymbolInPattern = target[target.length - 1];
    const lastSymbolInfo = SYMBOLS.find(s => s.id === lastSymbolInPattern);
    const isAnimalPattern = lastSymbolInfo?.type === 'animal';
    const requiredMatches = isAnimalPattern ? 2 : minMatches;
    if (total < requiredMatches) continue;

    const predictions: NGramResult[] = Object.entries(counts).map(([symbol, count]) => ({
      nextSymbol: symbol as SymbolId,
      occurrences: count,
      probability: count / total * 100,
      patternLength: len,
      weightedScore: count / total * 100,
    })).sort((a, b) => b.probability - a.probability || b.occurrences - a.occurrences);
    const topShare = predictions[0]?.probability ?? 0;
    
    // تحسين حساب الجودة (أوزان أكثر واقعية)
    const supportScore = Math.min(total / 20, 1) * 40;
    const specificityScore = (len / 4) * 30;
    const concentrationScore = topShare * 0.3;
    const quality = Math.round(Math.min(100, supportScore + specificityScore + concentrationScore));
    
    return { predictions, usedPatternLength: len, matchCount: total, quality, support: total, targetSeq: target };
  }
  return empty;
}

function getNGramPredictions(results: ResultRow[]) {
  return analyzePattern(results, 4);
}

interface BacktestMetrics {
  trials: number;
  top1Hits: number;
  top3Hits: number;
  top1Rate: number;
  top3Rate: number;
}
function runWalkForwardBacktest(results: ResultRow[], minHistory = 8): BacktestMetrics {
  let trials = 0, top1Hits = 0, top3Hits = 0;
  for (let i = minHistory; i < results.length; i++) {
    const analysis = analyzePattern(results.slice(0, i), 4);
    if (!analysis.predictions.length) continue;
    trials++;
    const actual = results[i].symbol_id;
    if (analysis.predictions[0]?.nextSymbol === actual) top1Hits++;
    if (analysis.predictions.slice(0, 3).some(p => p.nextSymbol === actual)) top3Hits++;
  }
  return { trials, top1Hits, top3Hits, top1Rate: trials ? top1Hits / trials * 100 : 0, top3Rate: trials ? top3Hits / trials * 100 : 0 };
}

function SequencePredictor({ results }: { results: ResultRow[] }) {
  if (results.length < 5) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-8 h-8 text-amber-500/50 mb-3" />
        <p className="text-sm text-slate-400 font-medium">بحاجة إلى سجل أكبر</p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono">MINIMUM 5 RESULTS</p>
      </div>
    );
  }
  const analysis = getNGramPredictions(results);
  const lastPattern = results.slice(-Math.max(analysis.usedPatternLength, 2)).map(r => SYMBOLS.find(s => s.id === r.symbol_id));
  if (!analysis.predictions.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
        <div className="flex gap-1">{results.slice(-5).map((r, i) => <span key={i} className="text-xl opacity-60">{SYMBOLS.find(s => s.id === r.symbol_id)?.emoji}</span>)}</div>
        <p className="text-xs text-slate-500 font-mono">لا يوجد نمط تاريخي مدعوم بمطابقتين على الأقل</p>
      </div>
    );
  }

  // 👇 التعديل الثاني: فلتر 3 خضار + 2 حيوانات
  let veggiePicks = analysis.predictions.filter(p => SYMBOLS.find(s => s.id === p.nextSymbol)?.type === 'vegetable');
  let animalPicks = analysis.predictions.filter(p => SYMBOLS.find(s => s.id === p.nextSymbol)?.type === 'animal');

  if (animalPicks.length < 2) {
    const missing = 2 - animalPicks.length;
    const usedIds = new Set([...veggiePicks.slice(0,3), ...animalPicks].map(p => p.nextSymbol));
    const extras = analysis.predictions.filter(p => !usedIds.has(p.nextSymbol)).slice(0, missing);
    animalPicks = [...animalPicks, ...extras];
  }

  veggiePicks = veggiePicks.slice(0, 3);
  animalPicks = animalPicks.slice(0, 2);
  const picks = [...veggiePicks, ...animalPicks].sort((a, b) => b.probability - a.probability);

  return (
    <div className="flex-1 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-center justify-between mb-5 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase">Pattern</span>
            <div className="flex gap-1 bg-white/[0.03] px-2 py-1 rounded-md border border-white/5">{lastPattern.map((sym, i) => <span key={i} className="text-xs">{sym?.emoji}</span>)}</div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">{analysis.matchCount} historical matches</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${analysis.quality}%` }} /></div>
          <span className="text-xs font-mono text-violet-300">Quality {analysis.quality}/100</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {picks.map((p, i) => {
            const sym = SYMBOLS.find(s => s.id === p.nextSymbol)!;
            return <div key={p.nextSymbol} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:-translate-y-1 ${i === 0 ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/5'}`}>
              <div className="text-2xl mb-1">{sym.emoji}</div>
              <div className="text-sm font-bold font-mono text-white">{p.probability.toFixed(0)}%</div>
              <div className="text-[9px] text-slate-500">{p.occurrences} match{p.occurrences !== 1 ? 'es' : ''}</div>
            </div>;
          })}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        {picks.map(p => {
          const sym = SYMBOLS.find(s => s.id === p.nextSymbol)!;
          return <div key={p.nextSymbol} className="flex items-center gap-3 text-[10px]">
            <span className="w-5 text-center">{sym.emoji}</span><span className="text-slate-400 w-12">{sym.name}</span>
            <div className="flex-1 h-1 bg-white/[0.03] rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${p.probability}%` }} /></div>
            <span className="text-slate-500 font-mono w-12 text-left">{p.occurrences}/{analysis.matchCount}</span>
          </div>;
        })}
      </div>
    </div>
  );
}

function PatternQualityPanel({ results }: { results: ResultRow[] }) {
  const analysis = analyzePattern(results, 3);
  const backtest = runWalkForwardBacktest(results);
  const best = analysis.predictions[0];
  const bestSymbol = best ? SYMBOLS.find(s => s.id === best.nextSymbol) : null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
        <p className="text-[10px] text-slate-500 mb-2">النمط الحالي</p>
        <div className="flex items-center gap-1 text-xl">{analysis.targetSeq.length ? analysis.targetSeq.map((id, i) => <span key={i}>{SYMBOLS.find(s => s.id === id)?.emoji}</span>) : <span className="text-slate-600">—</span>}</div>
        <p className="text-xs text-slate-400 mt-2">طول النمط: {analysis.usedPatternLength || '—'}</p>
      </div>
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
        <p className="text-[10px] text-slate-500 mb-2">الدعم التاريخي</p>
        <p className="text-2xl font-bold text-white font-mono">{analysis.matchCount}</p>
        <p className="text-xs text-slate-400 mt-2">عدد الحالات المطابقة</p>
      </div>
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
        <p className="text-[10px] text-slate-500 mb-2">أعلى نتيجة تاريخية</p>
        <p className="text-2xl font-bold text-white">{bestSymbol?.emoji ?? '—'} <span className="text-sm font-mono">{best ? best.probability.toFixed(1) + '%' : ''}</span></p>
        <p className="text-xs text-slate-400 mt-2">تكرار الرمز التالي بعد النمط</p>
      </div>
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
        <p className="text-[10px] text-slate-500 mb-2">اختبار تاريخي Walk-forward</p>
        <p className="text-2xl font-bold text-white font-mono">{backtest.top1Rate.toFixed(1)}%</p>
        <p className="text-xs text-slate-400 mt-2">Top-1 من {backtest.trials} تجربة · Top-3 {backtest.top3Rate.toFixed(1)}%</p>
      </div>
      <div className="md:col-span-4 rounded-lg border border-amber-500/10 bg-amber-500/[0.04] p-3 text-xs text-amber-200/70 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        المؤشرات مبنية على تكرارات تاريخية وليست احتمالات مضمونة للمستقبل. الاختبار التاريخي يقيّم الأداء السابق فقط ولا يثبت أن النتائج القادمة قابلة للتوقع.
      </div>
    </div>
  );
}

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