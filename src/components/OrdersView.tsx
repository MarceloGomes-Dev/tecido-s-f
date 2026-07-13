import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Eye, CheckSquare, MessageSquare, ArrowRight, Clock, AlertTriangle, 
  FileText, Paperclip, Send, ShieldAlert, Sparkles, User as UserIcon, Calendar, CheckCircle2, Lock,
  DollarSign, Printer, Download, Share2, RefreshCw, Mail
} from 'lucide-react';
import { OS, Client, Product, User, Category, ProductionStage, OSPriority, UserRole } from '../types';

interface OrdersViewProps {
  osList: OS[];
  clients: Client[];
  products: Product[];
  categories: Category[];
  users: User[];
  createOS: (osData: Omit<OS, 'id' | 'osNumber' | 'currentStage' | 'status' | 'history' | 'chat' | 'checklist' | 'flowStages'>, flowStages: ProductionStage[], checklistItems: string[]) => void;
  advanceOSStage: (osId: string, customNextStage?: ProductionStage) => void;
  updateOSChecklistItem: (osId: string, itemKey: string, checked: boolean) => void;
  addOSChatMessage: (osId: string, content: string) => void;
  getStageLabel: (st: ProductionStage) => string;
  activeUser: User | null;
  theme: 'claro' | 'escuro';
  updateOSPaymentInfo?: (osId: string, paymentInfo: any) => void;
  updateOSInvoiceInfo?: (osId: string, invoiceInfo: any) => void;
  addTransaction?: (rec: any) => void;
}

