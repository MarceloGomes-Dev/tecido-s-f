import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, Plus, 
  ArrowUpRight, ArrowDownRight, Calendar, User, Download, FileSpreadsheet 
} from 'lucide-react';
import { FinancialRecord, OS, User as UserType } from '../types';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid } from 'recharts';

interface FinanceViewProps {
  transactions: FinancialRecord[];
  osList: OS[];
  users: UserType[];
  addTransaction: (tx: Omit<FinancialRecord, 'id'>) => void;
  theme: 'claro' | 'escuro';
  activeUser: UserType;
}

export default function FinanceView({ transactions, osList, users, addTransaction, theme, activeUser }: FinanceViewProps) {
  const isDark = theme === 'escuro';
  const isVendedor = activeUser.role === 'atendimento';

  const [activeSubTab, setActiveSubTab] = useState<'cash_flow' | 'receivables' | 'commissions'>(() => {
    return isVendedor ? 'receivables' : 'cash_flow';
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('Serviços');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');

  // Filter OS to those belonging to this seller (Vendedor / Atendimento)
  const myOSList = useMemo(() => {
    if (!isVendedor) return osList;
    return osList.filter(os => {
      // Find the first creation log
      const creationLog = os.history.find(h => h.stage === 'sistema');
      return creationLog && (creationLog.userId === activeUser.id || creationLog.userName === activeUser.name);
    });
  }, [osList, activeUser, isVendedor]);

  // Extract set of OS numbers belonging to this seller
  const myOSNumbers = useMemo(() => {
    return new Set<string>(myOSList.map(os => os.osNumber));
  }, [myOSList]);

  // Filter transactions to those belonging to this seller
  const myTransactions = useMemo(() => {
    if (!isVendedor) return transactions;
    return transactions.filter(tx => {
      // Direct field match
      if (tx.vendedor && tx.vendedor === activeUser.name) return true;
      // Description contains one of our OS numbers
      return Array.from(myOSNumbers).some((num: string) => tx.description.includes(num));
    });
  }, [transactions, myOSNumbers, activeUser, isVendedor]);

  // Compute stats
  const stats = useMemo(() => {
    let inflows = 0;
    let outflows = 0;
    let pendingInflows = 0;
    let pendingOutflows = 0;

    myTransactions.forEach(tx => {
      const isPaid = tx.status === 'Pago';
      if (tx.type === 'entrada') {
        if (isPaid) inflows += tx.amount;
        else pendingInflows += tx.amount;
      } else {
        if (isPaid) outflows += tx.amount;
        else pendingOutflows += tx.amount;
      }
    });

    return {
      inflows,
      outflows,
      net: inflows - outflows,
      pendingInflows,
      pendingOutflows
    };
  }, [myTransactions]);

  // Dynamic commissions calculation (5% of completed OS values)
  const sellerCommissions = useMemo(() => {
    // Group all completed OS by sellerName
    const sellers: { [key: string]: { totalSales: number; commission: number; ordersCount: number } } = {};
    
    // We assume default seller names if not explicitly mapped, or grab from OS history
    const listToUse = isVendedor ? myOSList : osList;
    listToUse.forEach(os => {
      if (os.status === 'Concluído') {
        let sellerName = 'Mariana Costa'; // Default mock fallback
        const creationLog = os.history.find(h => h.stage === 'sistema');
        if (creationLog) {
          sellerName = creationLog.userName;
        }

        if (!sellers[sellerName]) {
          sellers[sellerName] = { totalSales: 0, commission: 0, ordersCount: 0 };
        }
        sellers[sellerName].totalSales += os.value;
        sellers[sellerName].ordersCount += 1;
      }
    });

    // Apply 5% commission rate
    return Object.entries(sellers).map(([name, data]) => ({
      name,
      ordersCount: data.ordersCount,
      totalSales: data.totalSales,
      commission: data.totalSales * 0.05
    }));
  }, [osList, myOSList, isVendedor]);

  const myCommissionStat = useMemo(() => {
    const record = sellerCommissions.find(sc => sc.name === activeUser.name);
    return record || { totalSales: 0, commission: 0, ordersCount: 0 };
  }, [sellerCommissions, activeUser]);

  // Format Recharts data by combining daily entries
  const chartData = useMemo(() => {
    const daily: { [key: string]: { date: string; entradas: number; saidas: number } } = {};
    
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      daily[str] = { date: str.substring(8, 10) + '/' + str.substring(5, 7), entradas: 0, saidas: 0 };
    }

    myTransactions.forEach(tx => {
      if (tx.status === 'Pago') {
        const dateStr = tx.date;
        if (daily[dateStr]) {
          if (tx.type === 'entrada') daily[dateStr].entradas += tx.amount;
          else daily[dateStr].saidas += tx.amount;
        }
      }
    });

    return Object.values(daily);
  }, [myTransactions]);

  // CSV Export logic
  const handleExportCSV = () => {
    let csvContent = 'ID;Descricao;Tipo;Valor;Categoria;Vencimento;Status\n';
    myTransactions.forEach(tx => {
      csvContent += `${tx.id};${tx.description};${tx.type.toUpperCase()};${tx.amount.toFixed(2)};${tx.category};${tx.date};${tx.status.toUpperCase()}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SubliGestao_Extrato_Financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0 || !dueDate) {
      alert('Descrição, valor e vencimento são obrigatórios.');
      return;
    }
    addTransaction({
      type,
      description: description.trim(),
      amount,
      category,
      date: dueDate,
      status: status === 'pago' ? 'Pago' : 'Pendente'
    });
    setShowAddModal(false);
    setDescription('');
    setAmount(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight">
            {isVendedor ? 'Financeiro e Faturamento • Minhas Vendas' : 'Painel Financeiro & Fluxo de Caixa'}
          </h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isVendedor 
              ? 'Consulte os pagamentos de seus clientes, acompanhe suas comissões acumuladas e acesse documentos fiscais autorizados.' 
              : 'Acompanhe receitas de produção de tecidos, custos de tintas, contas operacionais e comissões do time de atendimento.'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
              isDark ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          {!isVendedor && (
            <button
              onClick={() => setShowAddModal(true)}
              className={`px-4 py-2 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Lançamento</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {isVendedor ? (
          <>
            {/* Vendedor Card 1: My Paid Sales */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Minhas Vendas Realizadas</p>
                <h3 className="text-lg font-bold font-mono text-emerald-400 mt-1">R$ {stats.inflows.toFixed(2)}</h3>
                <span className="text-4xs text-slate-500">Total pago e liquidado</span>
              </div>
            </div>

            {/* Vendedor Card 2: My Pending Sales */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">A Receber de Meus Clientes</p>
                <h3 className="text-lg font-bold font-mono text-amber-500 mt-1">R$ {stats.pendingInflows.toFixed(2)}</h3>
                <span className="text-4xs text-slate-500">Faturas aguardando pagamento</span>
              </div>
            </div>

            {/* Vendedor Card 3: Earned Commissions */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Minhas Comissões Ganhas</p>
                <h3 className="text-lg font-bold font-mono text-indigo-400 mt-1">R$ {myCommissionStat.commission.toFixed(2)}</h3>
                <p className="text-4xs text-slate-500 mt-0.5">Comissão de 5% sobre faturados</p>
              </div>
            </div>

            {/* Vendedor Card 4: Concluded Orders count */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Meus Pedidos Concluídos</p>
                <h3 className="text-lg font-bold font-mono text-cyan-400 mt-1">{myCommissionStat.ordersCount}</h3>
                <span className="text-4xs text-slate-500">Total de OS finalizadas</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Inflows Card */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Receitas Realizadas</p>
                <h3 className="text-lg font-bold font-mono text-emerald-400 mt-1">R$ {stats.inflows.toFixed(2)}</h3>
                <p className="text-4xs text-slate-500 mt-0.5">Previsão pendente: R$ {stats.pendingInflows.toFixed(2)}</p>
              </div>
            </div>

            {/* Outflows Card */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Despesas Realizadas</p>
                <h3 className="text-lg font-bold font-mono text-rose-400 mt-1">R$ {stats.outflows.toFixed(2)}</h3>
                <p className="text-4xs text-slate-500 mt-0.5">A pagar pendente: R$ {stats.pendingOutflows.toFixed(2)}</p>
              </div>
            </div>

            {/* Net Cash Flow */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className={`p-3 rounded-xl ${stats.net >= 0 ? (isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400') : 'bg-red-500/10 text-red-400'}`}>
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Saldo Líquido de Caixa</p>
                <h3 className={`text-lg font-bold font-mono mt-1 ${stats.net >= 0 ? (isDark ? 'text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' : 'text-indigo-400') : 'text-red-400'}`}>
                  R$ {stats.net.toFixed(2)}
                </h3>
                <span className="text-4xs text-slate-500">Conciliado e fechado</span>
              </div>
            </div>

            {/* Pending Card */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xs font-mono text-slate-500 uppercase tracking-wider">Contas Operacionais em Aberto</p>
                <h3 className="text-lg font-bold font-mono text-amber-500 mt-1">
                  R$ {(stats.pendingInflows + stats.pendingOutflows).toFixed(2)}
                </h3>
                <span className="text-4xs text-slate-500">Contas operacionais aguardando vencimento</span>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Chart Section */}
      {!isVendedor && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
          <div className="flex justify-between items-center border-b border-slate-800/25 pb-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500">Histórico de Fluxo Semanal (Entradas vs Saídas)</h3>
            <span className="text-4xs font-mono text-slate-500">Período: Últimos 7 dias ativos</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#020617' : '#ffffff', borderColor: '#4f46e5' }} />
                <Area type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEntradas)" name="Entradas (R$)" />
                <Area type="monotone" dataKey="saidas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorSaidas)" name="Saídas (R$)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs navigation panel */}
      <div className="flex border-b border-slate-800/20 gap-4 text-xs font-semibold">
        {!isVendedor && (
          <button
            onClick={() => setActiveSubTab('cash_flow')}
            className={`pb-3.5 px-1 relative transition-colors cursor-pointer ${
              activeSubTab === 'cash_flow' ? (isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-indigo-500 border-b-2 border-indigo-500') : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Extrato Geral de Caixa
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('receivables')}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer ${
            activeSubTab === 'receivables' ? (isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-indigo-500 border-b-2 border-indigo-500') : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {isVendedor ? 'Pagamentos de Meus Clientes' : 'Contas a Pagar & Receber'}
        </button>

        <button
          onClick={() => setActiveSubTab('commissions')}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer ${
            activeSubTab === 'commissions' ? (isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-indigo-500 border-b-2 border-indigo-500') : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {isVendedor ? 'Minhas Comissões' : 'Comissões do Atendimento'}
        </button>
      </div>

      {/* SUB-VIEW 1: GENERAL LEDGER FLOW */}
      {activeSubTab === 'cash_flow' && !isVendedor && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-3xs font-mono uppercase tracking-wider pb-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-150 text-slate-500'}`}>
                  <th className="py-3 px-2">Tipo</th>
                  <th className="py-3 px-2">Descrição do Lançamento</th>
                  <th className="py-3 px-2">Categoria</th>
                  <th className="py-3 px-2">Data Vencimento</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Valor Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/10">
                {transactions.map(tx => {
                  const isEntrada = tx.type === 'entrada';
                  return (
                    <tr key={tx.id} className={isDark ? 'hover:bg-slate-950/20 text-slate-300' : 'hover:bg-slate-50 text-slate-800'}>
                      <td className="py-3.5 px-2 font-semibold">
                        <span className={`inline-flex items-center gap-1 text-3xs font-mono px-2 py-0.5 rounded font-bold ${
                          isEntrada ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                        }`}>
                          {isEntrada ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-medium">{tx.description}</td>
                      <td className="py-3.5 px-2 text-slate-500 font-mono text-2xs">{tx.category}</td>
                      <td className="py-3.5 px-2 font-mono text-slate-400 text-2xs">{tx.date}</td>
                      <td className="py-3.5 px-2">
                        <span className={`text-4xs font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          tx.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3.5 px-2 text-right font-mono font-bold ${isEntrada ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isEntrada ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: PAYABLES AND RECEIVABLES */}
      {activeSubTab === 'receivables' && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-3xs font-mono uppercase tracking-wider pb-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-150 text-slate-500'}`}>
                  <th className="py-3 px-2">Natureza</th>
                  <th className="py-3 px-2">Descrição da Fatura</th>
                  <th className="py-3 px-2">Vencimento</th>
                  <th className="py-3 px-2">Status do Pagamento</th>
                  <th className="py-3 px-2 text-right">Valor da Fatura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/10">
                {transactions.filter(tx => tx.status === 'Pendente').map(tx => {
                  const isEntrada = tx.type === 'entrada';
                  return (
                    <tr key={tx.id} className={isDark ? 'hover:bg-slate-950/20 text-slate-300' : 'hover:bg-slate-50 text-slate-800'}>
                      <td className="py-3.5 px-2 font-mono text-2xs">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          isEntrada ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {isEntrada ? 'A Receber' : 'A Pagar'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-medium">{tx.description}</td>
                      <td className="py-3.5 px-2 font-mono text-slate-400 text-2xs">{tx.date}</td>
                      <td className="py-3.5 px-2">
                        <span className="text-4xs font-mono px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-500 uppercase animate-pulse">
                          Aguardando Pagamento
                        </span>
                      </td>
                      <td className={`py-3.5 px-2 text-right font-mono font-bold ${isEntrada ? 'text-blue-400' : 'text-orange-400'}`}>
                        R$ {tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SALES COMMISSIONS */}
      {activeSubTab === 'commissions' && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
          <div className={`p-3.5 rounded-xl border ${isDark ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-indigo-500/20 bg-indigo-500/5'}`}>
            <p className="text-2xs text-slate-400 leading-relaxed">
              <strong>Regra de Cálculo de Comissões</strong>: Todo operador de atendimento recebe uma taxa automática de <strong>5% de comissão</strong> sobre o valor total de Ordens de Serviço faturadas (com estágio finalizado em "Concluído").
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-3xs font-mono uppercase tracking-wider pb-2 ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-150 text-slate-500'}`}>
                  <th className="py-3 px-2">Vendedor</th>
                  <th className="py-3 px-2">Quantidade OS Concluídas</th>
                  <th className="py-3 px-2">Faturamento de Venda Total</th>
                  <th className="py-3 px-2">Taxa Comissão Aplicada</th>
                  <th className="py-3 px-2 text-right">Comissão Devida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/10">
                {sellerCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic text-xs">Ainda não há Ordens de Serviço concluídas para calcular comissões.</td>
                  </tr>
                ) : (
                  sellerCommissions.map((sc, index) => (
                    <tr key={index} className={isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-800'}>
                      <td className="py-3.5 px-2 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <User className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-cyan-400' : 'text-indigo-400'}`} />
                          <span>{sc.name}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-mono text-slate-400">{sc.ordersCount} pedidos</td>
                      <td className="py-3.5 px-2 font-mono">R$ {sc.totalSales.toFixed(2)}</td>
                      <td className="py-3.5 px-2 font-mono text-slate-500">5.00%</td>
                      <td className="py-3.5 px-2 text-right font-mono font-bold text-emerald-400">
                        R$ {sc.commission.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSACTION REGISTER DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl border text-sm shadow-2xl space-y-4 ${
            isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-display font-bold tracking-tight">Registrar Lançamento Financeiro</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('entrada')}
                    className={`py-2 rounded-lg font-semibold text-xs border cursor-pointer transition-all ${
                      type === 'entrada' 
                        ? (isDark ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-emerald-500/10 border-emerald-500 text-emerald-400')
                        : (isDark ? 'bg-[#1A1A1E] border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500')
                    }`}
                  >
                    Entrada / Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('saida')}
                    className={`py-2 rounded-lg font-semibold text-xs border cursor-pointer transition-all ${
                      type === 'saida' 
                        ? 'bg-rose-500/10 border-rose-500 text-rose-400' 
                        : (isDark ? 'bg-[#1A1A1E] border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500')
                    }`}
                  >
                    Saída / Despesa
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Descrição do Lançamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aquisição de Bobinas Sublimáticas"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Valor Financeiro (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Categoria</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Status Inicial</label>
                  <select
                     value={status}
                     onChange={(e) => setStatus(e.target.value as 'pago' | 'pendente')}
                     className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                       isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                     }`}
                  >
                    <option value="pago">Fechado / Conciliado</option>
                    <option value="pendente">Pendente / Em Aberto</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 border rounded-xl text-xs font-semibold ${
                    isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold`}
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
