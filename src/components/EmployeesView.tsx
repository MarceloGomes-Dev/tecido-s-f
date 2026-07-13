import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Mail, Phone, Lock, Eye, EyeOff, UserPlus, UserX, UserCheck, KeyRound } from 'lucide-react';

interface EmployeesViewProps {
  users: User[];
  registerUser: (colab: Omit<User, 'id' | 'avatarColor'>, initialPassword?: string) => void;
  updateUserStatus: (userId: string, status: 'Ativo' | 'Inativo') => void;
  getRoleLabel: (role: UserRole) => string;
  theme: 'claro' | 'escuro';
}

export default function EmployeesView({ users, registerUser, updateUserStatus, getRoleLabel, theme }: EmployeesViewProps) {
  const isDark = theme === 'escuro';

  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('atendimento');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleOpenAddModal = () => {
    setName('');
    setCpf('');
    setPhone('');
    setEmail('');
    setRole('atendimento');
    setUsername('');
    setPassword('');
    setShowAddModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      alert('Nome, Usuário e Senha são obrigatórios.');
      return;
    }

    // Register user details
    registerUser({
      name,
      cpf,
      phone,
      email,
      role,
      username: username.toLowerCase().trim(),
      status: 'Ativo'
    }, password);

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight">Equipe & Colaboradores</h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gerencie perfis, controle cargos, e visualize permissões de acesso aos canais de produção.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className={`px-4 py-2 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Employees Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => {
          const isActive = u.status === 'Ativo';
          return (
            <div 
              key={u.id} 
              className={`p-5 rounded-2xl border flex flex-col justify-between gap-5 shadow-sm relative overflow-hidden transition-all ${
                isDark ? 'bg-[#111114] border-white/5 hover:bg-[#1A1A1E]' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-start gap-3">
                {/* Photo or avatar initials */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-inner shrink-0 ${u.avatarColor || 'bg-indigo-600 text-white'}`}>
                  {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1 truncate">
                  <h3 className="font-display font-bold text-sm leading-tight text-slate-800 dark:text-slate-100 truncate">{u.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-3xs font-mono uppercase px-2 py-0.5 rounded font-bold border ${isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/15' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15'}`}>
                    <Shield className="w-3 h-3" />
                    {getRoleLabel(u.role)}
                  </span>
                </div>

                {/* Active / Inactive dot */}
                <span className={`w-2.5 h-2.5 rounded-full absolute top-5 right-5 ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>

              {/* Body contacts */}
              <div className="space-y-2 text-xs text-slate-500 border-t border-b border-slate-800/10 py-3">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="truncate">{u.email || 'Sem email cadastrado'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>{u.phone || 'Sem telefone'}</span>
                </p>
                <p className="flex items-center gap-2 font-mono text-3xs text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Login: <strong>{u.username}</strong></span>
                </p>
              </div>

              {/* Footer controls: enable/disable */}
              <div className="flex items-center justify-between">
                <span className={`text-4xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  Status: {u.status}
                </span>

                <button
                  onClick={() => updateUserStatus(u.id, isActive ? 'Inativo' : 'Ativo')}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isActive 
                      ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/15' 
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/15'
                  }`}
                >
                  {isActive ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Desativar</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Reativar</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-sm shadow-2xl space-y-4 ${
            isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-display font-bold tracking-tight">Adicionar Novo Colaborador</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do funcionário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Telefone</label>
                  <input
                    type="text"
                    placeholder="(85) 99999-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">E-mail</label>
                <input
                  type="email"
                  placeholder="colaborador@fortalezatecido.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Setor / Cargo *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="admin">Administrador (Total)</option>
                  <option value="atendimento">Atendimento / Comercial</option>
                  <option value="designer">Designer / Arte final</option>
                  <option value="impressao">Impressão</option>
                  <option value="producao">Prensagem / Calandra</option>
                  <option value="costura">Costura / Confecção</option>
                  <option value="finalizacao">Expedição / Entrega</option>
                </select>
              </div>

              <div className="border-t border-slate-800/15 pt-3 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Usuário Login *</label>
                  <input
                    type="text"
                    required
                    placeholder="usuario.login"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Senha de Acesso *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pr-8 p-2.5 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 border rounded-xl text-xs font-semibold ${
                    isDark ? 'border-white/5 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold`}
                >
                  Confirmar Contratação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
