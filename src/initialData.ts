import { User, Client, OS, FinancialRecord, Product, Category, RawMaterial, LogEntry, AppNotification, Supplier, ChatInternalMessage } from './types';

export const MOTIVATIONAL_PHRASES = [
  "A criatividade é a inteligência se divertindo. Vamos sublimar novas ideias hoje!",
  "Sublimar é a arte de transformar o comum em extraordinário através das cores.",
  "A qualidade nunca é um acidente; é sempre o resultado de um esforço inteligente.",
  "O sucesso é a soma de pequenos esforços e prensadas repetidas dia após dia.",
  "Transformando fios, tecidos e cores em conexões reais com o seu cliente.",
  "Grandes resultados e estampas perfeitas começam com processos organizados.",
  "A excelência na produção têxtil é o nosso maior compromisso.",
  "A cor é o teclado, os olhos são os harmônicos, a alma é o piano da sublimação.",
  "Agilidade na prensa e precisão no corte: a receita de uma entrega de sucesso.",
  "Produzir com carinho é vestir o mundo com identidade e exclusividade.",
  "Cada estampa conta uma história de criatividade. Qual será a história de hoje?",
  "A produtividade inteligente otimiza a nossa energia e garante a melhor nitidez.",
  "O design é o embaixador silencioso de sua marca e do seu negócio.",
  "Trabalhar em equipe é unir forças em torno de um tecido sublimado perfeito.",
  "Foco na temperatura, precisão na prensa e brilho radiante no poliéster.",
  "A inovação tecnológica na sublimação é o que nos mantém na vanguarda do mercado.",
  "Determinação é o ponto de partida de qualquer grande rolo de tecido produzido.",
  "O segredo de entregar grandes volumes é começar organizando cada OS.",
  "Sua marca gravada no tecido com a fidelidade de cor que ela realmente merece.",
  "Superar as expectativas de prazos e acabamento dos nossos clientes é nossa meta.",
  "Tecnologia moderna e talento humano em perfeita harmonia na produção diária.",
  "A melhor maneira de prever o sucesso de vendas de um produto é estampá-lo com alma.",
  "A arte da sublimação é a materialização física de grandes sentimentos.",
  "A organização operacional de hoje é a agilidade logística de amanhã.",
  "Qualidade extrema nos detalhes de costura e costura dupla reforçada.",
  "Compromisso rígido com o prazo acordado e amor incondicional pelo que fazemos.",
  "Ajuste a prensa com fé, configure o tempo com precisão e encante o cliente.",
  "As cores mais vibrantes do mercado estão na paixão que colocamos na confecção.",
  "Eficiência industrial é estampar mais com menos desperdício de insumos.",
  "Construindo parcerias sólidas e duradouras através de sublimações impecáveis.",
  "A evolução constante dos nossos colaboradores nos mantém como líderes no Ceará."
];

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Administração',
    cpf: '123.456.789-00',
    phone: '(85) 98888-7777',
    email: 'admin@tecidosublimado.com',
    role: 'admin',
    username: 'admin',
    status: 'Ativo',
    avatarColor: 'bg-indigo-600 text-white'
  },
  {
    id: 'usr-marcelo',
    name: 'Atendimento',
    cpf: '456.123.789-12',
    phone: '(85) 98765-4321',
    email: 'marcelo.vendas@tecidosublimado.com',
    role: 'atendimento',
    username: 'marcelo',
    status: 'Ativo',
    avatarColor: 'bg-emerald-600 text-white'
  },
  {
    id: 'usr-daniel',
    name: 'Designer',
    cpf: '789.456.123-01',
    phone: '(85) 97777-6666',
    email: 'daniel.design@tecidosublimado.com',
    role: 'designer',
    username: 'daniel',
    status: 'Ativo',
    avatarColor: 'bg-sky-600 text-white'
  },
  {
    id: 'usr-ivan',
    name: 'Impressão',
    cpf: '321.654.987-02',
    phone: '(85) 96666-5555',
    email: 'ivan.impressao@tecidosublimado.com',
    role: 'impressao',
    username: 'ivan',
    status: 'Ativo',
    avatarColor: 'bg-amber-600 text-white'
  },
  {
    id: 'usr-pedro',
    name: 'Produção',
    cpf: '654.321.987-03',
    phone: '(85) 95555-4444',
    email: 'pedro.producao@tecidosublimado.com',
    role: 'producao',
    username: 'pedro',
    status: 'Ativo',
    avatarColor: 'bg-purple-600 text-white'
  },
  {
    id: 'usr-clara',
    name: 'Costura',
    cpf: '987.654.321-04',
    phone: '(85) 94444-3333',
    email: 'clara.costura@tecidosublimado.com',
    role: 'costura',
    username: 'clara',
    status: 'Ativo',
    avatarColor: 'bg-pink-600 text-white'
  },
  {
    id: 'usr-fabio',
    name: 'Finalização',
    cpf: '159.753.486-05',
    phone: '(85) 93333-2222',
    email: 'fabio.finalizacao@tecidosublimado.com',
    role: 'finalizacao',
    username: 'fabio',
    status: 'Ativo',
    avatarColor: 'bg-teal-600 text-white'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    type: 'PJ',
    document: '23.456.789/0001-11',
    name: 'Academia Corpo e Forma',
    email: 'contato@corpoeforma.com',
    phone: '(85) 91111-2222',
    whatsapp: '(85) 91111-2222',
    address: 'Rua do Movimento, 123',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60000-000',
    createdAt: '2026-07-01'
  },
  {
    id: 'cli-2',
    type: 'PJ',
    document: '12.345.678/0001-22',
    name: 'Prefeitura de Limoeiro',
    email: 'licitacoes@limoeiro.ce.gov.br',
    phone: '(88) 3423-1111',
    whatsapp: '(88) 3423-1111',
    address: 'Praça da Matriz, s/n',
    city: 'Limoeiro do Norte',
    state: 'CE',
    zipCode: '62930-000',
    createdAt: '2026-07-01'
  },
  {
    id: 'cli-3',
    type: 'PJ',
    document: '34.567.890/0001-33',
    name: 'Banda Sol de Verão',
    email: 'shows@soldeverao.com.br',
    phone: '(85) 92222-3333',
    whatsapp: '(85) 92222-3333',
    address: 'Av. Beira Mar, 450',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60165-121',
    createdAt: '2026-07-01'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Painéis', description: 'Painéis redondos, retangulares e grandes' },
  { id: 'cat-2', name: 'Capas & Laterais', description: 'Capas de cilindro e laterais individuais' },
  { id: 'cat-3', name: 'Kits Decorativos', description: 'Combinações de painéis, capas e laterais' },
  { id: 'cat-4', name: 'Tapetes', description: 'Tapetes sublimados e variados' },
  { id: 'cat-5', name: 'Capas Especiais', description: 'Capas para mesas e caixotes' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'PAN001',
    name: 'Painel Redondo em Tecido',
    category: 'Painéis',
    price: 45.00,
    productionCost: 18.00,
    productionTime: 15,
    stock: 120,
    unit: 'unidade'
  },
  {
    id: 'prod-2',
    sku: 'LAT001',
    name: 'Painel Lateral Individual',
    category: 'Capas & Laterais',
    price: 64.00,
    productionCost: 25.00,
    productionTime: 15,
    stock: 80,
    unit: 'unidade'
  },
  {
    id: 'prod-3',
    sku: 'KITLAT001',
    name: 'Kit 2 Laterais',
    category: 'Kits Decorativos',
    price: 144.00,
    productionCost: 50.00,
    productionTime: 25,
    stock: 50,
    unit: 'unidade'
  },
  {
    id: 'prod-4',
    sku: 'LAT003',
    name: 'Trio de Laterais',
    category: 'Capas & Laterais',
    price: 192.00,
    productionCost: 75.00,
    productionTime: 35,
    stock: 40,
    unit: 'unidade'
  },
  {
    id: 'prod-5',
    sku: 'CIL001',
    name: 'Capa para Cilindro (Trio)',
    category: 'Capas & Laterais',
    price: 101.00,
    productionCost: 40.00,
    productionTime: 20,
    stock: 90,
    unit: 'unidade'
  },
  {
    id: 'prod-6',
    sku: 'KITPC001',
    name: 'Kit Painel + Capas de Cilindro',
    category: 'Kits Decorativos',
    price: 170.00,
    productionCost: 60.00,
    productionTime: 35,
    stock: 35,
    unit: 'unidade'
  },
  {
    id: 'prod-7',
    sku: 'KITLC001',
    name: 'Kit 2 Laterais + Capas de Cilindro',
    category: 'Kits Decorativos',
    price: 229.00,
    productionCost: 90.00,
    productionTime: 45,
    stock: 30,
    unit: 'unidade'
  },
  {
    id: 'prod-8',
    sku: 'KIT001',
    name: 'Kit Decorativo Básico',
    category: 'Kits Decorativos',
    price: 298.00,
    productionCost: 120.00,
    productionTime: 90,
    stock: 25,
    unit: 'unidade'
  },
  {
    id: 'prod-9',
    sku: 'KIT002',
    name: 'Kit Decorativo Completo',
    category: 'Kits Decorativos',
    price: 392.00,
    productionCost: 160.00,
    productionTime: 120,
    stock: 20,
    unit: 'unidade'
  },
  {
    id: 'prod-10',
    sku: 'KIT003',
    name: 'Kit Premium ABC',
    category: 'Kits Decorativos',
    price: 546.00,
    productionCost: 220.00,
    productionTime: 180,
    stock: 15,
    unit: 'unidade'
  },
  {
    id: 'prod-11',
    sku: 'PANG001',
    name: 'Painel Grande',
    category: 'Painéis',
    price: 138.00,
    productionCost: 55.00,
    productionTime: 30,
    stock: 60,
    unit: 'unidade'
  },
  {
    id: 'prod-12',
    sku: 'PANR001',
    name: 'Painel Retangular',
    category: 'Painéis',
    price: 226.00,
    productionCost: 90.00,
    productionTime: 40,
    stock: 45,
    unit: 'unidade'
  },
  {
    id: 'prod-13',
    sku: 'PANMAX001',
    name: 'Painel Grande Especial ABC',
    category: 'Painéis',
    price: 446.00,
    productionCost: 180.00,
    productionTime: 120,
    stock: 10,
    unit: 'unidade'
  },
  {
    id: 'prod-14',
    sku: 'TAP001',
    name: 'Tapete Variado 5 x 2,50 m',
    category: 'Tapetes',
    price: 411.00,
    productionCost: 170.00,
    productionTime: 60,
    stock: 15,
    unit: 'unidade'
  },
  {
    id: 'prod-15',
    sku: 'TAP002',
    name: 'Tapete Sublimado Diversos',
    category: 'Tapetes',
    price: 490.00,
    productionCost: 200.00,
    productionTime: 75,
    stock: 12,
    unit: 'unidade'
  },
  {
    id: 'prod-16',
    sku: 'MESA001',
    name: 'Capa para Mesa (Mesa Veste)',
    category: 'Capas Especiais',
    price: 55.00,
    productionCost: 22.00,
    productionTime: 15,
    stock: 70,
    unit: 'unidade'
  },
  {
    id: 'prod-17',
    sku: 'CX001',
    name: 'Capa para Caixote CEASA',
    category: 'Capas Especiais',
    price: 38.00,
    productionCost: 15.00,
    productionTime: 10,
    stock: 110,
    unit: 'unidade'
  }
];

export const INITIAL_RAWMATERIALS: RawMaterial[] = [];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_OS_LIST: OS[] = [];

export const INITIAL_FINANCES: FinancialRecord[] = [];

export const INITIAL_CHAT_INTERNAL: ChatInternalMessage[] = [];

export const INITIAL_LOGS: LogEntry[] = [];

