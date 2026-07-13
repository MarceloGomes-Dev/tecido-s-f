import React, { useMemo, useState } from 'react';
import { 
  ArrowRight, Clock, AlertTriangle, CheckSquare, MessageSquare, 
  Calendar, ShieldAlert, Sparkles, CheckCircle2, Lock, Paperclip
} from 'lucide-react';
import { OS, ProductionStage, User, UserRole } from '../types';

interface KanbanBoardProps {
  osList: OS[];
  users: User[];
  advanceOSStage: (osId: string, customNextStage?: ProductionStage) => void;
  getStageLabel: (st: ProductionStage) => string;
  activeUser: User | null;
  theme: 'claro' | 'escuro';
}

export default function KanbanBoard({ osList, users, advanceOSStage, getStageLabel, activeUser, theme }: KanbanBoardProps) {
  const isDark = theme === 'escuro';
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewOSNumber, setPreviewOSNumber] = useState<string>('');

  const stageToRolesMap: Record<ProductionStage, UserRole[]> = {
    sistema: ['atendimento'],
    designer: ['designer'],
    pasta: ['designer'],
    impressao: ['impressao'],
    producao: ['producao'],
    corredor: ['producao', 'costura'],
    costura: ['costura'],
    finalizacao: ['finalizacao'],
    empacotamento: ['finalizacao'],
    expedicao: ['finalizacao'],
    entrega: ['finalizacao', 'atendimento'],
    concluido: []
  };

  const checkHasPermission = (stage: ProductionStage) => {
    const userRole = activeUser?.role || 'admin';
    if (userRole === 'admin') return true;
    const allowedRoles = stageToRolesMap[stage] || [];
    return allowedRoles.includes(userRole);
  };

  // 12 Production Columns
  const kanbanStages: ProductionStage[] = [
    'sistema', 'designer', 'pasta', 'impressao', 'producao', 'corredor', 'costura', 'finalizacao', 'empacotamento', 'expedicao', 'entrega', 'concluido'
  ];

  // Group orders by active stage
  const groupedOrders = useMemo(() => {
    const groups: { [key in ProductionStage]?: OS[] } = {};
    kanbanStages.forEach(st => {
      groups[st] = [];
    });
    osList.forEach(os => {
      const activeStage = os.currentStage;
      if (groups[activeStage]) {
        groups[activeStage]?.push(os);
      } else {
        groups[activeStage] = [os];
      }
    });
    return groups;
  }, [osList]);

  // Color mapper for priority flags
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgente': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'alta': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'normal': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  // Helper calculation for Corredor status
  const getCorredorStatus = (os: OS) => {
    if (!os.corredorPrevistoDate) return null;
    const target = new Date(os.corredorPrevistoDate);
    const today = new Date('2026-07-10'); // Simulated anchor date
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Atrasado', color: 'bg-red-500 text-white' };
    } else if (diffDays <= 1) {
      return { label: 'Próximo prazo', color: 'bg-yellow-500 text-slate-900' };
    } else {
      return { label: 'Dentro do prazo', color: 'bg-green-500 text-white' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Grid */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight">Fluxo de Produção </h2>
            <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Monitore o fluxo produtivo em tempo real. Cada cartão representa uma Ordem de Serviço seguindo seu próprio roteiro de costura e prensagem.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono text-xs border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Atualização em tempo real ativa</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Container (Vertical Scrollable, Grid of 4 columns) */}
      <div className="overflow-y-auto max-h-[calc(100vh-230px)] no-scrollbar pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kanbanStages.map(stage => {
            const list = groupedOrders[stage] || [];
            const isCompletedStage = stage === 'concluido';
            return (
              <div 
                key={stage} 
                className={`w-full flex flex-col rounded-2xl border p-4 h-[390px] ${
                  isDark ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-3 border-b border-slate-800/25 pb-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h3 className="font-display font-bold text-xs tracking-tight uppercase">{getStageLabel(stage).split(' (')[0]}</h3>
                  </div>
                  <span className={`text-2xs font-mono px-2 py-0.5 rounded-full font-bold ${
                    list.length > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {list.length}
                  </span>
                </div>

                {/* Column Scrollable Content */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
                  {list.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 italic text-2xs border border-dashed border-slate-800/40 rounded-xl bg-slate-950/10">
                      Nenhuma OS nesta etapa
                    </div>
                  ) : (
                    list.map(os => {
                      const corrStatus = getCorredorStatus(os);
                      return (
                        <div 
                          key={os.id} 
                          className={`p-4 rounded-xl border space-y-3.5 shadow-xs transition-all hover:translate-y-[-2px] relative overflow-hidden group ${
                            isDark 
                              ? 'bg-slate-950 border-slate-850 hover:bg-slate-900/60' 
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {/* Priority Colored Top strip bar */}
                          <div className={`absolute top-0 left-0 right-0 h-1 ${
                            os.priority === 'urgente' ? 'bg-red-500' :
                            os.priority === 'alta' ? 'bg-amber-500' :
                            os.priority === 'normal' ? 'bg-blue-500' : 'bg-slate-400'
                          }`} />

                          {/* Card Header details */}
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-3xs font-mono text-indigo-400 font-bold bg-indigo-500/5 px-1.5 py-0.2 rounded">OS #{os.osNumber}</span>
                              <h4 className="font-semibold text-xs tracking-tight text-slate-800 dark:text-slate-100 mt-1 truncate max-w-[170px]">{os.clientName}</h4>
                            </div>
                            <span className={`text-4xs font-mono uppercase px-1.5 py-0.2 rounded font-bold ${getPriorityColor(os.priority)}`}>
                              {os.priority}
                            </span>
                          </div>

                          {/* Card Summary details */}
                          <div className="space-y-1 text-2xs text-slate-500 leading-tight">
                            <p className="truncate"><span className="text-slate-500">Item:</span> <strong className="text-slate-800 dark:text-slate-300">{os.product}</strong></p>
                            <p><span className="text-slate-500">Qtd:</span> <strong className="text-slate-800 dark:text-slate-300">{os.qty} un</strong></p>
                            <p className="flex items-center gap-1 text-3xs font-mono text-slate-400"><Calendar className="w-3 h-3 text-slate-500" /> Limite: {os.deadline}</p>
                          </div>

                          {/* Model File Attachment / Sublimation mock Results */}
                          {(() => {
                            const getOSMockImage = (o: OS) => {
                              if (o.imageUrl) return o.imageUrl;
                              if (o.fileUrl && (o.fileUrl.startsWith('data:image/') || o.fileUrl.endsWith('.png') || o.fileUrl.endsWith('.jpg') || o.fileUrl.endsWith('.jpeg') || o.fileUrl.endsWith('.webp'))) {
                                return o.fileUrl;
                              }
                              const prodLower = o.product.toLowerCase();
                              const catLower = o.category.toLowerCase();
                              if (prodLower.includes('jersey') || prodLower.includes('camisa') || prodLower.includes('futebol') || catLower.includes('esporte')) {
                                return 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80';
                              }
                              if (prodLower.includes('caneca') || catLower.includes('caneca') || prodLower.includes('copo')) {
                                return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80';
                              }
                              if (prodLower.includes('abadá') || prodLower.includes('abada') || prodLower.includes('carnaval')) {
                                return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80';
                              }
                              if (prodLower.includes('boné') || prodLower.includes('bone') || catLower.includes('acessório')) {
                                return 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80';
                              }
                              return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';
                            };

                            const modelImg = getOSMockImage(os);

                            return (
                              <div className="space-y-1.5 pt-1 border-t border-slate-800/10">
                                <div className="flex items-center justify-between text-4xs font-mono text-indigo-400">
                                  <span className="font-semibold flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 animate-pulse text-indigo-400" /> Modelo / Arte
                                  </span>
                                  <span className="text-slate-500 uppercase">Setor: {getStageLabel(os.currentStage).split(' (')[0]}</span>
                                </div>
                                
                                {/* Thumbnail Image Box */}
                                <div 
                                  onClick={() => {
                                    setPreviewImage(modelImg);
                                    setPreviewOSNumber(os.osNumber);
                                  }}
                                  className="relative group overflow-hidden rounded-xl h-20 border border-indigo-500/10 bg-slate-900/40 cursor-zoom-in"
                                  title="Clique para visualizar o modelo em detalhes"
                                >
                                  <img 
                                    src={modelImg} 
                                    alt="Modelo da OS" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-1.5 py-0.5 bg-slate-950/80 rounded text-[9px] font-semibold text-white tracking-wide border border-indigo-500/20">Ver Detalhes</span>
                                  </div>
                                </div>

                                {/* Download option in this sector */}
                                <a 
                                  href={modelImg} 
                                  download={`OS_${os.osNumber}_modelo`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 border border-indigo-500/15 cursor-pointer shadow-3xs transition-all duration-200"
                                >
                                  <Paperclip className="w-2.5 h-2.5" />
                                  <span>Download Modelo</span>
                                </a>
                              </div>
                            );
                          })()}

                          {/* If stage Corredor logic indicator matches */}
                          {stage === 'corredor' && corrStatus && (
                            <div className="p-1.5 rounded text-3xs font-mono flex items-center justify-between bg-slate-900 border border-slate-800 mt-1">
                              <span className="text-slate-400">Status Corredor:</span>
                              <span className={`px-1.5 py-0.2 rounded text-4xs font-bold ${corrStatus.color}`}>
                                {corrStatus.label}
                              </span>
                            </div>
                          )}

                          {/* Checklist mini-progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-3xs font-mono text-slate-500">
                              <span>Checklist</span>
                              <span>
                                {Object.values(os.checklist).filter(Boolean).length} / {Object.keys(os.checklist).length}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all" 
                                style={{ 
                                  width: `${
                                    Object.keys(os.checklist).length > 0 
                                      ? (Object.values(os.checklist).filter(Boolean).length / Object.keys(os.checklist).length) * 100 
                                      : 0
                                  }%` 
                                }}
                              />
                            </div>
                          </div>

                          {/* Card Footer Controls */}
                          {!isCompletedStage && (
                            <div className="pt-2 border-t border-slate-800/10 flex justify-between items-center">
                              {/* Quick active sector indicator */}
                              <span className="text-4xs font-mono text-slate-500">
                                {checkHasPermission(os.currentStage) ? 'Pressione p/ avançar' : 'Acesso Restrito'}
                              </span>
                              
                              <button
                                onClick={() => advanceOSStage(os.id)}
                                className={`p-1 px-2 rounded-lg text-3xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-md ${
                                  checkHasPermission(os.currentStage)
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:translate-x-0.5 hover:shadow-indigo-500/10'
                                    : 'bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                                }`}
                                title={checkHasPermission(os.currentStage) ? 'Avançar OS de setor' : 'Apenas o setor responsável pode avançar'}
                              >
                                <span>Avançar</span>
                                {checkHasPermission(os.currentStage) ? (
                                  <ArrowRight className="w-3 h-3" />
                                ) : (
                                  <Lock className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {/* Concluded tag if completed */}
                          {isCompletedStage && (
                            <div className="pt-2 border-t border-slate-850 text-emerald-400 text-3xs font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Entrega Finalizada com Sucesso</span>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Fidelity Detail Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`relative max-w-lg w-full rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-850'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/20">
              <div>
                <h3 className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-white">Resultado Final do Modelo (Arte)</h3>
                <p className="text-3xs font-mono text-indigo-400 uppercase tracking-widest mt-0.5">OS #{previewOSNumber} • Visualização em Detalhes</p>
              </div>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1 px-2.5 rounded-lg text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* High fidelity model display */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/40 bg-slate-950 max-h-[350px] flex items-center justify-center">
              <img 
                src={previewImage} 
                alt="Resultado do Modelo Sublimático" 
                className="w-full h-auto object-contain max-h-[350px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <p className="text-slate-500 dark:text-slate-400 text-3xs leading-relaxed font-sans text-center italic">
                Este modelo representa a arte finalizada com gabarito de costura e paleta de cores calibrada para sublimação.
              </p>
              
              <div className="flex gap-2">
                <a 
                  href={previewImage} 
                  download={`OS_${previewOSNumber}_modelo_alta_resolucao`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-center text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 cursor-pointer transition-all"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Download Alta Resolução</span>
                </a>
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold text-xs cursor-pointer transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
