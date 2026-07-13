import { useState, useEffect } from 'react';
import { 
  User, Client, OS, FinancialRecord, Product, Category, RawMaterial, Supplier, 
  LogEntry, AppNotification, ChatMessage, ChatInternalMessage, ProductionStage, OSStatus, OSPriority, UserRole,
  OSPaymentInfo, OSInvoiceInfo
} from './types';
import { 
  DEFAULT_USERS, INITIAL_CLIENTS, INITIAL_PRODUCTS, INITIAL_CATEGORIES, 
  INITIAL_RAWMATERIALS, INITIAL_SUPPLIERS, INITIAL_OS_LIST, INITIAL_FINANCES, 
  INITIAL_CHAT_INTERNAL, INITIAL_LOGS, INITIAL_NOTIFICATIONS
} from './initialData';

// Safe wrapper for localStorage access
const VERSION_KEY = 'erp_db_reset_v5';
if (typeof window !== 'undefined' && localStorage.getItem(VERSION_KEY) !== 'true') {
  localStorage.removeItem('erp_users');
  localStorage.removeItem('erp_clients');
  localStorage.removeItem('erp_products');
  localStorage.removeItem('erp_categories');
  localStorage.removeItem('erp_raw_materials');
  localStorage.removeItem('erp_suppliers');
  localStorage.removeItem('erp_os_list');
  localStorage.removeItem('erp_finances');
  localStorage.removeItem('erp_chat_internal');
  localStorage.removeItem('erp_logs');
  localStorage.removeItem('erp_notifications');
  localStorage.removeItem('erp_active_user');
  localStorage.removeItem('erp_credentials');
  localStorage.setItem(VERSION_KEY, 'true');
}

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key', key, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage key', key, error);
  }
};

