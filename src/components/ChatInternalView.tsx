import React, { useState, useMemo, useEffect } from 'react';
import { Send, MessageSquare, Clock, Bot, Sparkles, Paperclip, FileText } from 'lucide-react';
import { ChatInternalMessage, User, UserRole } from '../types';

interface ChatInternalViewProps {
  chatInternal: ChatInternalMessage[];
  sendInternalMessage: (
    receiverRole: UserRole, 
    content: string, 
    fileUrl?: string, 
    fileName?: string, 
    fileType?: string
  ) => void;
  markInternalMessagesRead: (senderRole: UserRole) => void;
  getRoleLabel: (role: UserRole) => string;
  activeUser: User | null;
  theme: 'claro' | 'escuro';
}

export default function ChatInternalView({
  chatInternal, sendInternalMessage, markInternalMessagesRead, getRoleLabel, activeUser, theme
}: ChatInternalViewProps) {
  const isDark = theme === 'escuro';

  const allRoles: UserRole[] = ['admin', 'atendimento', 'designer', 'impressao', 'producao', 'costura', 'finalizacao'];

  const targetRoles = useMemo(() => {
    const myRole = activeUser?.role || 'admin';
    return allRoles.filter(role => role !== myRole);
  }, [activeUser]);

  // Current selected thread role
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    const myRole = activeUser?.role || 'admin';
    const available = allRoles.filter(role => role !== myRole);
    return available[0] || 'admin';
  });

  const [inputMsg, setInputMsg] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; type: string } | null>(null);

  // Sync selectedRole if it becomes the user's own role (e.g., activeUser role shifts)
  useEffect(() => {
    const myRole = activeUser?.role || 'admin';
    if (selectedRole === myRole) {
      const available = allRoles.filter(role => role !== myRole);
      if (available.length > 0) {
        setSelectedRole(available[0]);
      }
    }
  }, [activeUser, selectedRole]);

  // Unread message counters per role for Current User
  const unreadCounts = useMemo(() => {
    const counts: { [key in UserRole]?: number } = {};
    const myRole = activeUser?.role || 'admin';
    chatInternal.forEach(msg => {
      if (!msg.isRead && msg.receiverRole === myRole) {
        counts[msg.senderRole] = (counts[msg.senderRole] || 0) + 1;
      }
    });
    return counts;
  }, [chatInternal, activeUser]);

  // Compute active conversation messages
  const activeMessages = useMemo(() => {
    if (!activeUser) return [];
    const myRole = activeUser.role;
    return chatInternal.filter(msg => 
      (msg.senderRole === myRole && msg.receiverRole === selectedRole) ||
      (msg.senderRole === selectedRole && msg.receiverRole === myRole)
    ).sort((a, b) => a.id.localeCompare(b.id)); // order by timestamp/id
  }, [chatInternal, activeUser, selectedRole]);

  const handleSendMessage = () => {
    if (!inputMsg.trim() && !attachedFile) return;
    sendInternalMessage(selectedRole, inputMsg.trim(), attachedFile?.url, attachedFile?.name, attachedFile?.type);
    setInputMsg('');
    setAttachedFile(null);
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    markInternalMessagesRead(role);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAttachedFile({
        url: base64String,
        name: file.name,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  // Preset templates to test communication with a single click
  const presets = [
    { label: 'Urgência de Insumos', text: 'Olá, o papel sublimático está acabando, precisamos que aprove uma nova compra urgente.' },
    { label: 'Dúvida na Estampa', text: 'A gola da camisa da Arena Sports será V ou redonda? O cliente mandou as duas opções.' },
    { label: 'Máquina em Manutenção', text: 'A calandra de prensa principal está oscilando a temperatura, chamei o técnico.' },
    { label: 'Lote Pronto', text: 'Lote de 100 abadás costurados e encaminhados para empacotamento.' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight">Canais de Comunicação Interna</h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Os canais estão liberados para todos os setores. Dialogue diretamente com qualquer departamento ou com a administração geral para alinhar a produção e enviar arquivos/modelos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SIDEBAR LIST (Now visible for Everyone) */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-2xs font-mono uppercase text-slate-500 tracking-wider">Setores Operacionais</h3>
          <div className="space-y-1">
            {targetRoles.map(role => {
              const isSel = selectedRole === role;
              const unread = unreadCounts[role] || 0;
              return (
                <button
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isSel 
                      ? (isDark ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-100')
                      : (isDark ? 'hover:bg-slate-950 text-slate-400' : 'hover:bg-slate-50 text-slate-600')
                  }`}
                >
                  <span>{getRoleLabel(role).split(' / ')[0]}</span>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-4xs font-bold animate-pulse">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CHAT BOARD (Takes 3 columns) */}
        <div className="md:col-span-3 flex flex-col h-[520px] rounded-2xl border overflow-hidden relative shadow-sm bg-slate-950/25 border-slate-850">
          
          {/* Chat Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-900/60 border-slate-850' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <div>
                <h4 className="font-semibold text-xs leading-none">
                  Canal com: {getRoleLabel(selectedRole)}
                </h4>
                <p className="text-4xs font-mono text-slate-500 mt-1 uppercase tracking-wider">Comunicação Direta Ativa</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 font-mono text-4xs border border-indigo-500/15">
              <Clock className="w-3 h-3" />
              <span>Real-Time</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {activeMessages.length === 0 ? (
              <div className="py-24 text-center text-slate-500 space-y-2">
                <Bot className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs font-semibold">Nenhuma mensagem nesta conversa.</p>
                <p className="text-2xs max-w-xs mx-auto text-slate-500">Seja o primeiro a enviar uma mensagem ou um arquivo de modelo para iniciar o alinhamento.</p>
              </div>
            ) : (
              activeMessages.map(msg => {
                const isMe = msg.senderRole === activeUser?.role;
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[75%] space-y-1 ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <div className="flex items-center gap-1.5 text-3xs font-mono text-slate-500">
                      <strong>{isMe ? 'Você' : msg.senderName}</strong>
                     <span
  className={`text-[10px] px-1 rounded uppercase scale-90 ${
    isDark
      ? "bg-slate-800 text-slate-300"
      : "bg-slate-200 text-slate-800"
  }`}
>
  {getRoleLabel(msg.senderRole).split(' / ')[0]}
</span>

<span
  className={isDark ? "text-slate-400" : "text-slate-600"}
>
  • {msg.timestamp}
</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : (isDark ? 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800' : 'bg-white text-slate-800 rounded-tl-none shadow-3xs border border-slate-100')
                    }`}>
                      {msg.content && <p>{msg.content}</p>}
                      
                      {msg.fileUrl && (
                        <div className={`p-2 rounded-xl mt-1.5 border flex flex-col gap-2 ${
                          isMe 
                            ? 'bg-indigo-700/50 border-indigo-500/30 text-white' 
                            : (isDark ? 'bg-slate-950/60 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800')
                        }`}>
                          {/* Render preview if it's an image */}
                          {(msg.fileType?.startsWith('image/') || msg.fileUrl.startsWith('data:image/')) ? (
                            <div className="relative group overflow-hidden rounded-lg max-h-48 border border-slate-800/20 bg-slate-900/40">
                              <img 
                                src={msg.fileUrl} 
                                alt={msg.fileName || 'Anexo'} 
                                className="w-full h-auto object-contain max-h-48 hover:scale-105 transition-all duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 py-1">
                              <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                              <div className="overflow-hidden">
                                <p className="text-3xs font-semibold truncate max-w-[200px]" title={msg.fileName}>
                                  {msg.fileName || 'Arquivo Anexo'}
                                </p>
                                <p className="text-4xs font-mono text-slate-500 uppercase">
                                  {msg.fileType?.split('/')[1] || 'Documento'}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Download Button */}
                          <a 
                            href={msg.fileUrl} 
                            download={msg.fileName || 'modelo_anexo'}
                            className="w-full py-1 bg-slate-950 hover:bg-slate-900 text-white text-4xs font-semibold rounded-md flex items-center justify-center gap-1 border border-slate-800/50 cursor-pointer shadow-sm transition-all"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Baixar Anexo ({msg.fileName?.substring(msg.fileName.lastIndexOf('.') + 1).toUpperCase() || 'ARQUIVO'})</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Preset Replies selector for testing */}
          <div className={`p-2.5 border-t border-b flex items-center gap-2 overflow-x-auto no-scrollbar ${
            isDark ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-4xs font-mono text-slate-500 shrink-0 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Testar Chat:
            </span>
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setInputMsg(p.text)}
                className={`px-2.5 py-1 rounded-lg text-3xs font-sans whitespace-nowrap transition-all border cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-750 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Send Input Area with file attachment support */}
          <div className={`p-3 border-t flex flex-col gap-2 ${
            isDark ? 'bg-slate-900/60 border-slate-850' : 'bg-white border-slate-200'
          }`}>
            {/* Attachment preview panel */}
            {attachedFile && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                  <span className="truncate max-w-[250px] text-3xs font-mono font-semibold" title={attachedFile.name}>
                    {attachedFile.name}
                  </span>
                  <span className="text-4xs font-mono text-slate-500">
                    ({(attachedFile.url.length * 0.75 / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button 
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-rose-500 hover:text-rose-400 text-3xs font-bold cursor-pointer hover:bg-rose-500/15 rounded-md transition-colors"
                >
                  Remover
                </button>
              </div>
            )}

            <div className="flex gap-2 items-center">
              {/* File input handler */}
              <label className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center border shrink-0 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-750' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`} title="Anexar arquivo do computador ou celular">
                <Paperclip className="w-4 h-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.zip,.rar,.txt,.xlsx,.doc,.docx"
                />
              </label>

              <input
                type="text"
                placeholder={attachedFile ? "Adicione um comentário ou pressione Enviar para mandar o arquivo..." : "Digite sua mensagem interna de produção..."}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className={`flex-1 px-3 py-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800'
                }`}
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-md hover:shadow-indigo-600/15"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
