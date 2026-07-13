export type UserRole =
  | 'admin'
  | 'atendimento'
  | 'designer'
  | 'impressao'
  | 'producao'
  | 'costura'
  | 'finalizacao';

export interface User {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  role: UserRole;
  username: string;
  status: 'Ativo' | 'Inativo';
  photoUrl?: string;
  avatarColor?: string;
}

export type ClientType = 'PF' | 'PJ';

export interface Client {
  id: string;
  type: ClientType;
  document: string; // CPF or CNPJ
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  createdAt: string;
}

export type OSPriority = 'urgente' | 'alta' | 'normal' | 'baixa';

export type ProductionStage =
  | 'sistema'
  | 'designer'
  | 'pasta'
  | 'impressao'
  | 'producao'
  | 'corredor'
  | 'costura'
  | 'finalizacao'
  | 'empacotamento'
  | 'expedicao'
  | 'entrega'
  | 'concluido';

export type OSStatus = 'Em Andamento' | 'Atrasado' | 'Concluído' | 'Faturado' | 'Pedido Entregue';

export interface OSPaymentInfo {
  budgetVal: number;
  discount: number;
  addition: number;
  shipping: number;
  totalVal: number;
  paidVal: number;
  pendingVal: number;
  methods: string[]; // e.g. ['PIX', 'Cartão de Crédito']
  installments?: number;
  dueDate?: string;
  receiptInfo?: string;
  paymentStatus: 'Aguardando Pagamento' | 'Pagamento Parcial' | 'Pago' | 'Em Atraso' | 'Cancelado' | 'Reembolsado';
}

export interface OSInvoiceInfo {
  invoiceNumber?: string;
  series?: string;
  accessKey?: string;
  issueDate?: string;
  docType?: 'NF-e' | 'NFS-e';
  situation: 'Pendente' | 'Emitida' | 'Cancelada' | 'Rejeitada';
}

export interface OSHistory {
  stage: ProductionStage;
  date: string;
  time: string;
  userId: string;
  userName: string;
  durationMinutes?: number;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
}

export interface OS {
  id: string;
  osNumber: string;
  clientId: string;
  clientName: string;
  product: string;
  category: string;
  qty: number;
  value: number;
  paymentMethod: string;
  entryDate: string;
  deadline: string; // format YYYY-MM-DD
  currentStage: ProductionStage;
  status: OSStatus;
  notes?: string;
  imageUrl?: string;
  fileUrl?: string;
  priority: OSPriority;
  history: OSHistory[];
  chat: ChatMessage[];
  checklist: { [key: string]: boolean };
  flowStages: ProductionStage[]; // Customized flow for this OS
  corredorPrevistoDate?: string; // Target date if corredor is in flow
  paymentInfo?: OSPaymentInfo;
  invoiceInfo?: OSInvoiceInfo;
}

export interface ChatInternalMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  receiverRole: UserRole; // 'admin' or specific role
  content: string;
  timestamp: string;
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface FinancialRecord {
  id: string;
  type: 'entrada' | 'saida';
  description: string;
  amount: number;
  date: string;
  category: string;
  paymentMethod?: string;
  status: 'Pago' | 'Pendente';
  vendedor?: string; // Vendedor/Atendimento
  designer?: string; // Designer assigned
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  sku: string;
  stock: number;
  unit: string;
  productionCost?: number;
  productionTime?: number; // in minutes
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
}

export interface Supplier {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'success' | 'info' | 'warning' | 'message';
}
