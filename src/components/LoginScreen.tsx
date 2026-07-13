import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, KeyRound, User as UserIcon, ShieldAlert, Check } from 'lucide-react';
import { MOTIVATIONAL_PHRASES } from '../initialData';
import { UserRole } from '../types';

interface LoginScreenProps {
  login: (username: string, password?: string) => { success: boolean; message: string };
  theme: 'claro' | 'escuro';
}

export default function LoginScreen({ login, theme }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotHelper, setShowForgotHelper] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Logo URL from prompt specifications
  const logoUrl = 'https://github.com/MarceloGomes-Dev/LosGomes/blob/main/logo%20ts.png?raw=true';

  // Get current day of month (1 to 31) to pick the exact motivational phrase
  useEffect(() => {
    const today = new Date();
    const day = today.getDate(); // 1 - 31
    const idx = (day - 1) % MOTIVATIONAL_PHRASES.length;
    setPhraseIndex(idx);
  }, []);

  // Simple floating particles simulation
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);
  useEffect(() => {
    const initialParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      duration: Math.random() * 20 + 10
    }));
    setParticles(initialParticles);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('Por favor, informe seu usuário.');
      return;
    }

    const res = login(username, password);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Helper quick login credentials for standard accounts
  const quickLogins = [
    { label: 'Administração', user: 'admin', pass: '12345', role: 'admin' },
    { label: 'Atendimento', user: 'atendimento', pass: '12345', role: 'atendimento' },
    { label: 'Designer', user: 'designer', pass: '12345', role: 'designer' },
    { label: 'Impressão', user: 'impressao', pass: '12345', role: 'impressao' },
    { label: 'Produção', user: 'producao', pass: '12345', role: 'producao' },
    { label: 'Costura', user: 'costura', pass: '12345', role: 'costura' },
    { label: 'Finalização', user: 'finalizacao', pass: 'entrega', role: 'finalizacao' }
  ];

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    const res = login(u, p);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div id="login_page" className="dark relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#0A0A0C] text-[#E2E8F0] font-sans">
      
      {/* LEFT AREA: 70% Institutional with glassmorphic particles & motivational phrases */}
      <div className="relative w-full md:w-[70%] min-h-[40vh] md:min-h-screen flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#020617] to-black border-r border-white/5">
        
        {/* Animated Particles background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-cyan-400/60 blur-[1px]"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              animate={{
                y: ['0vh', '-100vh'],
                x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
          
          {/* Background Tech Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>

        {/* Top Header Logo & Name */}
        <div className="relative z-10 flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden"
          >
            <img 
              src={logoUrl} 
              alt="Logo TS" 
              className="h-16 w-auto drop-shadow-[0_0_25px_rgba(34,211,238,0.3)] object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white leading-tight uppercase">
              TECIDO SUBLIMADO FORTALEZA
            </h1>
            <p className="text-xs font-mono tracking-[0.2em] text-cyan-400 mt-1 uppercase">SUBLIGESTÃO ERP</p>
          </div>
        </div>

        {/* Center Motivational Area */}
        <div className="relative z-10 my-auto py-12 md:py-0 max-w-2xl">
          <motion.p 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-cyan-400/80 font-mono text-xs uppercase tracking-widest mb-3"
          >
            Frase do Dia • {new Date().getDate()} {new Date().toLocaleString('pt-BR', { month: 'short' })}
          </motion.p>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={phraseIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="h-[1px] w-12 bg-cyan-500/50 mb-6"></div>
              <h2 className="text-2xl md:text-3xl font-serif text-slate-200 leading-relaxed font-light">
                "{MOTIVATIONAL_PHRASES[phraseIndex]}"
                </h2>
              <p className="text-slate-500 text-xs tracking-widest uppercase block mt-4">
                Gestão Inteligente para Alta Performance Têxtil
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Meta */}
        <div className="relative z-10 flex items-center space-x-4 opacity-40">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan] animate-pulse"></div>
          <span className="text-xs font-mono tracking-tighter">SYSTEM STATUS: SECURE / ONLINE</span>
        </div>
      </div>

      {/* RIGHT AREA: 30% Modern Glassmorphic Login Block */}
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-[30%] min-h-[60vh] md:min-h-screen flex flex-col justify-between p-8 bg-[#111114] border-t md:border-t-0 md:border-l border-white/5 shadow-2xl relative z-10"
      >
        <div className="my-auto space-y-6">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Bem-vindo</h2>
            <p className="text-sm text-slate-500">Faça login com sua conta para acessar o SubliGestão</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold ml-1">Departamento / Usuário</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </span>
                <select
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1A1A1E] border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl text-sm text-white placeholder:text-slate-600 transition-all outline-none cursor-pointer"
                >
                  <option value="" className="text-slate-500">Selecione o Departamento</option>
                  <option value="admin" className="text-white">Administração</option>
                  <option value="atendimento" className="text-white">Atendimento</option>
                  <option value="designer" className="text-white">Designer</option>
                  <option value="impressao" className="text-white">Impressão</option>
                  <option value="producao" className="text-white">Produção</option>
                  <option value="costura" className="text-white">Costura</option>
                  <option value="finalizacao" className="text-white">Finalização</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold ml-1">Senha (Opcional)</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-cyan-400/80 cursor-pointer hover:text-cyan-400 focus:outline-none"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#1A1A1E] border border-white/5 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl text-sm text-white placeholder:text-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            {/* Remember Me and Forgot password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-450 select-none text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded border-white/10 bg-[#1A1A1E] text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-[#111114] w-4 h-4"
                />
                Lembrar acesso
              </label>
              <button
                type="button"
                onClick={() => setShowForgotHelper(true)}
                className="text-cyan-400/80 hover:text-cyan-400 font-mono transition-colors text-xs"
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all ripple-btn cursor-pointer flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              Entrar no Sistema
            </button>
          </form>

          {/* Quick login picker for evaluation */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <p className="text-4xs font-mono text-cyan-450 tracking-widest text-center uppercase">Acesso Rápido para Testes</p>
            <div className="grid grid-cols-2 gap-1.5">
              {quickLogins.map(ql => (
                <button
                  key={ql.user}
                  onClick={() => handleQuickLogin(ql.user, ql.pass)}
                  className="px-2 py-1.5 text-3xs bg-[#1A1A1E] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-950/20 rounded-xl text-slate-300 font-mono text-left transition-all leading-tight cursor-pointer"
                >
                  <span className="block font-semibold text-white">{ql.label}</span>
                  <span className="text-slate-500 block text-[9px]">User: {ql.user}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer details */}
        <div className="text-3xs font-mono text-slate-600 text-center flex justify-between items-center border-t border-white/5 pt-4">
          <span>v2.4.0-STABLE</span>
          <span className="tracking-tighter">© 2026 CREATOR MARCELO GOMES TSF</span>
        </div>
      </motion.div>

      {/* Forgot password helper Dialog */}
      {showForgotHelper && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-white text-lg">Recuperação de Acesso</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Por motivos de segurança e auditoria interna, as senhas dos colaboradores só podem ser resetadas diretamente pelo <strong>Administrador do ERP</strong>.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg text-2xs font-mono text-slate-400 border border-slate-800 mt-2 space-y-1">
                <p><strong>Admin Padrão:</strong> admin / 12345</p>
                <p>O Administrador possui acesso ao menu <strong>"Colaboradores"</strong> para cadastrar novas credenciais ou alterar as senhas existentes em tempo real.</p>
              </div>
            </div>
            <button
              onClick={() => setShowForgotHelper(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
