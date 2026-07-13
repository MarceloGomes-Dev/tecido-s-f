import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, FileText, CheckCircle2, Clock, AlertCircle, Printer, Scissors, Flame, Palette, Award, Calendar, DollarSign
} from 'lucide-react';
import { OS, Client, User, FinancialRecord } from '../types';

interface DashboardViewProps {
  osList: OS[];
  clients: Client[];
  users: User[];
  finances: FinancialRecord[];
  theme: 'claro' | 'escuro';
  monthlyGoal?: number;
  selectedGoalMonth?: string;
  monthlyGoals?: { [month: string]: number };
  setSelectedGoalMonth?: (month: string) => void;
  clearFaturamento?: () => void;
}

const MONTH_CODES: { [key: string]: string } = {
  'Jan': '01',
  'Fev': '02',
  'Mar': '03',
  'Abr': '04',
  'Mai': '05',
  'Jun': '06',
  'Jul': '07',
  'Ago': '08',
  'Set': '09',
  'Out': '10',
  'Nov': '11',
  'Dez': '12',
};

const MONTH_NAMES: { [key: string]: string } = {
  'Jan': 'Janeiro',
  'Fev': 'Fevereiro',
  'Mar': 'Março',
  'Abr': 'Abril',
  'Mai': 'Maio',
  'Jun': 'Junho',
  'Jul': 'Julho',
  'Ago': 'Agosto',
  'Set': 'Setembro',
  'Out': 'Outubro',
  'Nov': 'Novembro',
  'Dez': 'Dezembro',
};