export default function OrdersView({
  osList, clients, products, categories, users, createOS, advanceOSStage, 
  updateOSChecklistItem, addOSChatMessage, getStageLabel, activeUser, theme,
  updateOSPaymentInfo, updateOSInvoiceInfo, addTransaction
}: OrdersViewProps) {
  const isDark = theme === 'escuro';

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

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected OS for Detail popup view
  const [selectedOS, setSelectedOS] = useState<OS | null>(null);
  const [selectedPaymentOS, setSelectedPaymentOS] = useState<OS | null>(null);

  // Modal controllers
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New OS Form States
  const [clientId, setClientId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState('');
  const [qty, setQty] = useState(1);
  const [value, setValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Pix (50% Sinal + 50% Entrega)');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<OSPriority>('normal');
  const [responsavelId, setResponsavelId] = useState('');

  // Drag and drop / files states
  const [uploadedArteName, setUploadedArteName] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedArteUrl, setUploadedArteUrl] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [isDraggingArte, setIsDraggingArte] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  // Flow custom checkboxes
  const allAvailableStages: ProductionStage[] = [
    'sistema', 'designer', 'pasta', 'impressao', 'producao', 'corredor', 'costura', 'finalizacao', 'empacotamento', 'expedicao', 'entrega'
  ];
  const [selectedFlowStages, setSelectedFlowStages] = useState<ProductionStage[]>([
    'sistema', 'designer', 'pasta', 'impressao', 'producao', 'costura', 'finalizacao', 'empacotamento', 'expedicao', 'entrega'
  ]);
  const [corredorDate, setCorredorDate] = useState('');

  // Checklist items
  const [checklistInput, setChecklistInput] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Conferência de tamanhos',
    'Arquivo de arte em alta resolução (CMYK)',
    'Aprovado pelo cliente no WhatsApp',
    'Revisão de fios soltos no acabamento'
  ]);

  // Chat input
  const [chatInput, setChatInput] = useState('');

  // Modal tabs and financial edit states
  const [modalTab, setModalTab] = useState<'geral' | 'pagamento' | 'nf'>('geral');
  const [showDanfe, setShowDanfe] = useState<OS | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);
  const [paymentRegAmount, setPaymentRegAmount] = useState<string>('');
  const [paymentRegMethod, setPaymentRegMethod] = useState<'Dinheiro' | 'Cartão' | 'PIX' | 'Débito' | 'Transferência'>('PIX');
  const [receiptInput, setReceiptInput] = useState('');
  
  // States for Admin budget alterations
  const [editBudget, setEditBudget] = useState<string>('');
  const [editDiscount, setEditDiscount] = useState<string>('');
  const [editAddition, setEditAddition] = useState<string>('');
  const [editShipping, setEditShipping] = useState<string>('');
  const [manualCorrection, setManualCorrection] = useState('');
  const [osPayMethod, setOsPayMethod] = useState<string>('PIX');
  const [paymentOperator, setPaymentOperator] = useState<string>('');
  const [paymentInstallments, setPaymentInstallments] = useState<number>(1);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    if (selectedPaymentOS) {
      setOsPayMethod('PIX');
      setPaymentOperator(activeUser?.name || 'Atendimento');
      setPaymentInstallments(1);
      setPaymentSuccess(false);
    }
  }, [selectedPaymentOS, activeUser]);

  React.useEffect(() => {
    if (selectedOS) {
      setEditBudget(String(selectedOS.paymentInfo?.budgetVal ?? selectedOS.value));
      setEditDiscount(String(selectedOS.paymentInfo?.discount ?? 0));
      setEditAddition(String(selectedOS.paymentInfo?.addition ?? 0));
      setEditShipping(String(selectedOS.paymentInfo?.shipping ?? 0));
      setModalTab('geral');
      setPaymentRegAmount('');
      setReceiptInput('');
      setManualCorrection('');
    }
  }, [selectedOS?.id]);

  // Helper calculation for Corredor status
  const getCorredorStatusPill = (os: OS) => {
    if (!os.corredorPrevistoDate) return null;
    const target = new Date(os.corredorPrevistoDate);
    const today = new Date('2026-07-10'); // Simulated anchor date
    
    // Calculate difference in days
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Atrasado (Corredor)', color: 'bg-red-500/10 text-red-400 border border-red-500/20' };
    } else if (diffDays <= 1) {
      return { label: 'Urgente (Corredor)', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' };
    } else {
      return { label: 'No Prazo (Corredor)', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    }
  };

  // Filter lists
  const filteredOSList = useMemo(() => {
    return osList.filter(os => {
      const matchSearch = 
        os.osNumber.includes(searchTerm) || 
        os.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.product.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchPriority = filterPriority === 'all' || os.priority === filterPriority;
      const matchStage = filterStage === 'all' || os.currentStage === filterStage;
      const matchStatus = filterStatus === 'all' || os.status === filterStatus;

      return matchSearch && matchPriority && matchStage && matchStatus;
    });
  }, [osList, searchTerm, filterPriority, filterStage, filterStatus]);

  // Handle flow selection
  const toggleFlowStage = (stage: ProductionStage) => {
    if (stage === 'sistema' || stage === 'entrega') return; // Immutable starting/ending
    if (selectedFlowStages.includes(stage)) {
      setSelectedFlowStages(prev => prev.filter(s => s !== stage));
    } else {
      // Keep sort alignment
      const sorted: ProductionStage[] = [];
      allAvailableStages.forEach(s => {
        if (s === stage || selectedFlowStages.includes(s)) {
          sorted.push(s);
        }
      });
      setSelectedFlowStages(sorted);
    }
  };

  // Handle checklist add
  const handleAddChecklistItem = () => {
    if (checklistInput.trim()) {
      setChecklistItems(prev => [...prev, checklistInput.trim()]);
      setChecklistInput('');
    }
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Trigger auto price calculation when product or quantity changes
  const handleProductSelect = (p: Product) => {
    setSelectedProduct(p);
    setProductSearch(p.name);
    setCategory(p.category);
    setValue(p.price * qty);
  };

  const handleQtyChange = (val: number) => {
    setQty(val);
    if (selectedProduct) {
      setValue(selectedProduct.price * val);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Selecione um cliente.');
      return;
    }
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    createOS(
      {
        clientId: client.id,
        clientName: client.name,
        product: selectedProduct ? selectedProduct.name : productSearch,
        category: category || 'Diversos',
        qty,
        value,
        paymentMethod,
        entryDate: new Date().toISOString().split('T')[0],
        deadline: deadline || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days default
        notes,
        priority,
        imageUrl: uploadedArteUrl || (uploadedArteName ? 'https://images.unsplash.com/photo-1542513217-0b0eedf7005d?auto=format&fit=crop&q=80&w=200' : undefined),
        fileUrl: uploadedFileUrl || (uploadedFileName ? '#' : undefined),
        corredorPrevistoDate: selectedFlowStages.includes('corredor') ? corredorDate : undefined
      },
      selectedFlowStages,
      checklistItems
    );

    // Reset Form
    setShowCreateModal(false);
    setClientId('');
    setSelectedProduct(null);
    setProductSearch('');
    setCategory('');
    setQty(1);
    setValue(0);
    setNotes('');
    setPriority('normal');
    setUploadedArteName('');
    setUploadedFileName('');
    setUploadedArteUrl('');
    setUploadedFileUrl('');
  };

  const handleSendChatMessage = (osId: string) => {
    if (chatInput.trim()) {
      addOSChatMessage(osId, chatInput.trim());
      setChatInput('');
      // Trigger a sync for selectedOS view in modal
      const updated = osList.find(o => o.id === osId);
      if (updated) {
        setSelectedOS({
          ...updated,
          chat: [...updated.chat, {
            id: `temp-${Date.now()}`,
            senderName: activeUser?.name || 'Sistema',
            senderRole: activeUser?.role || 'admin',
            content: chatInput.trim(),
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }]
        });
      }
    }
  };

  // Drag and drop mock events
  const handleDragOver = (e: React.DragEvent, type: 'arte' | 'file') => {
    e.preventDefault();
    if (type === 'arte') setIsDraggingArte(true);
    else setIsDraggingFiles(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'arte' | 'file') => {
    e.preventDefault();
    if (type === 'arte') setIsDraggingArte(false);
    else setIsDraggingFiles(false);
  };

  const readFileAsDataURL = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, type: 'arte' | 'file') => {
    e.preventDefault();
    if (type === 'arte') {
      setIsDraggingArte(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        setUploadedArteName(file.name);
        readFileAsDataURL(file, setUploadedArteUrl);
      }
    } else {
      setIsDraggingFiles(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        setUploadedFileName(file.name);
        readFileAsDataURL(file, setUploadedFileUrl);
      }
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'arte' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'arte') {
        setUploadedArteName(file.name);
        readFileAsDataURL(file, setUploadedArteUrl);
      } else {
        setUploadedFileName(file.name);
        readFileAsDataURL(file, setUploadedFileUrl);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight">Ordens de Serviço (OS)</h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gerencie e crie pedidos, configure etapas de fabricação personalizadas por produto e acione os setores de produção.
          </p>
        </div>
        
        {/* Only authorized roles can create new OS */}
        {['admin', 'atendimento'].includes(activeUser?.role || '') && (
          <button
            onClick={() => {
              setSelectedFlowStages(['sistema', 'designer', 'pasta', 'impressao', 'producao', 'costura', 'finalizacao', 'empacotamento', 'expedicao', 'entrega']);
              setChecklistItems(['Conferência de tamanhos', 'Layout aprovado no WhatsApp', 'Revisão de estampa sem fantasmas', 'Costura dupla reforçada']);
              setShowCreateModal(true);
            }}
            className={`px-4 py-2 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ordem de Serviço</span>
          </button>
        )}
      </div>

      {/* Filters Area */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-md' : 'bg-white border-slate-100'} shadow-sm flex flex-col md:flex-row items-center gap-3 text-xs`}>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar por OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border outline-none focus:ring-1 ${
              isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Priority filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-[#1A1A1E] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="all">Prioridade: Todas</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="normal">Normal</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          {/* Stage filter */}
          <div>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-[#1A1A1E] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="all">Setor: Todos</option>
              {allAvailableStages.map(st => (
                <option key={st} value={st}>{getStageLabel(st)}</option>
              ))}
              <option value="concluido">Concluído</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`p-2 rounded-lg border outline-none ${isDark ? 'bg-[#1A1A1E] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="all">Status: Todos</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* OS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOSList.length === 0 ? (
          <div className={`col-span-full py-16 text-center rounded-2xl border border-dashed ${isDark ? 'border-white/5 bg-[#111114]' : 'border-slate-200'} text-slate-500`}>
            <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold">Nenhuma Ordem de Serviço encontrada.</p>
            <p className="text-2xs max-w-sm mx-auto mt-1">Experimente alterar os filtros selecionados ou crie um novo pedido para começar o fluxo.</p>
          </div>
        ) : (
          filteredOSList.map(os => {
            const corrPill = getCorredorStatusPill(os);
            return (
              <div 
                key={os.id} 
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm transition-all hover:shadow-md ${
                  isDark ? 'bg-[#111114] border-white/5 hover:border-cyan-500/20 hover:bg-[#15151a]' : 'bg-white border-slate-100 hover:bg-slate-50/50'
                }`}
              >
                {/* Card Header */}
                <div className="border-b border-slate-800/10 pb-3 flex justify-between items-start gap-2">
                  <div>
                    <span className={`text-3xs font-mono px-2 py-0.5 rounded font-bold ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400'}`}>OS #{os.osNumber}</span>
                    <h3 className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100 mt-1 truncate max-w-[150px]">{os.clientName}</h3>
                  </div>

                  {/* Priority indicators */}
                  <span className={`text-4xs font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    os.priority === 'urgente' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                    os.priority === 'alta' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    os.priority === 'normal' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {os.priority}
                  </span>
                </div>

                {/* Card Body */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Produto:</span>
                    <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{os.product}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Quantidade:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{os.qty} unidades</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Valor Total:</span>
                    <strong className={`${isDark ? 'text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]' : 'text-indigo-500'} font-mono font-bold`}>R$ {os.value.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Entrega:</span>
                    <strong className={`font-mono flex items-center gap-1 ${os.deadline < '2026-07-10' && os.currentStage !== 'concluido' ? 'text-red-400' : 'text-slate-800 dark:text-slate-300'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {os.deadline}
                    </strong>
                  </div>

                  {/* Corredor scheduled custom indicator if present */}
                  {corrPill && (
                    <div className="pt-1">
                      <span className={`text-5xs font-mono px-2 py-0.5 rounded-full block text-center ${corrPill.color}`}>
                        {corrPill.label} • Limite: {os.corredorPrevistoDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* Current stage badge and tracking progress */}
                <div className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${
                  isDark ? 'bg-[#1A1A1E] border border-white/5' : 'bg-slate-50 border border-slate-200'
                }`}>
                  <div>
                    <p className="text-4xs font-mono text-slate-500 uppercase tracking-widest leading-none">Estágio Atual</p>
                    <p className={`font-semibold mt-1 leading-tight ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>{getStageLabel(os.currentStage)}</p>
                  </div>
                  <span className={`text-4xs font-mono px-1.5 py-0.5 rounded ${
                    os.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400' :
                    os.status === 'Atrasado' ? 'bg-red-500/10 text-red-400' :
                    isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>{os.status}</span>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 flex flex-col gap-2 border-t border-slate-800/10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Fetch fresh copy from active list to stay synchronized
                        const freshOS = osList.find(o => o.id === os.id);
                        if (freshOS) setSelectedOS(freshOS);
                      }}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isDark ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </button>

                    <button
                      onClick={() => {
                        if (os.paymentInfo?.paymentStatus !== 'Pago' && activeUser?.role !== 'admin' && activeUser?.role !== 'atendimento') {
                          alert('Erro: Apenas colaboradores da Administração ou Atendimento podem registrar e alterar formas de pagamento.');
                          return;
                        }
                        setSelectedPaymentOS(os);
                      }}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        os.paymentInfo?.paymentStatus === 'Pago'
                          ? (isDark ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-600')
                          : (isDark ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' : 'border-amber-200 bg-amber-50 text-amber-600')
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{os.paymentInfo?.paymentStatus === 'Pago' ? 'Pago' : 'Pagamento'}</span>
                    </button>
                  </div>

                  {/* Render advance control depending on active profile */}
                  {os.currentStage !== 'concluido' && (
                    <button
                      onClick={() => {
                        if (os.paymentInfo?.paymentStatus !== 'Pago') {
                          alert(`Só é permitido avançar o estágio após o pagamento estar reconhecido (Pago)!\nClique no botão "Pagamento" ao lado para registrar o recebimento.`);
                          return;
                        }
                        advanceOSStage(os.id);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                        checkHasPermission(os.currentStage) && os.paymentInfo?.paymentStatus === 'Pago'
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/10'
                          : 'bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                      title={os.paymentInfo?.paymentStatus !== 'Pago' ? 'Aguardando reconhecimento de pagamento' : (checkHasPermission(os.currentStage) ? 'Avançar OS de setor' : 'Apenas o setor responsável pode avançar')}
                    >
                      <span>Avançar Setor</span>
                      {checkHasPermission(os.currentStage) && os.paymentInfo?.paymentStatus === 'Pago' ? (
                        <ArrowRight className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl p-6 rounded-2xl border text-sm shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            <div className="flex justify-between items-start border-b border-slate-800/20 pb-3">
              <div>
                <h3 className="text-lg font-display font-bold tracking-tight">Nova Ordem de Serviço</h3>
                <p className="text-2xs text-slate-500 font-mono">CADASTRO DE PEDIDO & CONFIGURAÇÃO DO FLUXO DE PRODUÇÃO</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              
              {/* Section 1: Client & Logistics */}
              <div className="space-y-3">
                <h4 className="text-2xs font-mono uppercase text-indigo-400 tracking-wider">1. Dados do Cliente e Comercial</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Cliente Proprietário *</label>
                    <select
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="">Selecione o Cliente</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type === 'PJ' ? 'CNPJ' : 'CPF'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Prazo Limite de Entrega *</label>
                    <input
  type="text"
  placeholder="dd/mm/aaaa"
  value={deadline}
  onChange={(e) => setDeadline(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Products and Values */}
              <div className="space-y-3">
                <h4 className="text-2xs font-mono uppercase text-indigo-400 tracking-wider">2. Especificação do Produto e Preço</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-2xs text-slate-400 font-mono">Selecione Modelo Base</label>
                    <select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const p = products.find(prod => prod.id === e.target.value);
                        if (p) handleProductSelect(p);
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="">-- Personalizado / Outro --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Descrição do Produto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Abadá Premium, Camisa, etc."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Categoria</label>
                    <input
                      type="text"
                      placeholder="Ex: Carnaval / Eventos"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Quantidade *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={qty}
                      onChange={(e) => handleQtyChange(parseInt(e.target.value) || 1)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Valor Total da OS *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={value}
                      onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Prioridade da OS *</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as OSPriority)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="urgente">Urgente (Crítico)</option>
                      <option value="alta">Alta</option>
                      <option value="normal">Normal</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-2xs text-slate-400 font-mono">Vendedor Responsável</label>
                    <select
                      value={responsavelId}
                      onChange={(e) => setResponsavelId(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {users.filter(u => ['admin', 'atendimento'].includes(u.role)).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Customizable Production Flow */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xs font-mono uppercase text-indigo-400 tracking-wider">3. Personalização das Etapas de Fabricação</h4>
                  <span className={`text-4xs font-mono ${isDark ? 'text-cyan-400' : 'text-black font-semibold'}`}>Marque as etapas que o produto irá atravessar</span>
                </div>

                <div className={`grid grid-cols-3 gap-2 p-3 rounded-lg border ${
                  isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  {allAvailableStages.map(st => {
                    const isSelected = selectedFlowStages.includes(st);
                    const isImmutable = st === 'sistema' || st === 'entrega';
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => !isImmutable && toggleFlowStage(st)}
                        disabled={isImmutable}
                        className={`px-2 py-1.5 rounded-md font-mono text-2xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer justify-start ${
                          isSelected 
                            ? (isDark ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30' : 'bg-indigo-50 text-black border-indigo-500') 
                            : (isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-black hover:bg-slate-100')
                        }`}
                      >
                        <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected 
                            ? (isDark ? 'text-cyan-400' : 'text-indigo-600') 
                            : (isDark ? 'text-slate-600' : 'text-slate-400')
                        }`} />
                        <span className="truncate">{getStageLabel(st)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Expected Corredor Date if Corredor is selected */}
                {selectedFlowStages.includes('corredor') && (
                  <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Clock className="w-4 h-4" />
                      <p className="text-xs font-semibold">Configuração Adicional: Setor Corredor Selecionado</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <label className="text-2xs text-slate-400 leading-tight">
                        Informe a data limite em que este produto precisa cruzar a etapa Corredor para não comprometer o prazo geral:
                      </label>
                      <input
                        type="date"
                        required
                        value={corredorDate}
                        onChange={(e) => setCorredorDate(e.target.value)}
                        className={`p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Drag & Drop files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Upload Arte */}
                <div className="space-y-1">
                  <label className="text-2xs text-slate-400 font-mono">Upload da Arte Final (Layout)</label>
                  <div
                    onDragOver={(e) => handleDragOver(e, 'arte')}
                    onDragLeave={(e) => handleDragLeave(e, 'arte')}
                    onDrop={(e) => handleDrop(e, 'arte')}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDraggingArte ? 'border-indigo-500 bg-indigo-500/10' :
                      uploadedArteName ? 'border-emerald-500/40 bg-emerald-500/5' :
                      isDark ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <Sparkles className={`w-6 h-6 mx-auto mb-1 ${uploadedArteName ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <p className="text-2xs font-semibold">{uploadedArteName || 'Arraste a arte aqui ou clique'}</p>
                    <p className="text-3xs text-slate-500 mt-0.5">Suporta PNG, JPEG, PDF ou Vetores</p>
                    <input
                      type="file"
                      onChange={(e) => handleFileSelectChange(e, 'arte')}
                      className="hidden"
                      id="upload_arte_field"
                    />
                    <label htmlFor="upload_arte_field" className="block text-3xs text-indigo-400 underline mt-2 cursor-pointer">Procurar arquivo</label>
                  </div>
                </div>

                {/* Upload Ficha Técnica */}
                <div className="space-y-1">
                  <label className="text-2xs text-slate-400 font-mono">Upload de Ficha Técnica / Modelagem</label>
                  <div
                    onDragOver={(e) => handleDragOver(e, 'file')}
                    onDragLeave={(e) => handleDragLeave(e, 'file')}
                    onDrop={(e) => handleDrop(e, 'file')}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDraggingFiles ? 'border-indigo-500 bg-indigo-500/10' :
                      uploadedFileName ? 'border-emerald-500/40 bg-emerald-500/5' :
                      isDark ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <Paperclip className={`w-6 h-6 mx-auto mb-1 ${uploadedFileName ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <p className="text-2xs font-semibold">{uploadedFileName || 'Arraste os arquivos adicionais ou clique'}</p>
                    <p className="text-3xs text-slate-500 mt-0.5">Suporta planilhas, moldes ou CorelDraw</p>
                    <input
                      type="file"
                      onChange={(e) => handleFileSelectChange(e, 'file')}
                      className="hidden"
                      id="upload_file_field"
                    />
                    <label htmlFor="upload_file_field" className="block text-3xs text-indigo-400 underline mt-2 cursor-pointer">Procurar arquivo</label>
                  </div>
                </div>

              </div>

              {/* Section 5: Customized Checklist */}
              <div className="space-y-2 p-3 rounded-xl border bg-slate-950/20 border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-2xs text-slate-400 font-mono">4. Checklist de Controle de Qualidade</label>
                  <span className="text-4xs text-slate-500">Itens que serão validados ao longo da produção</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar novo item de validação..."
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    className={`flex-1 p-2 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {checklistItems.map((item, index) => (
                    <span 
                      key={index} 
                      className={`text-3xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1`}
                    >
                      <span>{item}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveChecklistItem(index)} 
                        className="text-red-400 font-bold ml-1 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Obs */}
              <div className="space-y-1">
                <label className="text-2xs text-slate-400 font-mono">Observações Gerais de Confecção</label>
                <textarea
                  placeholder="Instruções para costura, prensa ou embalagem..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border ${
                    isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Criar Ordem de Serviço
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DETAIL MODAL DIALOG */}
      {selectedOS && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-3xl p-6 rounded-2xl border text-sm shadow-2xl grid grid-cols-1 md:grid-cols-5 gap-6 max-h-[92vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Left Col: 3 parts details */}
            <div className="md:col-span-3 space-y-5 border-r border-slate-850 pr-0 md:pr-6">
              
              <div className="border-b border-slate-800/25 pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-4xs font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded font-bold">OS #{selectedOS.osNumber}</span>
                    <h3 className="font-display font-bold text-lg mt-1">{selectedOS.clientName}</h3>
                  </div>
                  <button onClick={() => setSelectedOS(null)} className="text-slate-500 hover:text-slate-300 md:hidden">✕</button>
                </div>
                <p className="text-2xs text-slate-500 font-mono mt-1">Data de Entrada: {selectedOS.entryDate} • Prazo: {selectedOS.deadline}</p>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  <span className="block text-slate-500 font-mono text-3xs uppercase tracking-wider">Produto Solicitado</span>
                  <span className="font-bold block mt-0.5">{selectedOS.product}</span>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  <span className="block text-slate-500 font-mono text-3xs uppercase tracking-wider">Quantidade e Valor</span>
                  <span className="font-bold block mt-0.5">{selectedOS.qty} un • <strong className="text-indigo-500 font-mono">R$ {selectedOS.value.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Dynamic Production flow line */}
              <div className="space-y-2">
                <p className="text-2xs font-mono text-indigo-400 uppercase tracking-widest">Pipeline de Produção Personalizado</p>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {selectedOS.flowStages.map((st, idx) => {
                    const isPassed = selectedOS.flowStages.indexOf(selectedOS.currentStage) >= idx;
                    const isCurrent = selectedOS.currentStage === st;
                    return (
                      <React.Fragment key={st}>
                        <div className={`px-2 py-0.8 rounded text-4xs font-mono font-bold border transition-all ${
                          isCurrent ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500 scale-105 shadow' :
                          isPassed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-slate-950 text-slate-600 border-slate-850'
                        }`}>
                          {getStageLabel(st).replace(' (Fila)', '')}
                        </div>
                        {idx < selectedOS.flowStages.length - 1 && (
                          <span className="text-slate-600 font-bold text-3xs">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* MODAL TABS NAVIGATION BAR */}
              <div className="flex gap-2 border-b border-slate-800/10 dark:border-white/5 pb-2">
                <button
                  type="button"
                  onClick={() => setModalTab('geral')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    modalTab === 'geral' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-400 hover:bg-slate-850 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Produção & Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('pagamento')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    modalTab === 'pagamento' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-400 hover:bg-slate-850 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pagamento
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('nf')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    modalTab === 'nf' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : isDark ? 'text-slate-400 hover:bg-slate-850 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Nota Fiscal
                </button>
              </div>

              {/* TABS CONTENT */}
              {modalTab === 'geral' && (
                <div className="space-y-5">
                  {/* Checklist verification */}
                  <div className="space-y-2.5">
                    <p className="text-2xs font-mono text-indigo-400 uppercase tracking-widest">Controle de Qualidade (Checklist)</p>
                    <div className="space-y-1.5">
                      {Object.entries(selectedOS.checklist).map(([key, checked]) => (
                        <label 
                          key={key} 
                          className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                            checked 
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                              : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateOSChecklistItem(selectedOS.id, key, e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span>{key}</span>
                          {checked && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Attachments / Files */}
                  <div className="space-y-2">
                    <p className="text-2xs font-mono text-indigo-400 uppercase tracking-widest">Arquivos, Modelos e Resultados</p>
                    
                    {(() => {
                      const getOSMockImage = (os: OS) => {
                        if (os.imageUrl) return os.imageUrl;
                        if (os.fileUrl && (os.fileUrl.startsWith('data:image/') || os.fileUrl.endsWith('.png') || os.fileUrl.endsWith('.jpg') || os.fileUrl.endsWith('.jpeg') || os.fileUrl.endsWith('.webp'))) {
                          return os.fileUrl;
                        }
                        const prodLower = os.product.toLowerCase();
                        const catLower = os.category.toLowerCase();
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

                      const modelImg = getOSMockImage(selectedOS);

                      return (
                        <div className="space-y-3">
                          {/* Sublimation Model detail preview box */}
                          <div className="relative rounded-xl overflow-hidden border border-slate-800/40 bg-slate-950/60 p-2 flex flex-col gap-2">
                            <p className="text-[10px] text-slate-500 font-mono">Resultado Visual Estimado (Modelo em arquivos):</p>
                            <div className="relative group max-h-48 overflow-hidden rounded-lg bg-slate-900/40 border border-slate-800/20 flex items-center justify-center">
                              <img 
                                src={modelImg} 
                                alt="Visualizador de Modelo" 
                                className="w-full h-auto max-h-48 object-contain hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <p className="text-4xs text-slate-500 text-center italic">Modelo digital calibrado para o setor de {getStageLabel(selectedOS.currentStage).split(' (')[0]}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-2xs font-mono">
                            {/* Layout card download */}
                            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              isDark ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="truncate pr-2">
                                <p className="font-semibold text-slate-300 truncate">ARTE_MODELO_FINAL.png</p>
                                <p className="text-slate-500 text-3xs">Resolução: 300 DPI</p>
                              </div>
                              <a 
                                href={modelImg} 
                                download={`OS_${selectedOS.osNumber}_arte_final`}
                                className="text-indigo-400 hover:underline font-bold shrink-0 cursor-pointer"
                              >
                                Baixar
                              </a>
                            </div>

                            {/* Extra Technical specs sheet layout card download */}
                            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              isDark ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className="truncate pr-2">
                                <p className="font-semibold text-slate-300 truncate">FICHA_TECNICA.xlsx</p>
                                <p className="text-slate-500 text-3xs">Gabari: Grade Oficial</p>
                              </div>
                              <a 
                                href={selectedOS.fileUrl || "#"} 
                                download={`OS_${selectedOS.osNumber}_ficha_tecnica`}
                                className="text-indigo-400 hover:underline font-bold shrink-0 cursor-pointer"
                              >
                                Baixar
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* History logs of transitions */}
                  <div className="space-y-2">
                    <p className="text-2xs font-mono text-indigo-400 uppercase tracking-widest">Registro de Trânsito de Setor</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-3xs text-slate-500 pr-1">
                      {selectedOS.history.map((hist, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-850/30">
                          <span>{getStageLabel(hist.stage)}</span>
                          <span>{hist.date} às {hist.time} por <strong>{hist.userName}</strong> {hist.durationMinutes ? `(Gasto: ${hist.durationMinutes}m)` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'pagamento' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Resumo Financeiro */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                      <h4 className="font-semibold text-xs font-mono text-indigo-400 uppercase tracking-wider">Resumo Financeiro</h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valor Inicial:</span>
                          <span className="font-mono font-semibold">R$ {(selectedOS.paymentInfo?.budgetVal ?? selectedOS.value).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-500">
                          <span>Descontos:</span>
                          <span className="font-mono font-semibold">- R$ {(selectedOS.paymentInfo?.discount ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-indigo-400">
                          <span>Acréscimos:</span>
                          <span className="font-mono font-semibold">+ R$ {(selectedOS.paymentInfo?.addition ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-indigo-400">
                          <span>Frete:</span>
                          <span className="font-mono font-semibold">+ R$ {(selectedOS.paymentInfo?.shipping ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-800/30 dark:border-slate-800 pt-1.5 flex justify-between font-bold text-sm">
                          <span>Valor Total:</span>
                          <span className="font-mono">R$ {(selectedOS.paymentInfo?.totalVal ?? selectedOS.value).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Valor Pago:</span>
                          <span className="font-mono">R$ {(selectedOS.paymentInfo?.paidVal ?? 0).toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between font-bold ${
                          (selectedOS.paymentInfo?.pendingVal ?? selectedOS.value) > 0 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          <span>Saldo Devedor:</span>
                          <span className="font-mono">R$ {(selectedOS.paymentInfo?.pendingVal ?? selectedOS.value).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-800/30 dark:border-slate-800">
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Métodos de Pagamento:</p>
                        {selectedOS.paymentInfo?.methods && selectedOS.paymentInfo.methods.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedOS.paymentInfo.methods.map((m, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-4xs font-mono font-bold border border-indigo-500/20">{m}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-3xs text-slate-500 italic">Nenhum pagamento registrado.</p>
                        )}
                        {selectedOS.paymentInfo?.receiptInfo && (
                          <p className="text-3xs text-slate-400 mt-1 font-mono">Obs: {selectedOS.paymentInfo.receiptInfo}</p>
                        )}
                      </div>
                    </div>

                    {/* Registro de Pagamento */}
                    <div className="space-y-3">
                      {activeUser?.role === 'admin' || activeUser?.role === 'atendimento' ? (
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2.5`}>
                          <h4 className="font-semibold text-xs font-mono text-indigo-400 uppercase tracking-wider">Registrar Pagamento</h4>
                          
                          <div className="space-y-1.5 text-xs">
                            <label className="block text-[10px] text-slate-500 font-mono">FORMA DE PAGAMENTO</label>
                            <select
                              value={paymentRegMethod}
                              onChange={(e) => setPaymentRegMethod(e.target.value as any)}
                              className={`w-full p-2 rounded-lg border text-xs outline-none ${
                                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                            >
                              <option value="PIX">PIX</option>
                              <option value="Dinheiro">Dinheiro</option>
                              <option value="Cartão">Cartão de Crédito/Débito</option>
                              <option value="Débito">Débito</option>
                              <option value="Transferência">Transferência Bancária</option>
                            </select>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="block text-[10px] text-slate-500 font-mono">VALOR DO LANÇAMENTO (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={String(selectedOS.paymentInfo?.pendingVal ?? selectedOS.value)}
                              value={paymentRegAmount}
                              onChange={(e) => setPaymentRegAmount(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs outline-none ${
                                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                            />
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <label className="block text-[10px] text-slate-500 font-mono">OBSERVAÇÕES DO RECEBIMENTO</label>
                            <input
                              type="text"
                              placeholder="Ex: Sinal 50%, Parcela 1/2, etc."
                              value={receiptInput}
                              onChange={(e) => setReceiptInput(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs outline-none ${
                                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                              }`}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const amt = parseFloat(paymentRegAmount || String(selectedOS.paymentInfo?.pendingVal ?? selectedOS.value));
                              if (isNaN(amt) || amt <= 0) {
                                alert('Informe um valor de pagamento válido.');
                                return;
                              }
                              if (updateOSPaymentInfo) {
                                const currentPaid = selectedOS.paymentInfo?.paidVal ?? 0;
                                const newPaid = currentPaid + amt;
                                const methods = [...(selectedOS.paymentInfo?.methods ?? [])];
                                if (!methods.includes(paymentRegMethod)) {
                                  methods.push(paymentRegMethod);
                                }
                                updateOSPaymentInfo(selectedOS.id, {
                                  paidVal: newPaid,
                                  methods,
                                  receiptInfo: receiptInput || undefined
                                });
                                // Re-fetch selected OS to display live update:
                                const updatedOS = osList.find(o => o.id === selectedOS.id);
                                if (updatedOS) {
                                  setSelectedOS({
                                    ...updatedOS,
                                    paymentInfo: {
                                      ...(updatedOS.paymentInfo || selectedOS.paymentInfo || {}),
                                      paidVal: newPaid,
                                      methods,
                                      receiptInfo: receiptInput || undefined
                                    }
                                  } as any);
                                }
                                setPaymentRegAmount('');
                                setReceiptInput('');
                                alert('Pagamento registrado com sucesso!');
                              }
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                          >
                            Confirmar Recebimento
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-mono">
                          ⚠️ Apenas colaboradores da Administração ou Atendimento podem registrar pagamentos nesta ordem de serviço.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SE FOR ADMIN - ALTERAÇÃO DE VALORES */}
                  {activeUser?.role === 'admin' && (
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                      <h4 className="font-semibold text-xs font-mono text-indigo-400 uppercase tracking-wider">Ajuste de Valores (Administrador)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-4xs text-slate-500 font-mono">ORÇAMENTO BASE</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editBudget}
                            onChange={(e) => setEditBudget(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs outline-none ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-4xs text-slate-500 font-mono">DESCONTO (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editDiscount}
                            onChange={(e) => setEditDiscount(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs outline-none ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-4xs text-slate-500 font-mono">ACRÉSCIMO (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editAddition}
                            onChange={(e) => setEditAddition(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs outline-none ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-4xs text-slate-500 font-mono">FRETE (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editShipping}
                            onChange={(e) => setEditShipping(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs outline-none ${
                              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const bud = parseFloat(editBudget || '0');
                          const disc = parseFloat(editDiscount || '0');
                          const add = parseFloat(editAddition || '0');
                          const sh = parseFloat(editShipping || '0');
                          if (updateOSPaymentInfo) {
                            updateOSPaymentInfo(selectedOS.id, {
                              budgetVal: bud,
                              discount: disc,
                              addition: add,
                              shipping: sh
                            });
                            // Refresh selected OS to show live changes:
                            setSelectedOS(prev => {
                              if (!prev) return prev;
                              const tot = bud - disc + add + sh;
                              const pending = Math.max(0, tot - (prev.paymentInfo?.paidVal ?? 0));
                              return {
                                ...prev,
                                paymentInfo: {
                                  ...(prev.paymentInfo || {}),
                                  budgetVal: bud,
                                  discount: disc,
                                  addition: add,
                                  shipping: sh,
                                  totalVal: tot,
                                  pendingVal: pending,
                                  paymentStatus: (prev.paymentInfo?.paidVal ?? 0) >= tot ? 'Pago' : (prev.paymentInfo?.paidVal ?? 0) > 0 ? 'Pagamento Parcial' : 'Aguardando Pagamento'
                                }
                              };
                            });
                            alert('Valores e totalizadores atualizados com sucesso!');
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow"
                      >
                        Salvar Alterações de Valores
                      </button>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'nf' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-xs font-mono text-indigo-400 uppercase tracking-wider">Informações da Nota Fiscal</h4>
                      {selectedOS.invoiceInfo?.situation === 'Emitida' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-4xs font-mono font-bold border border-emerald-500/20 rounded uppercase">Emitida</span>
                      ) : selectedOS.invoiceInfo?.situation === 'Cancelada' ? (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-4xs font-mono font-bold border border-red-500/20 rounded uppercase">Cancelada</span>
                      ) : selectedOS.invoiceInfo?.situation === 'Rejeitada' ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-4xs font-mono font-bold border border-amber-500/20 rounded uppercase">Rejeitada</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 text-4xs font-mono font-bold border border-slate-500/20 rounded uppercase font-semibold">Pendente</span>
                      )}
                    </div>

                    {selectedOS.invoiceInfo?.situation === 'Emitida' ? (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-[10px]">Número da Nota:</span>
                          <span className="font-bold font-mono text-slate-300">{selectedOS.invoiceInfo.invoiceNumber}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-[10px]">Série / Modelo:</span>
                          <span className="font-bold font-mono text-slate-300">{selectedOS.invoiceInfo.series || '1'} / NF-e</span>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <span className="text-slate-500 block text-[10px]">Chave de Acesso:</span>
                          <span className="font-bold font-mono text-[10px] text-slate-300 break-all bg-slate-900/60 p-2.5 rounded border border-slate-800/50 select-all leading-relaxed block">{selectedOS.invoiceInfo.accessKey}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-[10px]">Data de Emissão:</span>
                          <span className="font-bold font-mono text-slate-300">{selectedOS.invoiceInfo.issueDate}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FileText className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
                        <p className="text-xs text-slate-400">Nenhuma nota fiscal foi emitida para este pedido ainda.</p>
                        {selectedOS.paymentInfo?.paymentStatus !== 'Pago' && (
                          <p className="text-[10px] text-amber-500 mt-1 uppercase tracking-wider font-semibold">⚠️ Pagamento parcial ou pendente</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AÇÕES DE EMISSÃO */}
                  {selectedOS.invoiceInfo?.situation !== 'Emitida' ? (
                    <div className="flex gap-2">
                      {activeUser?.role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (updateOSInvoiceInfo) {
                              const randomNum = String(Math.floor(100000 + Math.random() * 900000));
                              const randomKey = '352607' + String(Date.now()).slice(0, 10) + '1234567890123455001000' + randomNum + '1001234567';
                              const today = new Date().toLocaleDateString('pt-BR');
                              
                              updateOSInvoiceInfo(selectedOS.id, {
                                invoiceNumber: `NF-${randomNum}`,
                                series: '1',
                                accessKey: randomKey,
                                issueDate: today,
                                docType: 'NF-e',
                                situation: 'Emitida'
                              });
                              
                              setSelectedOS(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  status: 'Faturado',
                                  invoiceInfo: {
                                    invoiceNumber: `NF-${randomNum}`,
                                    series: '1',
                                    accessKey: randomKey,
                                    issueDate: today,
                                    docType: 'NF-e',
                                    situation: 'Emitida'
                                  }
                                };
                              });
                              
                              alert('Nota Fiscal emitida e autorizada com sucesso na SEFAZ! O status da OS foi atualizado para Faturado.');
                            }
                          }}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer text-center"
                        >
                          Emitir Nota Fiscal Eletrônica (NF-e)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (updateOSInvoiceInfo) {
                              updateOSInvoiceInfo(selectedOS.id, { situation: 'Pendente' });
                              alert('Solicitação de emissão de Nota Fiscal enviada ao Administrador com sucesso!');
                            }
                          }}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer text-center"
                        >
                          Solicitar Emissão de Nota Fiscal
                        </button>
                      )}
                    </div>
                  ) : (
                    /* NOTA EMITIDA - COMPARTILHAMENTO & IMPRESSÃO & CANCELAMENTO */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDanfe(selectedOS);
                          }}
                          className={`py-2 px-3 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-400 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer`}
                        >
                          <Printer className="w-4 h-4" />
                          <span>Visualizar DANFE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert('XML da Nota Fiscal carregado e baixado no navegador (Simulado).');
                          }}
                          className={`py-2 px-3 border border-slate-800 hover:bg-slate-850 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-slate-300`}
                        >
                          <Download className="w-4 h-4" />
                          <span>Baixar XML</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert('DANFE em PDF enviado com sucesso para o e-mail cadastrado do cliente!');
                          }}
                          className={`py-2 px-3 border border-slate-800 hover:bg-slate-850 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-slate-300`}
                        >
                          <Send className="w-4 h-4" />
                          <span>Enviar por E-mail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert('Link de download do DANFE enviado via WhatsApp para o cliente!');
                          }}
                          className={`py-2 px-3 border border-slate-800 hover:bg-slate-850 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-slate-300`}
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Enviar por WhatsApp</span>
                        </button>
                      </div>

                      {/* ADMIN EXCLUSIVES: CANCELAMENTO & CARTA DE CORREÇÃO */}
                      {activeUser?.role === 'admin' && (
                        <div className="space-y-3 pt-3 border-t border-slate-800/30 dark:border-slate-800">
                          <h5 className="font-bold text-[10px] font-mono text-red-400 uppercase tracking-wider">Ações Administrativas Fiscais</h5>
                          
                          {/* Carta de Correção */}
                          <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-250'} space-y-2`}>
                            <label className="text-[10px] text-slate-400 font-mono block">CARTA DE CORREÇÃO ELETRÔNICA (CC-e)</label>
                            <textarea
                              rows={2}
                              placeholder="Informe as correções da Nota Fiscal (ex: correção do endereço, observações)..."
                              value={manualCorrection}
                              onChange={(e) => setManualCorrection(e.target.value)}
                              className={`w-full p-2 rounded text-xs outline-none ${
                                isDark ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-slate-200'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!manualCorrection.trim()) {
                                  alert('Por favor, descreva as correções para emitir a CC-e.');
                                  return;
                                  }
                                alert('Carta de Correção Eletrônica (CC-e) transmitida e autorizada com sucesso na SEFAZ!');
                                setManualCorrection('');
                              }}
                              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-3xs cursor-pointer"
                            >
                              Transmitir CC-e
                            </button>
                          </div>

                          {/* Cancelamento */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja solicitar o CANCELAMENTO desta Nota Fiscal na SEFAZ? Esta operação é irreversível.')) {
                                if (updateOSInvoiceInfo) {
                                  updateOSInvoiceInfo(selectedOS.id, { situation: 'Cancelada' });
                                  setSelectedOS(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      invoiceInfo: {
                                        ...(prev.invoiceInfo || {}),
                                        situation: 'Cancelada'
                                      }
                                    };
                                  });
                                  alert('Nota Fiscal cancelada com sucesso junto à SEFAZ!');
                                }
                              }
                            }}
                            className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold cursor-pointer transition-all text-center"
                          >
                            Cancelar Nota Fiscal na SEFAZ
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Col: OS Chat and action Controls */}
            <div className="md:col-span-2 flex flex-col justify-between gap-4 h-full min-h-[400px]">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/20">
                <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-xs uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Interno da OS</span>
                </div>
                <button onClick={() => setSelectedOS(null)} className="hidden md:block text-slate-500 hover:text-slate-300">✕</button>
              </div>

              {/* Message List */}
              <div className={`flex-1 overflow-y-auto p-3 rounded-xl border space-y-3 min-h-[250px] max-h-[350px] ${
                isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-200'
              }`}>
                {selectedOS.chat.length === 0 ? (
                  <p className="text-2xs text-slate-500 italic text-center py-12">Nenhuma mensagem registrada nesta OS. Use o campo abaixo para orientar os colaboradores.</p>
                ) : (
                  selectedOS.chat.map(msg => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex justify-between items-center text-3xs font-mono">
                        <strong className="text-indigo-400">{msg.senderName} ({msg.senderRole.toUpperCase()})</strong>
                        <span className="text-slate-600">{msg.timestamp}</span>
                      </div>
                      <p className={`p-2 rounded-lg text-2xs leading-relaxed ${
                        isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700 shadow-3xs'
                      }`}>{msg.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Send input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enviar orientação setorial..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage(selectedOS.id)}
                  className={`flex-1 p-2 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                <button
                  onClick={() => handleSendChatMessage(selectedOS.id)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Action area: advance stage */}
              {selectedOS.currentStage !== 'concluido' && (
                <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2 text-xs pt-4">
                  <p className="font-semibold text-center">
                    {checkHasPermission(selectedOS.currentStage) ? 'Avançar este pedido?' : 'Acesso Restrito'}
                  </p>
                  <button
                    onClick={() => {
                      advanceOSStage(selectedOS.id);
                      if (checkHasPermission(selectedOS.currentStage)) {
                        setSelectedOS(null);
                      }
                    }}
                    className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all ${
                      checkHasPermission(selectedOS.currentStage)
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                    title={checkHasPermission(selectedOS.currentStage) ? 'Avançar pedido de setor' : 'Apenas o setor responsável pode avançar'}
                  >
                    <span>Concluir e Enviar Próxima Etapa</span>
                    {checkHasPermission(selectedOS.currentStage) ? (
                      <ArrowRight className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* DETAILED INTERACTIVE DANFE SEFAZ DIALOG */}
      {showDanfe && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-55 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-white text-slate-900 dark:text-slate-900 rounded-xl p-6 shadow-2xl border border-slate-300 dark:border-slate-300 max-h-[96vh] overflow-y-auto flex flex-col justify-between" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
            <div>
              {/* DANFE Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-300 mb-4" style={{ borderColor: '#cbd5e1' }}>
                <div>
                  <h3 className="text-sm font-bold font-mono tracking-wider text-indigo-700 dark:text-indigo-700" style={{ color: '#4338ca' }}>PORTAL MOCK SEFAZ • REPRODUÇÃO OFICIAL</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono" style={{ color: '#64748b' }}>DANFE - DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const client = clients.find(c => c.id === showDanfe.clientId);
                      setEmailRecipient(client?.email || 'cliente@contato.com.br');
                      setEmailSubject(`Nota Fiscal de Serviços Eletrônica (NF-e) - OS #${showDanfe.osNumber}`);
                      setEmailBody(`Prezado(a) ${showDanfe.clientName},\n\nSegue em anexo o Documento Auxiliar da Nota Fiscal Eletrônica (DANFE) correspondente à Ordem de Serviço #${showDanfe.osNumber}.\n\nProduto: ${showDanfe.product}\nQuantidade: ${showDanfe.qty}\nValor Total: R$ ${(showDanfe.paymentInfo?.totalVal ?? showDanfe.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\nAgradecemos a preferência!\n\nAtenciosamente,\nSublimação ABC LTDA`);
                      setEmailSuccess(false);
                      setShowEmailModal(true);
                    }} 
                    className="px-3 py-1 bg-emerald-600 dark:bg-emerald-600 text-white dark:text-white hover:bg-emerald-700 dark:hover:bg-emerald-700 text-3xs font-semibold rounded border border-emerald-700 dark:border-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Enviar por E-mail</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      window.print();
                    }} 
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-200 text-slate-700 dark:text-slate-700 text-3xs font-semibold rounded border border-slate-300 dark:border-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Imprimir</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowDanfe(null)} 
                    className="px-3 py-1 bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 text-white dark:text-white text-3xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fechar DANFE</span>
                  </button>
                </div>
              </div>

              {/* Printable DANFE Structure */}
              <div id="danfe-print-area" className="border-2 border-black p-4 rounded text-[11px] font-sans bg-white dark:bg-white text-black dark:text-black space-y-4 shadow-sm select-text" style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#000000' }}>
                {/* Block 1: Emitente & DANFE details & Barcode */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-b border-black pb-3">
                  <div className="md:col-span-5 border-r border-black pr-2 space-y-1 text-left">
                    <p className="font-extrabold text-sm uppercase text-black">SUBLIMAÇÃO ABC LTDA</p>
                    <p className="text-[9px] leading-relaxed text-black">
                      Rua dos Sublimadores, 440 - Distrito Industrial - Americana/SP<br />
                      CEP: 13478-000 - Fone: (19) 3465-1000<br />
                      contato@sublimacaoabc.com.br
                    </p>
                  </div>
                  <div className="md:col-span-3 border-r border-black px-2 text-center flex flex-col justify-center items-center">
                    <p className="font-extrabold text-xs text-black">DANFE</p>
                    <p className="text-[9px] text-black leading-tight">Documento Auxiliar da<br />Nota Fiscal Eletrônica</p>
                    <p className="font-bold text-[9px] mt-1 leading-tight text-black">0 - ENTRADA<br />1 - SAÍDA</p>
                    <div className="border border-black px-2 py-0.5 mt-1 font-bold text-black">1</div>
                    <p className="font-mono text-[9px] font-bold mt-2 text-black">Nº: {showDanfe.invoiceInfo?.invoiceNumber?.replace('NF-', '') || '000.123'}<br />SÉRIE: 1 • FL 1/1</p>
                  </div>
                  <div className="md:col-span-4 pl-2 space-y-1 text-left">
                    <p className="text-[8px] uppercase text-black font-extrabold">CHAVE DE ACESSO</p>
                    <p className="font-mono text-[9px] font-bold break-all bg-white p-1 rounded border border-black select-all text-black">{showDanfe.invoiceInfo?.accessKey}</p>
                    
                    {/* Simulated Barcode */}
                    <div className="flex flex-col items-center pt-2">
                      <div className="font-mono text-[9px] tracking-[2px] font-bold select-none h-6 bg-black text-white w-full flex items-center justify-center rounded">
                        ||||| | |||| ||| | ||||| | ||| || |||
                      </div>
                      <p className="text-[7px] text-black mt-0.5">Consulta de autenticidade no portal nacional da NF-e</p>
                    </div>
                  </div>
                </div>

                {/* Block 2: Natureza da Operação */}
                <div className="grid grid-cols-3 gap-4 border-b border-black pb-2 text-[10px] text-left text-black">
                  <div>
                    <span className="block text-[8px] uppercase text-black font-extrabold">NATUREZA DA OPERAÇÃO</span>
                    <span className="font-bold text-black">Prestação de Serviço de Sublimação</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-black font-extrabold">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
                    <span className="font-mono font-bold text-black">135260029381928 - {showDanfe.invoiceInfo?.issueDate} às 14:32</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-black font-extrabold">CNPJ / INSCRIÇÃO ESTADUAL</span>
                    <span className="font-mono font-bold text-black">12.345.678/0001-90 • IE: 111.222.333.444</span>
                  </div>
                </div>

                {/* Block 3: Destinatário */}
                <div className="border-b border-black pb-3 text-left">
                  <p className="font-extrabold uppercase text-[10px] mb-1.5 text-black">DESTINATÁRIO / REMETENTE</p>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-[10px] text-black">
                    <div className="md:col-span-6">
                      <span className="block text-[8px] uppercase text-black font-semibold">NOME / RAZÃO SOCIAL</span>
                      <span className="font-extrabold text-black">{showDanfe.clientName}</span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="block text-[8px] uppercase text-black font-semibold">CPF / CNPJ</span>
                      <span className="font-bold font-mono text-black">000.111.222-33</span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="block text-[8px] uppercase text-black font-semibold">DATA DA EMISSÃO</span>
                      <span className="font-bold font-mono text-black">{showDanfe.invoiceInfo?.issueDate}</span>
                    </div>

                    <div className="md:col-span-6">
                      <span className="block text-[8px] uppercase text-black font-semibold">ENDEREÇO</span>
                      <span className="font-bold text-black">Av. das Américas, 1500 - Bloco 2, Rio de Janeiro/RJ</span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="block text-[8px] uppercase text-black font-semibold">BAIRRO / CEP</span>
                      <span className="font-bold font-mono text-black">Barra da Tijuca • 22640-100</span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="block text-[8px] uppercase text-black font-semibold">FONE / WHATSAPP</span>
                      <span className="font-bold font-mono text-black">(21) 98765-4321</span>
                    </div>
                  </div>
                </div>

                {/* Block 4: Cálculo do Imposto */}
                <div className="border-b border-black pb-3 text-left">
                  <p className="font-extrabold uppercase text-[10px] mb-1.5 text-black">CÁLCULO DO IMPOSTO</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[9px] text-black">
                    <div className="border border-black p-1 bg-white">
                      <span className="block text-black uppercase text-[7px] font-semibold">BASE CÁLC. ICMS</span>
                      <span className="font-mono font-bold text-black">R$ 0,00</span>
                    </div>
                    <div className="border border-black p-1 bg-white">
                      <span className="block text-black uppercase text-[7px] font-semibold">VALOR DO ICMS</span>
                      <span className="font-mono font-bold text-black">R$ 0,00</span>
                    </div>
                    <div className="border border-black p-1 bg-white">
                      <span className="block text-black uppercase text-[7px] font-semibold">BASE DE CÁLCULO ISS</span>
                      <span className="font-mono font-bold text-black">R$ {(showDanfe.paymentInfo?.totalVal ?? showDanfe.value).toFixed(2)}</span>
                    </div>
                    <div className="border border-black p-1 bg-white">
                      <span className="block text-black uppercase text-[7px] font-semibold">VALOR DO ISSQN (2%)</span>
                      <span className="font-mono font-bold text-black">R$ {((showDanfe.paymentInfo?.totalVal ?? showDanfe.value) * 0.02).toFixed(2)}</span>
                    </div>
                    <div className="border border-black p-1 bg-white font-bold col-span-2 sm:col-span-1 text-black">
                      <span className="block text-black uppercase font-semibold text-[7px]">VALOR TOTAL NOTA</span>
                      <span className="font-mono text-black">R$ {(showDanfe.paymentInfo?.totalVal ?? showDanfe.value).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Block 5: Dados do Produto */}
                <div className="text-left">
                  <p className="font-extrabold uppercase text-[10px] mb-1.5 text-black">DADOS DOS PRODUTOS / SERVIÇOS</p>
                  <table className="w-full text-[10px] border border-black text-left border-collapse text-black">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-black font-bold text-[8px] text-black">
                        <th className="p-1 border-r border-black">CÓD. PROD.</th>
                        <th className="p-1 border-r border-black">DESCRIÇÃO DOS PRODUTOS / SERVIÇOS</th>
                        <th className="p-1 border-r border-black text-center">NCM</th>
                        <th className="p-1 border-r border-black text-center">CFOP</th>
                        <th className="p-1 border-r border-black text-center">UNID</th>
                        <th className="p-1 border-r border-black text-right">QTD</th>
                        <th className="p-1 border-r border-black text-right">VL. UNIT.</th>
                        <th className="p-1 text-right">VL. TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black text-[10px] text-black">
                        <td className="p-1 border-r border-black font-mono">SUB-092</td>
                        <td className="p-1 border-r border-black font-bold">{showDanfe.product}</td>
                        <td className="p-1 border-r border-black text-center font-mono">5905.00.00</td>
                        <td className="p-1 border-r border-black text-center font-mono font-bold">5.933</td>
                        <td className="p-1 border-r border-black text-center font-semibold">UNID</td>
                        <td className="p-1 border-r border-black text-right font-mono">{showDanfe.qty}</td>
                        <td className="p-1 border-r border-black text-right font-mono">R$ {((showDanfe.paymentInfo?.budgetVal ?? showDanfe.value) / showDanfe.qty).toFixed(2)}</td>
                        <td className="p-1 text-right font-mono font-bold">R$ {(showDanfe.paymentInfo?.budgetVal ?? showDanfe.value).toFixed(2)}</td>
                      </tr>
                      {/* Shipping and other fees row if added */}
                      {((showDanfe.paymentInfo?.addition ?? 0) > 0 || (showDanfe.paymentInfo?.shipping ?? 0) > 0) && (
                        <tr className="border-b border-black text-[10px] italic text-black">
                          <td className="p-1 border-r border-black font-mono">-</td>
                          <td className="p-1 border-r border-black">Acréscimos Setoriais / Frete Adicional de Entrega</td>
                          <td className="p-1 border-r border-black text-center font-mono">-</td>
                          <td className="p-1 border-r border-black text-center font-mono">-</td>
                          <td className="p-1 border-r border-black text-center">-</td>
                          <td className="p-1 border-r border-black text-right font-mono">1</td>
                          <td className="p-1 border-r border-black text-right font-mono">R$ {((showDanfe.paymentInfo?.addition ?? 0) + (showDanfe.paymentInfo?.shipping ?? 0)).toFixed(2)}</td>
                          <td className="p-1 text-right font-mono font-bold">R$ {((showDanfe.paymentInfo?.addition ?? 0) + (showDanfe.paymentInfo?.shipping ?? 0)).toFixed(2)}</td>
                        </tr>
                      )}
                      {/* Discount row if present */}
                      {(showDanfe.paymentInfo?.discount ?? 0) > 0 && (
                        <tr className="border-b border-black text-[10px] italic text-black font-semibold">
                          <td className="p-1 border-r border-black font-mono">-</td>
                          <td className="p-1 border-r border-black font-bold">Desconto Comercial Concedido</td>
                          <td className="p-1 border-r border-black text-center font-mono">-</td>
                          <td className="p-1 border-r border-black text-center font-mono">-</td>
                          <td className="p-1 border-r border-black text-center">-</td>
                          <td className="p-1 border-r border-black text-right font-mono">1</td>
                          <td className="p-1 border-r border-black text-right font-mono">- R$ {(showDanfe.paymentInfo?.discount ?? 0).toFixed(2)}</td>
                          <td className="p-1 text-right font-mono font-bold">- R$ {(showDanfe.paymentInfo?.discount ?? 0).toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Block 6: Dados Adicionais */}
                <div className="border border-black p-2 text-[10px] space-y-1 text-left text-black">
                  <p className="font-extrabold text-black uppercase text-[8px]">DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES</p>
                  <p className="text-[9px] leading-relaxed font-mono text-black">
                    Tributos Federais aproximados (Lei 12.741/2012): R$ {((showDanfe.paymentInfo?.totalVal ?? showDanfe.value) * 0.1345).toFixed(2)} (13.45%)<br />
                    OS Referência: #{showDanfe.osNumber} • Entregue via transportadora autorizada.<br />
                    Operação beneficiária do regime Simples Nacional conforme Lei Complementar 123/2006.<br />
                    {showDanfe.paymentInfo?.receiptInfo && `Lançamento: ${showDanfe.paymentInfo.receiptInfo}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setShowDanfe(null)} 
                className="py-1.5 px-4 bg-slate-800 hover:bg-slate-750 text-white rounded font-bold text-xs cursor-pointer shadow"
              >
                Fechar Visualizador DANFE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND NF EMAIL MODAL */}
      {showEmailModal && showDanfe && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-white text-slate-900 dark:text-slate-900 rounded-xl p-5 shadow-2xl border border-slate-300" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold font-display text-slate-900" style={{ color: '#0f172a' }}>Enviar NF por E-mail</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {emailSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800" style={{ color: '#1e293b' }}>E-mail enviado com sucesso!</h4>
                <p className="text-xs text-slate-500" style={{ color: '#64748b' }}>
                  A Nota Fiscal da OS <strong>#{showDanfe.osNumber}</strong> foi enviada com sucesso para <strong>{emailRecipient}</strong>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailModal(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs w-full cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setEmailSending(true);
                // Simulate sending email
                setTimeout(() => {
                  setEmailSending(false);
                  setEmailSuccess(true);
                  
                  // Record email in OS chat timeline!
                  addOSChatMessage(showDanfe.id, `✉️ Nota Fiscal enviada via e-mail para ${emailRecipient} por ${activeUser?.name || 'Sistema'}.`);
                }, 1500);
              }} className="space-y-4">
                <div>
                  <label className="block text-3xs font-mono uppercase tracking-wider text-slate-500 mb-1" style={{ color: '#64748b' }}>Destinatário (E-mail)</label>
                  <input
                    type="email"
                    required
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
                    placeholder="cliente@contato.com.br"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-mono uppercase tracking-wider text-slate-500 mb-1" style={{ color: '#64748b' }}>Assunto</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
                  />
                </div>

                <div>
                  <label className="block text-3xs font-mono uppercase tracking-wider text-slate-500 mb-1" style={{ color: '#64748b' }}>Mensagem</label>
                  <textarea
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
                  />
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-2xs text-slate-500" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Anexo automático: <strong>DANFE_NF_{showDanfe.invoiceInfo?.invoiceNumber || '123'}.pdf</strong></span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold text-xs cursor-pointer"
                    style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                    disabled={emailSending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-55"
                  >
                    {emailSending ? 'Enviando...' : 'Enviar E-mail'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RECONHECER PAGAMENTO DA OS MODAL */}
      {selectedPaymentOS && (() => {
        const os = selectedPaymentOS;
        const total = os.paymentInfo?.totalVal ?? os.value;

        const handlePrintInvoice = () => {
          const invoiceNumber = '000.' + Math.floor(Math.random() * 900 + 100);
          const series = '1';
          const accessKey = '352607' + Array.from({length:38}, ()=>Math.floor(Math.random()*10)).join('');
          const issueDate = new Date().toISOString().split('T')[0];
          
          if (updateOSInvoiceInfo) {
            updateOSInvoiceInfo(os.id, {
              situation: 'Emitida',
              invoiceNumber,
              series,
              accessKey,
              issueDate,
              docType: 'NF-e'
            });
          }
          
          const updatedOS = {
            ...os,
            paymentInfo: {
              ...os.paymentInfo,
              paymentStatus: 'Pago' as const,
              paidVal: total,
              pendingVal: 0,
              methods: [osPayMethod],
              installments: osPayMethod === 'Cartão de Crédito' ? paymentInstallments : 1
            },
            invoiceInfo: {
              situation: 'Emitida' as const,
              invoiceNumber,
              series,
              accessKey,
              issueDate,
              docType: 'NF-e' as const
            }
          };
          
          setShowDanfe(updatedOS);
          setSelectedPaymentOS(null);
        };

        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className={`w-full max-w-md p-6 rounded-2xl border text-sm shadow-2xl space-y-5 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800/10 pb-3">
                <div>
                  <h3 className="text-base font-display font-bold tracking-tight">
                    {paymentSuccess || os.paymentInfo?.paymentStatus === 'Pago' ? 'Recibo de Pagamento' : 'Reconhecer Pagamento'}
                  </h3>
                  <p className="text-3xs text-slate-400 font-mono uppercase tracking-wider">
                    {paymentSuccess || os.paymentInfo?.paymentStatus === 'Pago' ? 'Terminal de Vendas • Sucesso' : 'Terminal de Vendas • Caixa Registradora'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentOS(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800/10 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <span className="text-xs font-mono">Fechar [X]</span>
                </button>
              </div>

              {paymentSuccess || os.paymentInfo?.paymentStatus === 'Pago' ? (
                /* SUCCESS & PRINT VIEW */
                <div className="space-y-4 py-2">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 text-2xl font-bold animate-bounce">
                      ✓
                    </div>
                    <h4 className="font-display font-bold text-emerald-500 text-sm tracking-wide uppercase">
                      Pagamento Confirmado!
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Ordem de Serviço #{os.osNumber} está com o pagamento quitado no sistema.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl text-xs space-y-2.5 border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Caixa Operador:</span>
                      <strong className="text-right">{os.paymentInfo?.receiptInfo || paymentOperator || 'Atendimento'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valor Pago:</span>
                      <strong className="font-mono text-emerald-500 font-bold">R$ {total.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Forma de Pagamento:</span>
                      <strong className="text-right">
                        {os.paymentInfo?.methods?.[0] || osPayMethod} {os.paymentInfo?.installments && os.paymentInfo.installments > 1 && `(${os.paymentInfo.installments}x)`}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Situação:</span>
                      <strong className="text-right text-emerald-500 font-bold uppercase">Pago</strong>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs text-white text-center flex items-center justify-center gap-2 cursor-pointer shadow transition-all ${
                        isDark ? 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/10' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/10'
                      }`}
                    >
                      <span>⎙ Imprimir Nota Fiscal (DANFE)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentOS(null)}
                      className={`w-full py-2 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-colors ${
                        isDark ? 'border-white/5 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : (
                /* MAIN PAYMENT FORM */
                <div className="space-y-4">
                  {/* Caixa Status Header */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold">CAIXA ABERTO</span>
                    </div>
                    <span className="text-slate-400">Terminal #01</span>
                  </div>

                  {/* Details Card */}
                  <div className={`p-4 rounded-xl space-y-2 border ${
                    isDark ? 'bg-[#151518] border-white/5' : 'bg-slate-50 border-slate-150'
                  }`}>
                    <div className="flex justify-between items-center text-xs font-mono text-indigo-400">
                      <span className="font-semibold uppercase">Ordem de Serviço #{os.osNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        os.paymentInfo?.paymentStatus === 'Pago' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {os.paymentInfo?.paymentStatus || 'Aguardando Pagamento'}
                      </span>
                    </div>

                    <div className="border-t border-slate-800/5 my-1 pt-1 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cliente:</span>
                        <strong className="text-right">{os.clientName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Produto/Serviço:</span>
                        <span className="text-right">{os.product}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Quantidade:</span>
                        <strong className="font-mono">{os.qty} un</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-800/5 pt-1.5">
                        <span className="text-slate-500 font-semibold">Valor do Orçamento:</span>
                        <strong className={`font-mono text-base ${isDark ? 'text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' : 'text-indigo-600'}`}>
                          R$ {total.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Operator Selection */}
                  <div className="space-y-1.5">
                    <label className="text-3xs font-mono text-slate-500 uppercase tracking-widest block">Operador do Caixa</label>
                    <select
                      value={paymentOperator}
                      onChange={(e) => setPaymentOperator(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                      }`}
                    >
                      {users.filter(u => u.role === 'admin' || u.role === 'atendimento').map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Form: Choose Payment Method */}
                  <div className="space-y-2">
                    <label className="text-3xs font-mono text-slate-500 uppercase tracking-widest block">Escolha a Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['PIX', 'Cartão de Crédito', 'Débito', 'Dinheiro'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setOsPayMethod(method);
                            if (method !== 'Cartão de Crédito') {
                              setPaymentInstallments(1);
                            }
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            osPayMethod === method
                              ? (isDark ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]' : 'bg-indigo-50 border-indigo-500 text-indigo-600')
                              : (isDark ? 'bg-slate-900 border-white/5 hover:bg-white/5 text-slate-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600')
                          }`}
                        >
                          <span>{method}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            osPayMethod === method ? (isDark ? 'border-cyan-400' : 'border-indigo-500') : 'border-slate-600'
                          }`}>
                            {osPayMethod === method && <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-indigo-600'}`} />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Installments Options for Credit Card */}
                  {osPayMethod === 'Cartão de Crédito' && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-3xs font-mono text-slate-500 uppercase tracking-widest block">Opções de Parcelamento</label>
                      <select
                        value={paymentInstallments}
                        onChange={(e) => setPaymentInstallments(Number(e.target.value))}
                        className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                        }`}
                      >
                        {[1, 2, 3, 4, 5, 6, 10, 12].map(inst => (
                          <option key={inst} value={inst}>
                            {inst}x de R$ {(total / inst).toFixed(2)} (Sem Juros)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentOS(null)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isDark ? 'border-white/5 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (updateOSPaymentInfo) {
                          updateOSPaymentInfo(os.id, {
                            paymentStatus: 'Pago',
                            paidVal: total,
                            pendingVal: 0,
                            methods: [osPayMethod],
                            installments: osPayMethod === 'Cartão de Crédito' ? paymentInstallments : 1
                          });
                        }
                        if (addTransaction) {
                          addTransaction({
                            type: 'entrada',
                            description: `Pagamento integral OS #${os.osNumber} - ${os.clientName}`,
                            amount: total,
                            category: 'Pedidos',
                            status: 'Pago',
                            vendedor: os.vendedor || paymentOperator || activeUser?.name || 'Atendimento'
                          });
                        }
                        addOSChatMessage(os.id, `Simulação de Pagamento: Total de R$ ${total.toFixed(2)} recebido via ${osPayMethod}${osPayMethod === 'Cartão de Crédito' ? ` (${paymentInstallments}x)` : ''} e reconhecido no caixa por ${paymentOperator}.`);
                        setPaymentSuccess(true);
                      }}
                      className={`flex-1 py-2 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-cyan-500/15 transition-all cursor-pointer ${
                        isDark ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      Confirmar Pagamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
}