export const useERPState = () => {
  // Database States
  const [users, setUsers] = useState<User[]>(() => getStorageItem('erp_users', DEFAULT_USERS));
  const [clients, setClients] = useState<Client[]>(() => {
    const stored = getStorageItem<Client[]>('erp_clients', INITIAL_CLIENTS);
    return stored.length === 0 ? INITIAL_CLIENTS : stored;
  });
  const [products, setProducts] = useState<Product[]>(() => getStorageItem('erp_products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => getStorageItem('erp_categories', INITIAL_CATEGORIES));
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => getStorageItem('erp_raw_materials', INITIAL_RAWMATERIALS));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStorageItem('erp_suppliers', INITIAL_SUPPLIERS));
  const [osList, setOsList] = useState<OS[]>(() => {
    const stored = getStorageItem<OS[]>('erp_os_list', INITIAL_OS_LIST);
    return stored.length === 0 ? INITIAL_OS_LIST : stored;
  });
  const [finances, setFinances] = useState<FinancialRecord[]>(() => getStorageItem('erp_finances', INITIAL_FINANCES));
  const [chatInternal, setChatInternal] = useState<ChatInternalMessage[]>(() => getStorageItem('erp_chat_internal', INITIAL_CHAT_INTERNAL));
  const [logs, setLogs] = useState<LogEntry[]>(() => getStorageItem('erp_logs', INITIAL_LOGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStorageItem('erp_notifications', INITIAL_NOTIFICATIONS));
  const [monthlyGoals, setMonthlyGoalsState] = useState<{ [month: string]: number }>(() => getStorageItem('erp_monthly_goals', {
    'Jan': 10000,
    'Fev': 10000,
    'Mar': 10000,
    'Abr': 10000,
    'Mai': 10000,
    'Jun': 10000,
    'Jul': 10000,
    'Ago': 10000,
    'Set': 10000,
    'Out': 10000,
    'Nov': 10000,
    'Dez': 10000,
  }));
  const [selectedGoalMonth, setSelectedGoalMonthState] = useState<string>(() => getStorageItem('erp_selected_goal_month', 'Jul'));
  
  const monthlyGoal = monthlyGoals[selectedGoalMonth] || 10000;
  
  const updateMonthlyGoal = (month: string, goal: number) => {
    const updated = { ...monthlyGoals, [month]: goal };
    setMonthlyGoalsState(updated);
    setStorageItem('erp_monthly_goals', updated);
  };

  const setSelectedGoalMonth = (month: string) => {
    setSelectedGoalMonthState(month);
    setStorageItem('erp_selected_goal_month', month);
  };
  
  // Credentials map (username -> password)
  const [credentials, setCredentials] = useState<{ [username: string]: string }>(() => {
    return getStorageItem('erp_credentials', {
      admin: '12345',
      atendimento: '12345',
      designer: '12345',
      impressao: '12345',
      producao: '12345',
      costura: '12345',
      finalizacao: 'entrega',
      vendas2: '12345',
      designer2: '12345',
      impressao2: '12345',
      producao2: '12345',
      costura2: '12345',
      finalizacao2: '12345'
    });
  });

  // Auth States
  const [activeUser, setActiveUser] = useState<User | null>(() => getStorageItem('erp_active_user', null));
  const [theme, setThemeState] = useState<'claro' | 'escuro'>('claro');

  // Trigger global theme application on mount or user change
  useEffect(() => {
    if (activeUser) {
      const userTheme = getStorageItem<any>(`erp_theme_${activeUser.username}`, 'claro');
      setThemeState(userTheme);
      applyThemeToDOM(userTheme);
    } else {
      setThemeState('claro');
      applyThemeToDOM('escuro');
    }
  }, [activeUser]);

  // Synchronize collections with localStorage on change
  useEffect(() => { setStorageItem('erp_users', users); }, [users]);
  useEffect(() => { setStorageItem('erp_clients', clients); }, [clients]);
  useEffect(() => { setStorageItem('erp_products', products); }, [products]);
  useEffect(() => { setStorageItem('erp_categories', categories); }, [categories]);
  useEffect(() => { setStorageItem('erp_raw_materials', rawMaterials); }, [rawMaterials]);
  useEffect(() => { setStorageItem('erp_suppliers', suppliers); }, [suppliers]);
  useEffect(() => { setStorageItem('erp_os_list', osList); }, [osList]);
  useEffect(() => { setStorageItem('erp_finances', finances); }, [finances]);
  useEffect(() => { setStorageItem('erp_chat_internal', chatInternal); }, [chatInternal]);
  useEffect(() => { setStorageItem('erp_logs', logs); }, [logs]);
  useEffect(() => { setStorageItem('erp_notifications', notifications); }, [notifications]);
  useEffect(() => { setStorageItem('erp_credentials', credentials); }, [credentials]);
  useEffect(() => { setStorageItem('erp_active_user', activeUser); }, [activeUser]);

  // Restore/Sync default demo state on mount
  useEffect(() => {
    // 1. Force users to have one collaborator per department
    const cleanUsers = DEFAULT_USERS;
    setUsers(cleanUsers);

    // Update credentials to include all our department users
    const expectedCredentials = {
      admin: '12345',
      marcelo: '12345',
      daniel: '12345',
      ivan: '12345',
      pedro: '12345',
      clara: '12345',
      fabio: '12345'
    };
    setCredentials(expectedCredentials);

    // If activeUser is some other old employee, log out or set to admin
    if (activeUser && !cleanUsers.some(u => u.id === activeUser.id)) {
      setActiveUser(null);
    }

    // 2. Ensure clients have the 3 simulated ones
    setClients(prevClients => {
      const temp = [...prevClients];
      let updated = false;
      INITIAL_CLIENTS.forEach(ic => {
        if (!temp.some(c => c.id === ic.id)) {
          temp.push(ic);
          updated = true;
        }
      });
      return updated ? temp : prevClients;
    });

    // 3. Clear all orders and finances once to allow manual testing
    const hasResetOrders = localStorage.getItem('erp_has_reset_orders_v4');
    if (!hasResetOrders) {
      setOsList([]);
      setFinances([]);
      localStorage.setItem('erp_has_reset_orders_v4', 'true');
    }
  }, []);

  // Keep finances in sync with any paid OS automatically
  useEffect(() => {
    setFinances(prevFinances => {
      const temp = [...prevFinances];
      let updated = false;
      osList.forEach(os => {
        const isPaid = os.paymentInfo?.paymentStatus === 'Pago';
        const paidVal = os.paymentInfo?.paidVal ?? 0;
        if (isPaid && paidVal > 0) {
          const hasFinanceEntry = temp.some(f => 
            f.description.includes(`OS #${os.osNumber}`) || 
            f.description.includes(`OS nº ${os.osNumber}`)
          );
          if (!hasFinanceEntry) {
            temp.push({
              id: 'fin-' + os.id + '-' + Date.now(),
              type: 'entrada',
              description: `Pagamento integral OS #${os.osNumber} - ${os.clientName}`,
              amount: paidVal,
              category: 'Pedidos',
              date: os.entryDate || new Date().toISOString().split('T')[0],
              status: 'Pago',
              vendedor: os.history[0]?.userName || 'Marcelo Vendedor'
            });
            updated = true;
          }
        }
      });
      return updated ? temp : prevFinances;
    });
  }, [osList]);

  const applyThemeToDOM = (t: 'claro' | 'escuro') => {
    const root = window.document.documentElement;
    if (t === 'escuro') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'claro' ? 'escuro' : 'claro';
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    if (activeUser) {
      setStorageItem(`erp_theme_${activeUser.username}`, newTheme);
    }
  };

  // Helper to add system log
  const addLog = (action: string, details: string, userOverride?: User) => {
    const actingUser = userOverride || activeUser;
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: actingUser ? actingUser.name : 'Sistema',
      userRole: actingUser ? actingUser.role : 'admin',
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Helper to add notification
  const triggerNotification = (title: string, description: string, type: 'success' | 'info' | 'warning' | 'message') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      description,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // --- ACTIONS ---

  // Auth Action
  const login = (username: string, password?: string): { success: boolean; message: string } => {
    let targetUsername = username.toLowerCase();
    
    // Map 'atendimento' to 'marcelo' for backward compatibility and quick access
    if (targetUsername === 'atendimento') {
      targetUsername = 'marcelo';
    }

    const foundUser = users.find(u => 
      u.username.toLowerCase() === targetUsername ||
      u.name.toLowerCase() === username.toLowerCase() ||
      u.role.toLowerCase() === targetUsername
    );
    if (!foundUser) {
      return { success: false, message: 'Usuário não cadastrado.' };
    }
    if (foundUser.status === 'Inativo') {
      return { success: false, message: 'Este colaborador está inativo no sistema.' };
    }
    
    // Check credentials using either the original or mapped user key - BYPASSED FOR TESTING
    // const storedPass = credentials[targetUsername] || credentials[username.toLowerCase()];
    // if (password && storedPass !== password) {
    //   return { success: false, message: 'Senha incorreta.' };
    // }

    setActiveUser(foundUser);
    addLog('LOGIN', 'Colaborador efetuou login no sistema', foundUser);
    return { success: true, message: 'Login efetuado com sucesso!' };
  };

  const logout = () => {
    if (activeUser) {
      addLog('LOGOUT', 'Colaborador saiu do sistema');
    }
    setActiveUser(null);
  };

  // Employee (Colaborador) Management
  const registerUser = (colab: Omit<User, 'id' | 'avatarColor'>, initialPassword?: string) => {
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-sky-600', 'bg-amber-600', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600', 'bg-rose-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)] + ' text-white';
    
    const newId = `usr-${Date.now()}`;
    const newUser: User = {
      ...colab,
      id: newId,
      avatarColor: randomColor
    };

    setUsers(prev => [...prev, newUser]);
    
    // Register credentials
    const cleanUsername = colab.username.toLowerCase();
    const cleanPass = initialPassword || '12345';
    setCredentials(prev => ({
      ...prev,
      [cleanUsername]: cleanPass
    }));

    addLog('CADASTRAR_COLABORADOR', `Cadastrou colaborador ${newUser.name} com cargo ${newUser.role}`);
    triggerNotification('Novo Colaborador', `${newUser.name} cadastrado como ${newUser.role}.`, 'success');
  };

  const updateUserStatus = (userId: string, status: 'Ativo' | 'Inativo') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      addLog('ALTERAR_STATUS_COLABORADOR', `Alterou status de ${targetUser.name} para ${status}`);
    }
  };

  // Client Management
  const addClient = (cli: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...cli,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newClient, ...prev]);
    addLog('CADASTRAR_CLIENTE', `Cadastrou o cliente ${newClient.name}`);
    triggerNotification('Novo Cliente', `Cliente ${newClient.name} foi cadastrado com sucesso.`, 'success');
  };

  const updateClient = (cli: Client) => {
    setClients(prev => prev.map(c => c.id === cli.id ? cli : c));
    addLog('ATUALIZAR_CLIENTE', `Atualizou os dados do cliente ${cli.name}`);
  };

  // Product Management
  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prod,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [...prev, newProduct]);
    addLog('CADASTRAR_PRODUTO', `Cadastrou o produto ${newProduct.name}`);
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  // Raw Material Management
  const addRawMaterial = (raw: Omit<RawMaterial, 'id'>) => {
    const newRaw: RawMaterial = {
      ...raw,
      id: `raw-${Date.now()}`
    };
    setRawMaterials(prev => [...prev, newRaw]);
    addLog('CADASTRAR_MATERIA_PRIMA', `Cadastrou matéria-prima ${newRaw.name}`);
  };

  const updateRawMaterialStock = (id: string, delta: number) => {
    setRawMaterials(prev => prev.map(r => {
      if (r.id === id) {
        const updatedStock = Math.max(0, r.stock + delta);
        if (updatedStock < r.minStock) {
          triggerNotification('Estoque Crítico', `A matéria-prima ${r.name} atingiu nível crítico (${updatedStock} ${r.unit})!`, 'warning');
        }
        return { ...r, stock: updatedStock };
      }
      return r;
    }));
  };

  // Category Management
  const addCategory = (name: string, description?: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      description
    };
    setCategories(prev => [...prev, newCat]);
    addLog('CADASTRAR_CATEGORIA', `Cadastrou a categoria ${name}`);
  };

  // OS Management
  const createOS = (osData: Omit<OS, 'id' | 'osNumber' | 'currentStage' | 'status' | 'history' | 'chat' | 'checklist' | 'flowStages'>, flowStages: ProductionStage[], checklistItems: string[]) => {
    const nextOSNumber = (Math.max(...osList.map(o => parseInt(o.osNumber) || 1000)) + 1).toString();
    
    const checklist: { [key: string]: boolean } = {};
    checklistItems.forEach(item => {
      checklist[item] = false;
    });

    const initialStage = flowStages[0] || 'sistema';

    const newOS: OS = {
      ...osData,
      id: `os-${Date.now()}`,
      osNumber: nextOSNumber,
      currentStage: initialStage,
      status: 'Em Andamento',
      flowStages,
      checklist,
      chat: [],
      history: [
        {
          stage: initialStage,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          userId: activeUser?.id || 'usr-1',
          userName: activeUser?.name || 'Sistema'
        }
      ],
      paymentInfo: {
        budgetVal: osData.value,
        discount: 0,
        addition: 0,
        shipping: 0,
        totalVal: osData.value,
        paidVal: 0,
        pendingVal: osData.value,
        methods: [osData.paymentMethod || 'Dinheiro'],
        paymentStatus: 'Aguardando Pagamento',
        installments: 1,
        dueDate: new Date().toISOString().split('T')[0],
        receiptInfo: ''
      },
      invoiceInfo: {
        situation: 'Pendente'
      }
    };

    setOsList(prev => [newOS, ...prev]);

    addLog('CRIAR_OS', `Criou a OS #${nextOSNumber} para ${osData.clientName} no valor total de R$ ${osData.value.toFixed(2)}`);
    triggerNotification('Nova OS Aberta', `OS #${nextOSNumber} criada com sucesso para ${osData.clientName}. Status: Aguardando Pagamento.`, 'success');
  };

  const advanceOSStage = (osId: string, customNextStage?: ProductionStage) => {
    const targetOS = osList.find(o => o.id === osId);
    if (!targetOS) return;

    if (targetOS.paymentInfo?.paymentStatus !== 'Pago') {
      triggerNotification(
        'Pagamento Pendente', 
        `Não é permitido avançar o estágio da OS #${targetOS.osNumber} pois o pagamento ainda não foi reconhecido (Pago).`, 
        'warning'
      );
      return;
    }

    // Mapping of which sector/department (UserRole) is responsible for each production stage
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

    const userRole = activeUser?.role || 'admin';
    if (userRole !== 'admin') {
      const allowedRoles = stageToRolesMap[targetOS.currentStage] || [];
      if (!allowedRoles.includes(userRole)) {
        const allowedLabels = allowedRoles.map(r => getRoleLabel(r)).join(' ou ');
        triggerNotification(
          'Permissão Negada', 
          `Apenas o setor de: ${allowedLabels || 'responsável'} pode avançar desta etapa (${getStageLabel(targetOS.currentStage)}).`, 
          'warning'
        );
        return;
      }
    }

    setOsList(prev => prev.map(os => {
      if (os.id !== osId) return os;

      const currentIdx = os.flowStages.indexOf(os.currentStage);
      let nextStage: ProductionStage = 'concluido';

      if (customNextStage) {
        nextStage = customNextStage;
      } else if (currentIdx !== -1 && currentIdx < os.flowStages.length - 1) {
        nextStage = os.flowStages[currentIdx + 1];
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Calculate time spent in previous stage
      const lastHistoryIndex = os.history.length - 1;
      let durationMinutes: number | undefined = undefined;
      
      if (lastHistoryIndex >= 0) {
        const lastHist = os.history[lastHistoryIndex];
        try {
          const prevDateTime = new Date(`${lastHist.date}T${lastHist.time}`);
          const currentDateTime = new Date();
          const diffMs = currentDateTime.getTime() - prevDateTime.getTime();
          durationMinutes = Math.max(1, Math.floor(diffMs / 60000));
        } catch (e) {
          durationMinutes = 15; // default fallback
        }
      }

      // Prepare updated history
      const updatedHistory = [...os.history];
      if (lastHistoryIndex >= 0) {
        updatedHistory[lastHistoryIndex] = {
          ...updatedHistory[lastHistoryIndex],
          durationMinutes
        };
      }

      updatedHistory.push({
        stage: nextStage,
        date: todayStr,
        time: nowStr,
        userId: activeUser?.id || 'sys',
        userName: activeUser?.name || 'Sistema'
      });

      // Status updates
      let updatedStatus = os.status;
      let updatedPaymentInfo = os.paymentInfo ? { ...os.paymentInfo } : undefined;

      if (nextStage === 'concluido') {
        updatedStatus = 'Pedido Entregue';
        
        if (updatedPaymentInfo) {
          updatedPaymentInfo.paidVal = updatedPaymentInfo.totalVal;
          updatedPaymentInfo.pendingVal = 0;
          updatedPaymentInfo.paymentStatus = 'Pago';
        }

        // Register remaining 50% financial entry automatically on final collection
        const finalAmount = os.value / 2;
        const remainingEntry: FinancialRecord = {
          id: `fin-concl-${Date.now()}`,
          type: 'entrada',
          description: `Quitação final 50% OS #${os.osNumber} - ${os.clientName}`,
          amount: finalAmount,
          date: todayStr,
          category: 'Pedidos',
          status: 'Pago',
          vendedor: os.history[0]?.userName || 'Atendimento'
        };
        setFinances(prevFin => [remainingEntry, ...prevFin]);
        
        triggerNotification('OS Entregue e Concluída', `OS #${os.osNumber} finalizada e entregue ao cliente!`, 'success');
      } else {
        // Trigger notification for the next sector
        triggerNotification(`OS #${os.osNumber} avançou`, `Encaminhada para o setor de: ${getStageLabel(nextStage)}`, 'info');
      }

      addLog('AVANCO_ESTAGIO_OS', `OS #${os.osNumber} avançou do estágio ${getStageLabel(os.currentStage)} para ${getStageLabel(nextStage)}`);

      return {
        ...os,
        currentStage: nextStage,
        status: updatedStatus,
        history: updatedHistory,
        paymentInfo: updatedPaymentInfo
      };
    }));
  };

  const updateOSChecklistItem = (osId: string, itemKey: string, checked: boolean) => {
    setOsList(prev => prev.map(os => {
      if (os.id !== osId) return os;
      return {
        ...os,
        checklist: {
          ...os.checklist,
          [itemKey]: checked
        }
      };
    }));
  };

  const addOSChatMessage = (osId: string, content: string) => {
    const newMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderName: activeUser?.name || 'Sistema',
      senderRole: activeUser?.role || 'admin',
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setOsList(prev => prev.map(os => {
      if (os.id !== osId) return os;
      return {
        ...os,
        chat: [...os.chat, newMessage]
      };
    }));

    const targetOS = osList.find(o => o.id === osId);
    if (targetOS) {
      triggerNotification(`Chat OS #${targetOS.osNumber}`, `${activeUser?.name}: "${content.substring(0, 30)}..."`, 'message');
    }
  };

  // Internal Chat Between Sectors & Admin
  const sendInternalMessage = (receiverRole: UserRole, content: string, fileUrl?: string, fileName?: string, fileType?: string) => {
    if (!activeUser) return;
    const newMessage: ChatInternalMessage = {
      id: `ch-int-${Date.now()}`,
      senderRole: activeUser.role,
      senderName: activeUser.name,
      receiverRole,
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      fileUrl,
      fileName,
      fileType
    };

    setChatInternal(prev => [...prev, newMessage]);
    
    // Auto response helper simulation to feel "real-time" and dynamic
    if (receiverRole !== 'admin' && activeUser.role === 'admin') {
      triggerNotification(`Chat enviado para ${getRoleLabel(receiverRole)}`, `Sua mensagem foi enviada ao setor.`, 'info');
    } else {
      triggerNotification(`Nova Mensagem Setorial`, `Enviado por ${activeUser.name} para ${getRoleLabel(receiverRole)}.`, 'message');
    }
  };

  const markInternalMessagesRead = (senderRole: UserRole) => {
    setChatInternal(prev => prev.map(msg => {
      if (msg.senderRole === senderRole && msg.receiverRole === activeUser?.role) {
        return { ...msg, isRead: true };
      }
      return msg;
    }));
  };

  // Financial Actions
  const addFinancialRecord = (rec: Omit<FinancialRecord, 'id' | 'date'>) => {
    const newRec: FinancialRecord = {
      ...rec,
      id: `fin-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setFinances(prev => [newRec, ...prev]);
    addLog('LANCAMENTO_FINANCEIRO', `Lançou ${rec.type} de R$ ${rec.amount.toFixed(2)} - ${rec.description}`);
    triggerNotification('Lançamento Financeiro', `Lançamento de R$ ${rec.amount.toFixed(2)} registrado.`, 'success');
  };

  const updateOSPaymentInfo = (osId: string, paymentInfo: Partial<OSPaymentInfo>) => {
    setOsList(prev => prev.map(os => {
      if (os.id !== osId) return os;
      const currentPay = os.paymentInfo || {
        budgetVal: os.value,
        discount: 0,
        addition: 0,
        shipping: 0,
        totalVal: os.value,
        paidVal: 0,
        pendingVal: os.value,
        methods: [],
        paymentStatus: 'Aguardando Pagamento' as const
      };
      
      const updatedPay = { ...currentPay, ...paymentInfo };
      // Recalculate total and pending:
      updatedPay.totalVal = updatedPay.budgetVal - (updatedPay.discount || 0) + (updatedPay.addition || 0) + (updatedPay.shipping || 0);
      updatedPay.pendingVal = Math.max(0, updatedPay.totalVal - (updatedPay.paidVal || 0));
      
      // Auto-set payment status based on amount paid if not explicitly specified:
      if (!paymentInfo.paymentStatus) {
        if (updatedPay.paidVal >= updatedPay.totalVal && updatedPay.totalVal > 0) {
          updatedPay.paymentStatus = 'Pago';
        } else if (updatedPay.paidVal > 0) {
          updatedPay.paymentStatus = 'Pagamento Parcial';
        } else {
          updatedPay.paymentStatus = 'Aguardando Pagamento';
        }
      }

      // Log status changes: "Cada alteração deverá registrar automaticamente data, hora e usuário responsável."
      const statusChanged = currentPay.paymentStatus !== updatedPay.paymentStatus;
      const updatedHistory = [...os.history];
      
      if (statusChanged) {
        const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        os.chat.push({
          id: `pay-status-${Date.now()}`,
          senderName: 'Sistema Financeiro',
          senderRole: 'admin',
          content: `Alteração de pagamento: ${currentPay.paymentStatus} -> ${updatedPay.paymentStatus} por ${activeUser?.name || 'Sistema'}.`,
          timestamp: nowStr
        });
        
        addLog('PAGAMENTO_STATUS', `OS #${os.osNumber}: Status de pagamento alterado para ${updatedPay.paymentStatus}`);
      }

      return {
        ...os,
        paymentInfo: updatedPay,
        history: updatedHistory
      };
    }));
  };

  const updateOSInvoiceInfo = (osId: string, invoiceInfo: Partial<OSInvoiceInfo>) => {
    setOsList(prev => prev.map(os => {
      if (os.id !== osId) return os;
      const currentInv = os.invoiceInfo || {
        situation: 'Pendente' as const
      };
      
      const updatedInv = { ...currentInv, ...invoiceInfo };
      
      // "Depois da emissão da Nota Fiscal, a Ordem de Produção será atualizada com o status Faturado."
      let updatedStatus = os.status;
      if (updatedInv.situation === 'Emitida') {
        updatedStatus = 'Faturado';
      }

      const situationChanged = currentInv.situation !== updatedInv.situation;
      if (situationChanged) {
        const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        os.chat.push({
          id: `inv-status-${Date.now()}`,
          senderName: 'Sistema Fiscal',
          senderRole: 'admin',
          content: `Nota Fiscal alterada para: ${updatedInv.situation} por ${activeUser?.name || 'Sistema'}.`,
          timestamp: nowStr
        });
        
        addLog('NF_STATUS', `OS #${os.osNumber}: Situação da NF alterada para ${updatedInv.situation}`);
      }

      return {
        ...os,
        invoiceInfo: updatedInv,
        status: updatedStatus
      };
    }));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearFaturamento = () => {
    setFinances([]);
    setOsList(prev => prev.map(os => {
      const currentPay = os.paymentInfo || {
        budgetVal: os.value,
        discount: 0,
        addition: 0,
        shipping: 0,
        totalVal: os.value,
        paidVal: 0,
        pendingVal: os.value,
        methods: [],
        paymentStatus: 'Aguardando Pagamento' as const
      };
      const updatedPay = {
        ...currentPay,
        paidVal: 0,
        pendingVal: currentPay.totalVal,
        methods: [],
        paymentStatus: 'Aguardando Pagamento' as const,
        installments: 1
      };
      return {
        ...os,
        paymentInfo: updatedPay,
        invoiceInfo: {
          situation: 'Pendente' as const
        }
      };
    }));
    addLog('ZERAR_FATURAMENTO', 'Faturamento anual e mensal foi zerado pelo colaborador.');
    triggerNotification('Faturamento Zerado', 'Todos os dados de faturamento foram limpos com sucesso.', 'info');
  };

  // Database actions: Reset, Backup and Restore
  const resetDatabase = () => {
    if (window.confirm('Tem certeza que deseja resetar todo o sistema para os dados de fábrica? Isso apagará alterações recentes.')) {
      setUsers(DEFAULT_USERS);
      setClients(INITIAL_CLIENTS);
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setRawMaterials(INITIAL_RAWMATERIALS);
      setSuppliers(INITIAL_SUPPLIERS);
      setOsList(INITIAL_OS_LIST);
      setFinances(INITIAL_FINANCES);
      setChatInternal(INITIAL_CHAT_INTERNAL);
      setLogs(INITIAL_LOGS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setActiveUser(DEFAULT_USERS[0]); // fallback log back into admin
      setThemeState('claro');
      applyThemeToDOM('claro');
      
      // Clear specific user themes too
      DEFAULT_USERS.forEach(u => {
        localStorage.removeItem(`erp_theme_${u.username}`);
      });

      alert('Banco de dados restaurado com sucesso!');
      addLog('RESET_BANCO', 'Banco de dados foi resetado para os padrões de fábrica');
    }
  };

  const backupData = () => {
    const payload = {
      users,
      clients,
      products,
      categories,
      rawMaterials,
      suppliers,
      osList,
      finances,
      chatInternal,
      logs,
      notifications,
      credentials
    };
    return JSON.stringify(payload, null, 2);
  };

  const restoreData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.users && parsed.clients && parsed.osList) {
        setUsers(parsed.users);
        setClients(parsed.clients);
        setProducts(parsed.products || []);
        setCategories(parsed.categories || []);
        setRawMaterials(parsed.rawMaterials || []);
        setSuppliers(parsed.suppliers || []);
        setOsList(parsed.osList);
        setFinances(parsed.finances || []);
        setChatInternal(parsed.chatInternal || []);
        setLogs(parsed.logs || []);
        setNotifications(parsed.notifications || []);
        setCredentials(parsed.credentials || {});
        if (parsed.users.length > 0) {
          setActiveUser(parsed.users[0]); // default to first user or keep same
        }
        addLog('RESTAURAR_BACKUP', 'Banco de dados restaurado a partir de arquivo de backup JSON');
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Helper Labels mapping
  const getStageLabel = (st: ProductionStage): string => {
    const map: { [key in ProductionStage]: string } = {
      sistema: 'Sistema',
      designer: 'Designer',
      pasta: 'Pasta (Fila)',
      impressao: 'Impressão',
      producao: 'Produção / Prensa',
      corredor: 'Corredor',
      costura: 'Costura',
      finalizacao: 'Finalização',
      empacotamento: 'Empacotamento',
      expedicao: 'Expedição',
      entrega: 'Entrega',
      concluido: 'Concluído'
    };
    return map[st] || st;
  };

  const getRoleLabel = (role: UserRole): string => {
    const map: { [key in UserRole]: string } = {
      admin: 'Administrador',
      atendimento: 'Atendimento / Recepção',
      designer: 'Arte / Designer',
      impressao: 'Impressão',
      producao: 'Prensagem / Calandra',
      costura: 'Costura / Acabamento',
      finalizacao: 'Expedição / Finalização'
    };
    return map[role] || role;
  };

  return {
    // State
    users,
    clients,
    products,
    categories,
    rawMaterials,
    suppliers,
    osList,
    finances,
    chatInternal,
    logs,
    notifications,
    credentials,
    activeUser,
    theme,
    monthlyGoal,
    selectedGoalMonth,
    monthlyGoals,
    
    // Actions
    login,
    logout,
    toggleTheme,
    registerUser,
    updateUserStatus,
    addClient,
    updateClient,
    addProduct,
    updateProductStock,
    addRawMaterial,
    updateRawMaterialStock,
    addCategory,
    createOS,
    advanceOSStage,
    updateOSChecklistItem,
    addOSChatMessage,
    sendInternalMessage,
    markInternalMessagesRead,
    addFinancialRecord,
    updateOSPaymentInfo,
    updateOSInvoiceInfo,
    markAllNotificationsAsRead,
    resetDatabase,
    backupData,
    restoreData,
    updateMonthlyGoal,
    setSelectedGoalMonth,
    clearFaturamento,
    
    // Helpers
    getStageLabel,
    getRoleLabel
  };
};
