import React, { useState, useEffect } from 'react';
import { Settings, Shield, History, HardDriveDownload, Sparkles, RefreshCw, Eye, Key, Save } from 'lucide-react';
import { User, LogEntry } from '../types';

interface AdminSettingsViewProps {
  logs: LogEntry[];
  users: User[];
  clearLogs: () => void;
  theme: 'claro' | 'escuro';
  setTheme: (t: 'claro' | 'escuro') => void;
  monthlyGoal: number;
  updateMonthlyGoal: (month: string, goal: number) => void;
  selectedGoalMonth: string;
  monthlyGoals: { [month: string]: number };
  setSelectedGoalMonth: (month: string) => void;
}

export default function AdminSettingsView({ 
  logs, 
  users, 
  clearLogs, 
  theme, 
  setTheme, 
  monthlyGoal, 
  updateMonthlyGoal,
  selectedGoalMonth,
  monthlyGoals,
  setSelectedGoalMonth
}: AdminSettingsViewProps) {
  const isDark = theme === 'escuro';

  // Helper functions for Portuguese number formatting with thousands dots
  const parsePortugueseNumber = (val: string): number => {
    const clean = val
      .replace(/\./g, '') // remove thousands dots
      .replace(/,/g, '.'); // replace decimal commas with dots
    return parseFloat(clean) || 0;
  };

  // System Config states
  const [companyName, setCompanyName] = useState('TECIDO SUBLIMADO FORTALEZA');
  const [systemName, setSystemName] = useState('SubliGestão ERP');
  const [defaultCommission, setDefaultCommission] = useState(5);
  const [autoDeadlineDays, setAutoDeadlineDays] = useState(5);
  const [localMonth, setLocalMonth] = useState(selectedGoalMonth);
  const [localMonthlyGoal, setLocalMonthlyGoal] = useState(monthlyGoal);
  const [goalInput, setGoalInput] = useState(() => (monthlyGoal).toLocaleString('pt-BR'));

  useEffect(() => {
    setLocalMonth(selectedGoalMonth);
    const goalVal = monthlyGoals[selectedGoalMonth] || 10000;
    setLocalMonthlyGoal(goalVal);
    setGoalInput(goalVal.toLocaleString('pt-BR'));
  }, [selectedGoalMonth, monthlyGoals]);

  const [isSaved, setIsSaved] = useState(false);

  // Backup trigger simulation
  const handleDownloadBackup = () => {
    const fullERPData = {
      timestamp: new Date().toISOString(),
      theme,
      companyProfile: { companyName, systemName, defaultCommission, autoDeadlineDays },
      localStateKeys: ['subligestao_users', 'subligestao_clients', 'subligestao_os', 'subligestao_transactions', 'subligestao_logs']
    };

    const blob = new Blob([JSON.stringify(fullERPData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SubliGestao_FullBackup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGoal = parsePortugueseNumber(goalInput);
    updateMonthlyGoal(localMonth, finalGoal);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
        <h2 className="text-xl font-display font-bold tracking-tight">Configurações & Auditoria</h2>
        <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Gerencie configurações de comissões, realize backups integrais e consulte o log de auditoria operacional do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Settings */}
        <div className={`p-5 rounded-2xl border space-y-4 md:col-span-1 ${
          isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 ${isDark ? 'text-cyan-400' : 'text-indigo-400'}`}>
            <Settings className="w-5 h-5" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider">Configurações de Parâmetros</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Identidade da Empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={`w-full p-2.5 rounded-lg border outline-none ${
                  isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Nome da Plataforma ERP</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className={`w-full p-2.5 rounded-lg border outline-none ${
                  isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Mês da Meta</label>
                <select
                  value={localMonth}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setLocalMonth(selected);
                    setSelectedGoalMonth(selected);
                    setLocalMonthlyGoal(monthlyGoals[selected] || 10000);
                  }}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Jan">Janeiro (Jan)</option>
                  <option value="Fev">Fevereiro (Fev)</option>
                  <option value="Mar">Março (Mar)</option>
                  <option value="Abr">Abril (Abr)</option>
                  <option value="Mai">Maio (Mai)</option>
                  <option value="Jun">Junho (Jun)</option>
                  <option value="Jul">Julho (Jul)</option>
                  <option value="Ago">Agosto (Ago)</option>
                  <option value="Set">Setembro (Set)</option>
                  <option value="Out">Outubro (Out)</option>
                  <option value="Nov">Novembro (Nov)</option>
                  <option value="Dez">Dezembro (Dez)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Meta de Faturamento (R$)</label>
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setGoalInput(val);
                    const parsed = parsePortugueseNumber(val);
                    setLocalMonthlyGoal(parsed);
                  }}
                  onBlur={() => {
                    const parsed = parsePortugueseNumber(goalInput);
                    setGoalInput(parsed.toLocaleString('pt-BR'));
                  }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onFocus={(e) => (e.target as HTMLInputElement).select()}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Comissão Atend. (%)</label>
                <input
                  type="number"
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(parseInt(e.target.value) || 0)}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onFocus={(e) => (e.target as HTMLInputElement).select()}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Prazo Padrão (Dias)</label>
                <input
                  type="number"
                  value={autoDeadlineDays}
                  onChange={(e) => setAutoDeadlineDays(parseInt(e.target.value) || 0)}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  onFocus={(e) => (e.target as HTMLInputElement).select()}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Tema do Sistema</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('claro')}
                  className={`py-2 rounded-lg font-semibold text-xs border cursor-pointer transition-all ${
                    !isDark 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-[#1A1A1E] border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Claro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('escuro')}
                  className={`py-2 rounded-lg font-semibold text-xs border cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  Escuro
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow`}
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>

            {isSaved && (
              <p className="text-2xs text-emerald-400 font-bold text-center animate-pulse">Parâmetros operacionais atualizados com sucesso!</p>
            )}

          </form>

          {/* Backup Panel */}
          <div className="border-t border-slate-800/15 pt-4 space-y-3 text-xs">
            <div className={`flex items-center gap-2 ${isDark ? 'text-cyan-400' : 'text-indigo-400'}`}>
              <HardDriveDownload className="w-5 h-5" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider">Segurança e Backup</h3>
            </div>
            <p className="text-slate-500 leading-relaxed text-2xs">
              Baixe a cópia de integridade dos registros salvos no banco local para fins de replicação rápida e segurança física.
            </p>
            <button
              onClick={handleDownloadBackup}
              className={`w-full py-2 border rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isDark ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>Gerar Cópia de Segurança (.json)</span>
            </button>
          </div>

        </div>

        {/* Right Col: Activity logs (Takes 2 cols) */}
        <div className={`p-5 rounded-2xl border space-y-4 md:col-span-2 ${
          isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-200'
        }`}>
          
          <div className="flex items-center justify-between border-b border-slate-800/15 pb-3">
            <div className={`flex items-center gap-2 ${isDark ? 'text-cyan-400' : 'text-indigo-400'}`}>
              <History className="w-5 h-5" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider">Log de Auditoria em Tempo Real</h3>
            </div>

            <button
              onClick={clearLogs}
              className="text-3xs font-mono text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
            >
              Limpar Auditoria
            </button>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-24">Nenhum evento operacional registrado ainda.</p>
            ) : (
              logs.map(log => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-3xs ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded-sm font-bold uppercase tracking-wider text-4xs ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        {log.userName}
                      </span>
                      <span className="text-slate-600 text-4xs">({log.userRole.toUpperCase()})</span>
                      <p className="text-slate-400 font-sans font-medium text-2xs leading-relaxed">{log.action}</p>
                    </div>
                  </div>
                  
                  <span className="text-slate-500 text-4xs shrink-0">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