export default function DashboardView({ 
  osList, 
  clients, 
  users, 
  finances, 
  theme, 
  monthlyGoal = 10000,
  selectedGoalMonth = 'Jul',
  monthlyGoals = {},
  setSelectedGoalMonth,
  clearFaturamento
}: DashboardViewProps) {
  const isDark = theme === 'escuro';

  // Compute stats in real-time
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // OS status divisions
    const openOrders = osList.filter(o => o.currentStage !== 'concluido');
    const closedOrders = osList.filter(o => o.currentStage === 'concluido');
    
    const pedidosDoDia = osList.filter(o => o.entryDate === todayStr).length;
    const pedidosConcluidos = closedOrders.length;
    
    const pedidosEmImpressao = osList.filter(o => o.currentStage === 'impressao').length;
    const pedidosEmCostura = osList.filter(o => o.currentStage === 'costura').length;
    const pedidosEmExpedicao = osList.filter(o => ['finalizacao', 'empacotamento', 'expedicao', 'entrega'].includes(o.currentStage)).length;
    const pedidosAguardandoDesigner = osList.filter(o => o.currentStage === 'designer').length;
    
    const pedidosEmProducao = osList.filter(o => [
      'producao', 'corredor', 'costura', 'finalizacao', 'empacotamento', 'expedicao', 'entrega'
    ].includes(o.currentStage)).length;

    // Atrasados: deadline is past today AND not concluded
    const pedidosAtrasados = osList.filter(o => {
      return o.currentStage !== 'concluido' && o.deadline < todayStr;
    }).length;

    // Average Production Time (Minutes)
    let totalMinutes = 0;
    let counts = 0;
    osList.forEach(o => {
      o.history.forEach(h => {
        if (h.durationMinutes) {
          totalMinutes += h.durationMinutes;
          counts++;
        }
      });
    });
    const tempoMedio = counts > 0 ? Math.round(totalMinutes / counts) : 135; // Default 135 minutes

    // Financial sums
    const faturamentoDiario = finances
      .filter(f => f.type === 'entrada' && f.date === todayStr)
      .reduce((sum, f) => sum + f.amount, 0);

    const monthCode = MONTH_CODES[selectedGoalMonth] || '07';
    const faturamentoMensal = finances
      .filter(f => f.type === 'entrada' && f.date.startsWith(`2026-${monthCode}`))
      .reduce((sum, f) => sum + f.amount, 0);

    const faturamentoAnual = finances
      .filter(f => f.type === 'entrada' && f.date.startsWith('2026'))
      .reduce((sum, f) => sum + f.amount, 0);

    return {
      pedidosDoDia,
      pedidosEmProducao,
      pedidosAtrasados,
      pedidosConcluidos,
      pedidosEmImpressao,
      pedidosEmCostura,
      pedidosEmExpedicao,
      pedidosAguardandoDesigner,
      tempoMedio,
      faturamentoDiario,
      faturamentoMensal,
      faturamentoAnual,
      totalClientes: clients.length,
      totalColaboradores: users.length,
      ordensAbertas: openOrders.length,
      ordensConcluidas: closedOrders.length
    };
  }, [osList, clients, users, finances, selectedGoalMonth]);

  // Compute rankings
  const rankings = useMemo(() => {
    // 1. Vendedores (Based on financial input associated to salesperson)
    const vendedorMap: { [name: string]: number } = {};
    finances.forEach(f => {
      if (f.type === 'entrada' && f.vendedor) {
        vendedorMap[f.vendedor] = (vendedorMap[f.vendedor] || 0) + f.amount;
      }
    });
    const rankingVendedores = Object.entries(vendedorMap)
      .map(([name, val]) => ({ name, value: val }))
      .sort((a, b) => b.value - a.value);

    // Fill defaults if empty
    if (rankingVendedores.length === 0) {
      rankingVendedores.push({ name: 'Juliana Costa', value: 3094.00 });
    }

    // 2. Designers (History stage approved from designer)
    const designerMap: { [name: string]: number } = {};
    osList.forEach(os => {
      os.history.forEach(h => {
        if (h.stage === 'designer' || h.stage === 'pasta') {
          designerMap[h.userName] = (designerMap[h.userName] || 0) + 1;
        }
      });
    });
    const rankingDesigners = Object.entries(designerMap)
      .map(([name, val]) => ({ name, count: val }))
      .sort((a, b) => b.count - a.count);

    if (rankingDesigners.length === 0) {
      rankingDesigners.push({ name: 'Mateus Designer', count: 3 });
    }

    // 3. Impressão
    const impressaoMap: { [name: string]: number } = {};
    osList.forEach(os => {
      os.history.forEach(h => {
        if (h.stage === 'impressao') {
          impressaoMap[h.userName] = (impressaoMap[h.userName] || 0) + 1;
        }
      });
    });
    const rankingImpressao = Object.entries(impressaoMap)
      .map(([name, val]) => ({ name, count: val }))
      .sort((a, b) => b.count - a.count);
    if (rankingImpressao.length === 0) {
      rankingImpressao.push({ name: 'Ricardo Impressão', count: 2 });
    }

    // 4. Produção (Prensa)
    const producaoMap: { [name: string]: number } = {};
    osList.forEach(os => {
      os.history.forEach(h => {
        if (h.stage === 'producao') {
          producaoMap[h.userName] = (producaoMap[h.userName] || 0) + 1;
        }
      });
    });
    const rankingProducao = Object.entries(producaoMap)
      .map(([name, val]) => ({ name, count: val }))
      .sort((a, b) => b.count - a.count);
    if (rankingProducao.length === 0) {
      rankingProducao.push({ name: 'Pedro Produção', count: 2 });
    }

    // 5. Costura
    const costuraMap: { [name: string]: number } = {};
    osList.forEach(os => {
      os.history.forEach(h => {
        if (h.stage === 'costura') {
          costuraMap[h.userName] = (costuraMap[h.userName] || 0) + 1;
        }
      });
    });
    const rankingCostura = Object.entries(costuraMap)
      .map(([name, val]) => ({ name, count: val }))
      .sort((a, b) => b.count - a.count);
    if (rankingCostura.length === 0) {
      rankingCostura.push({ name: 'Maria Costura', count: 1 });
    }

    // 6. Geral (Combine all production stages approved)
    const geralMap: { [name: string]: { count: number; role: string } } = {};
    users.forEach(u => {
      geralMap[u.name] = { count: 0, role: u.role };
    });
    osList.forEach(os => {
      os.history.forEach(h => {
        if (geralMap[h.userName]) {
          geralMap[h.userName].count++;
        } else {
          geralMap[h.userName] = { count: 1, role: 'colaborador' };
        }
      });
    });
    const rankingGeral = Object.entries(geralMap)
      .map(([name, data]) => ({ name, count: data.count, role: data.role }))
      .sort((a, b) => b.count - a.count)
      .filter(x => x.count > 0);

    return {
      vendedores: rankingVendedores,
      designers: rankingDesigners,
      impressao: rankingImpressao,
      producao: rankingProducao,
      costura: rankingCostura,
      geral: rankingGeral
    };
  }, [osList, finances, users]);

  // Chart 1: Monthly sales (fully dynamic based on finances and monthly goals)
  const monthlyRevenueData = [
    { name: 'Jan', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-01')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Fev', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-02')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Mar', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-03')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Abr', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-04')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Mai', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-05')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Jun', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-06')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Jul', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-07')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Ago', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-08')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Set', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-09')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Out', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-10')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Nov', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-11')).reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Dez', faturamento: finances.filter(f => f.type === 'entrada' && f.date.startsWith('2026-12')).reduce((sum, f) => sum + f.amount, 0) },
  ];

  // Chart 2: Cash flow (Entradas vs Saídas) (fully manual/dynamic)
  const cashFlowData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
      
      const entradas = finances
        .filter(f => f.type === 'entrada' && f.date === dateStr)
        .reduce((sum, f) => sum + f.amount, 0);
        
      const saidas = finances
        .filter(f => f.type === 'saida' && f.date === dateStr)
        .reduce((sum, f) => sum + f.amount, 0);
        
      data.push({ date: label, entradas, saidas });
    }
    return data;
  }, [finances]);

  // Chart 3: Composition of stages (Pie chart)
  const pieData = useMemo(() => {
    const rawData: { [stage: string]: number } = {};
    osList.forEach(o => {
      rawData[o.currentStage] = (rawData[o.currentStage] || 0) + 1;
    });
    return Object.entries(rawData).map(([key, val]) => ({
      name: key.toUpperCase(),
      value: val
    }));
  }, [osList]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6', '#94a3b8'];

  return (
    <div id="dashboard_panel" className="space-y-6">
      
      {/* Top Welcome Card */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">Painel Executivo SubliGestão</h2>
            <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Análise operacional e financeira em tempo real da <strong className={isDark ? 'text-cyan-400' : 'text-indigo-500'}>TECIDO SUBLIMADO FORTALEZA</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {clearFaturamento && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Deseja realmente zerar todo o faturamento e histórico financeiro? Isto redefinirá o status de pagamento de todas as ordens para Aguardando Pagamento.')) {
                    clearFaturamento();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer border ${
                  isDark 
                    ? 'border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                    : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                🗑 Zerar Faturamento
              </button>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs border ${isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
              <Calendar className="w-4 h-4" />
              <span>Última atualização: Hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pedidos do Dia */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-3`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-2xs font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pedidos Hoje</p>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">{stats.pedidosDoDia}</h3>
          </div>
        </div>

        {/* Card 2: Em Produção */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-2xs font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Em Produção</p>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">{stats.pedidosEmProducao}</h3>
          </div>
        </div>

        {/* Card 3: Atrasados */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-2xs font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Atrasados</p>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-rose-500">{stats.pedidosAtrasados}</h3>
          </div>
        </div>

        {/* Card 4: Faturamento Diário */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-2xs font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Faturamento Hoje</p>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-amber-500">R$ {stats.faturamentoDiario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

      </div>

      {/* Production Sector Split Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-[#1A1A1E] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <Palette className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-cyan-400' : 'text-indigo-400'}`} />
          <p className="text-2xs text-slate-500">Aguardando Arte</p>
          <p className="text-lg font-bold">{stats.pedidosAguardandoDesigner}</p>
        </div>
        <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-[#1A1A1E] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <Printer className="w-4 h-4 mx-auto text-amber-400 mb-1" />
          <p className="text-2xs text-slate-500">Fila Impressão</p>
          <p className="text-lg font-bold">{stats.pedidosEmImpressao}</p>
        </div>
        <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-[#1A1A1E] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <Scissors className="w-4 h-4 mx-auto text-pink-400 mb-1" />
          <p className="text-2xs text-slate-500">Em Costura</p>
          <p className="text-lg font-bold">{stats.pedidosEmCostura}</p>
        </div>
        <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-[#1A1A1E] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
          <p className="text-2xs text-slate-500">Em Expedição</p>
          <p className="text-lg font-bold">{stats.pedidosEmExpedicao}</p>
        </div>
        <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-[#1A1A1E] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <Clock className="w-4 h-4 mx-auto text-sky-400 mb-1" />
          <p className="text-2xs text-slate-500">Tempo Médio Etapa</p>
          <p className="text-sm font-bold">{stats.tempoMedio} min</p>
        </div>
        <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-[#1A1A1E] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <Users className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-cyan-400' : 'text-indigo-400'}`} />
          <p className="text-2xs text-slate-500">Clientes Totais</p>
          <p className="text-lg font-bold">{stats.totalClientes}</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Sales Monthly progress */}
        <div className={`p-5 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'} shadow-sm`}>
          <h3 className="font-display font-bold text-sm mb-4">Progresso do Faturamento Mensal (2026)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#111114' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#ffffff' : '#000000',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="faturamento" fill={isDark ? '#22d3ee' : '#6366f1'} radius={[4, 4, 0, 0]} name="Faturamento (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-between text-2xs text-slate-500 font-mono">
            <span>Faturamento {MONTH_NAMES[selectedGoalMonth] || 'Julho'} acumulado: <strong>R$ {stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            <span>Meta de Vendas: R$ {monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Chart 2: Stage Composition */}
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'} shadow-sm`}>
          <h3 className="font-display font-bold text-sm mb-2">Pedidos por Estágio Atual</h3>
          <p className="text-2xs text-slate-500 mb-4">Divisão quantitativa do fluxo operacional</p>
          <div className="h-48 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum pedido cadastrado no momento.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-3xs font-mono truncate text-slate-500">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Cash Flow and Financial Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow area chart */}
        <div className={`p-5 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'} shadow-sm`}>
          <h3 className="font-display font-bold text-sm mb-4">Fluxo de Caixa Semanal (Entradas vs Saídas)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111114' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    fontSize: '11px'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                <Area type="monotone" dataKey="entradas" stroke="#10b981" fillOpacity={1} fill="url(#colorEntradas)" name="Entradas (R$)" strokeWidth={2} />
                <Area type="monotone" dataKey="saidas" stroke="#f43f5e" fillOpacity={1} fill="url(#colorSaidas)" name="Saídas (R$)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial KPIs summaries */}
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-100'} shadow-sm`}>
            <p className="text-2xs font-mono text-slate-500 uppercase">Faturamento Anual (2026)</p>
            <h4 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">R$ {stats.faturamentoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${isDark ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-indigo-500'}`} style={{ width: '45%' }} />
            </div>
            <p className="text-3xs text-slate-500 mt-1.5 font-mono">Meta Anual: R$ 300.000 (45% atingido)</p>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-100'} shadow-sm`}>
            <div className="flex justify-between items-center">
              <p className="text-2xs font-mono text-slate-500 uppercase">Faturamento Mensal ({MONTH_NAMES[selectedGoalMonth] || 'Julho'})</p>
              {setSelectedGoalMonth && (
                <select
                  value={selectedGoalMonth}
                  onChange={(e) => setSelectedGoalMonth(e.target.value)}
                  className={`text-3xs font-mono px-1.5 py-0.5 rounded border outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Jan">Jan</option>
                  <option value="Fev">Fev</option>
                  <option value="Mar">Mar</option>
                  <option value="Abr">Abr</option>
                  <option value="Mai">Mai</option>
                  <option value="Jun">Jun</option>
                  <option value="Jul">Jul</option>
                  <option value="Ago">Ago</option>
                  <option value="Set">Set</option>
                  <option value="Out">Out</option>
                  <option value="Nov">Nov</option>
                  <option value="Dez">Dez</option>
                </select>
              )}
            </div>
            <h4 className="text-xl font-bold text-emerald-500 mt-1">R$ {stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${monthlyGoal > 0 ? Math.min(100, Math.round((stats.faturamentoMensal / monthlyGoal) * 100)) : 0}%` }} />
            </div>
            <p className="text-3xs text-slate-500 mt-1.5 font-mono">
              Meta Mensal: R$ {monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({monthlyGoal > 0 ? Math.min(100, Math.round((stats.faturamentoMensal / monthlyGoal) * 100)) : 0}% atingido)
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-100'} shadow-sm`}>
            <p className="text-2xs font-mono text-slate-500 uppercase">Total de Ordens de Serviço</p>
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="text-2xs text-slate-500">Em Andamento</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">{stats.ordensAbertas}</p>
              </div>
              <div className="text-right">
                <p className="text-2xs text-slate-500">Concluídas</p>
                <p className="text-base font-bold text-emerald-500">{stats.ordensConcluidas}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Rankings Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
        <div className="flex items-center gap-2 mb-6">
          <Award className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-indigo-500'}`} />
          <h3 className="font-display font-bold text-base">Ranking de Performance por Setor</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Vendedores */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Top Vendedores</span>
              <span className="text-2xs text-slate-500 italic">Por Venda</span>
            </h4>
            <div className="space-y-2">
              {rankings.vendedores.slice(0, 3).map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-2xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono font-semibold">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Designers */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-500 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Top Designers</span>
              <span className="text-2xs text-slate-500 italic">Artes Concluídas</span>
            </h4>
            <div className="space-y-2">
              {rankings.designers.slice(0, 3).map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 font-mono text-2xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded text-3xs font-bold">{item.count} artes</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impressão & Produção */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-500 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Top Produção e Impressão</span>
              <span className="text-2xs text-slate-500 italic">Etapas Finalizadas</span>
            </h4>
            <div className="space-y-2">
              {rankings.geral.slice(0, 3).map((item, idx) => (
                <div key={item.name} className="flex justify-between items-center text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-2xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-medium block leading-tight">{item.name}</span>
                      <span className="text-3xs text-slate-500 font-mono block leading-tight">{item.role.toUpperCase()}</span>
                    </div>
                  </div>
                  <span className="font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded text-3xs font-bold">{item.count} tarefas</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
