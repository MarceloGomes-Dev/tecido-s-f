import React, { useState, useMemo } from 'react';
import { Search, UserPlus, FileText, ShoppingBag, MapPin, Phone, Mail, Edit3, Check, Eye } from 'lucide-react';
import { Client, OS, ClientType } from '../types';

interface ClientsViewProps {
  clients: Client[];
  osList: OS[];
  addClient: (cli: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (cli: Client) => void;
  theme: 'claro' | 'escuro';
}

export default function ClientsView({ clients, osList, addClient, updateClient, theme }: ClientsViewProps) {
  const isDark = theme === 'escuro';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modal controllers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [type, setType] = useState<ClientType>('PJ');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Fortaleza');
  const [state, setState] = useState('CE');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');

  // Editing Client state
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Handle client selection to show purchase history
  const selectedClientPurchases = useMemo(() => {
    if (!selectedClient) return [];
    return osList.filter(o => o.clientId === selectedClient.id);
  }, [selectedClient, osList]);

  const handleOpenAddModal = () => {
    setType('PJ');
    setName('');
    setDocument('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setCity('Fortaleza');
    setState('CE');
    setZipCode('');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (c: Client) => {
    setEditingClient(c);
    setType(c.type);
    setName(c.name);
    setDocument(c.document);
    setPhone(c.phone);
    setWhatsapp(c.whatsapp);
    setEmail(c.email);
    setAddress(c.address);
    setCity(c.city);
    setState(c.state);
    setZipCode(c.zipCode);
    setNotes(c.notes || '');
    setShowEditModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !document.trim()) {
      alert('Nome e Documento (CPF/CNPJ) são campos obrigatórios.');
      return;
    }
    addClient({
      type,
      name,
      document,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      zipCode,
      notes
    });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!name.trim() || !document.trim()) {
      alert('Nome e Documento (CPF/CNPJ) são obrigatórios.');
      return;
    }
    updateClient({
      ...editingClient,
      type,
      name,
      document,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      zipCode,
      notes
    });
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight">Gerenciamento de Clientes</h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Cadastre novos clientes (Pessoa Física ou Jurídica) e acompanhe seu histórico completo de compras.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className={`px-4 py-2 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Main Section split: List & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clients List panel */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm space-y-4`}>
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome, documento, e-mail ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-1 transition-all ${
                isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-3xs font-mono uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                  <th className="py-3 px-2">Tipo</th>
                  <th className="py-3 px-2">Razão / Nome</th>
                  <th className="py-3 px-2">CPF / CNPJ</th>
                  <th className="py-3 px-2">Cidade/UF</th>
                  <th className="py-3 px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500">Nenhum cliente correspondente encontrado.</td>
                  </tr>
                ) : (
                  filteredClients.map(c => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedClient(c)}
                      className={`text-xs cursor-pointer transition-colors ${
                        selectedClient?.id === c.id 
                          ? (isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-50 text-indigo-700') 
                          : (isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-800')
                      }`}
                    >
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                          c.type === 'PJ' 
                            ? (isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20')
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium truncate max-w-[150px]">{c.name}</td>
                      <td className="py-3 px-2 font-mono text-2xs text-slate-500">{c.document}</td>
                      <td className="py-3 px-2 text-slate-500">{c.city} - {c.state}</td>
                      <td className="py-3 px-2 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedClient(c)}
                          className={`p-1 rounded hover:bg-slate-500/10 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'} cursor-pointer`}
                          title="Visualizar Detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className={`p-1 rounded hover:bg-opacity-10 text-xs shrink-0 cursor-pointer ${isDark ? 'text-cyan-400 hover:bg-cyan-500/10' : 'text-indigo-400 hover:bg-indigo-500/10'}`}
                          title="Editar Cliente"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Client details panel */}
        <div className="space-y-6">
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
            {selectedClient ? (
              <div className="space-y-5">
                <div className="border-b border-slate-800/10 pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display font-bold text-base tracking-tight leading-snug">{selectedClient.name}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-4xs font-mono uppercase ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400'}`}>{selectedClient.type}</span>
                  </div>
                  <p className="text-2xs font-mono text-slate-500 mt-1">ID: {selectedClient.id}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-mono text-slate-300">CNPJ/CPF: {selectedClient.document}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Whats: <strong className="text-emerald-500">{selectedClient.whatsapp || 'Não informado'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">Email: {selectedClient.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <span>Endereço: {selectedClient.address}, {selectedClient.city}/{selectedClient.state}</span>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className={`p-2.5 rounded-lg border text-2xs ${isDark ? 'bg-[#1A1A1E] border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block font-semibold text-slate-500 uppercase tracking-wider font-mono text-3xs mb-0.5">Observações:</span>
                    {selectedClient.notes}
                  </div>
                )}

                {/* Purchase History section */}
                <div className="space-y-2 border-t border-slate-800/10 pt-4">
                  <h4 className={`text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-cyan-400' : 'text-indigo-400'}`}>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Histórico de Compras ({selectedClientPurchases.length})</span>
                  </h4>
                  
                  {selectedClientPurchases.length === 0 ? (
                    <p className="text-2xs text-slate-500 italic py-2">Nenhum pedido anterior registrado para este cliente.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedClientPurchases.map(os => (
                        <div key={os.id} className={`p-2 rounded-lg border flex justify-between items-center ${isDark ? 'bg-[#1A1A1E] border-white/5' : 'bg-slate-50/80 border-slate-200'}`}>
                          <div>
                            <p className="text-2xs font-semibold leading-tight">OS #{os.osNumber} — {os.product}</p>
                            <p className="text-3xs text-slate-500 leading-none mt-1 font-mono">{os.entryDate} • Qtd: {os.qty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xs font-mono font-bold leading-tight">R$ {os.value.toFixed(2)}</p>
                            <span className={`text-4xs font-mono px-1 py-0.2 rounded mt-0.5 block ${
                              os.currentStage === 'concluido' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                            }`}>{os.currentStage.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-600" />
                <h4 className="font-semibold text-xs text-slate-400">Nenhum Cliente Selecionado</h4>
                <p className="text-2xs max-w-[200px] mx-auto">Clique em um cliente na tabela para verificar seus dados detalhados e seu histórico de ordens.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-xl p-6 rounded-2xl border text-sm shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-display font-bold tracking-tight">Cadastrar Novo Cliente</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Tipo de Pessoa</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClientType)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="PJ">PJ (Pessoa Jurídica)</option>
                    <option value="PF">PF (Pessoa Física)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">CPF / CNPJ</label>
                  <input
                    type="text"
                    required
                    placeholder={type === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'}
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Razão Social / Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do Cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Telefone</label>
                  <input
                    type="text"
                    placeholder="(85) 3222-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(85) 99999-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">E-mail</label>
                  <input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Logradouro / Endereço</label>
                <input
                  type="text"
                  placeholder="Av. Santos Dumont, 1000 - Apto 202"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Cidade</label>
                  <input
                    type="text"
                    placeholder="Fortaleza"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Estado (UF)</label>
                  <input
                    type="text"
                    placeholder="CE"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">CEP</label>
                  <input
                    type="text"
                    placeholder="60000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Observações Internas</label>
                <textarea
                  placeholder="Informações adicionais relevantes..."
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
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-xl p-6 rounded-2xl border text-sm shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-display font-bold tracking-tight">Editar Dados do Cliente</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Tipo de Pessoa</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClientType)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="PJ">PJ (Pessoa Jurídica)</option>
                    <option value="PF">PF (Pessoa Física)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">CPF / CNPJ</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Razão Social / Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do Cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Telefone</label>
                  <input
                    type="text"
                    placeholder="(85) 3222-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(85) 99999-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">E-mail</label>
                  <input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Logradouro / Endereço</label>
                <input
                  type="text"
                  placeholder="Av. Santos Dumont, 1000 - Apto 202"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Cidade</label>
                  <input
                    type="text"
                    placeholder="Fortaleza"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Estado (UF)</label>
                  <input
                    type="text"
                    placeholder="CE"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">CEP</label>
                  <input
                    type="text"
                    placeholder="60000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Observações Internas</label>
                <textarea
                  placeholder="Informações adicionais..."
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
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
