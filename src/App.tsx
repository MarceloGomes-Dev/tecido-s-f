import React, { useState } from 'react';
import { useERPState } from './useERPState';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import OrdersView from './components/OrdersView';
import KanbanBoard from './components/KanbanBoard';
import InventoryView from './components/InventoryView';
import EmployeesView from './components/EmployeesView';
import ChatInternalView from './components/ChatInternalView';
import FinanceView from './components/FinanceView';
import AdminSettingsView from './components/AdminSettingsView';

import { 
  Menu, X, Sun, Moon, Bell, LogOut, LayoutDashboard, Users, FileText, 
  Trello, Package, UserCheck, MessageSquare, DollarSign, Settings, Shield, ChevronRight 
} from 'lucide-react';

export default function App() {
  const state = useERPState();
  const { 
    activeUser, theme, login, logout, toggleTheme,
    users, clients, products, categories, rawMaterials, suppliers, osList, finances, chatInternal, logs, notifications,
    registerUser, updateUserStatus, addClient, updateClient, addProduct, updateProductStock, addRawMaterial, updateRawMaterialStock,
    addCategory, createOS, advanceOSStage, updateOSChecklistItem, addOSChatMessage, sendInternalMessage, markInternalMessagesRead,
    addFinancialRecord, updateOSPaymentInfo, updateOSInvoiceInfo, markAllNotificationsAsRead, resetDatabase, getStageLabel, getRoleLabel,
    monthlyGoal, updateMonthlyGoal, selectedGoalMonth, monthlyGoals, setSelectedGoalMonth, clearFaturamento
  } = state;

  const isDark = theme === 'escuro';

  // Sidebar mobile responsive toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active view tracking state
  const [activeTab, setActiveTab] = useState<string>(() => {
    return 'dashboard';
  });

  // Notifications dropdown toggler
  const [showNotifications, setShowNotifications] = useState(false);

  // Fallback to login if no session is active
  if (!activeUser) {
    return (
      <LoginScreen 
        login={login} 
        theme={theme} 
      />
    );
  }

  // Filter tabs list according to active user role permissions
  const tabs = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, roles: ['admin', 'atendimento'] },
    { id: 'kanban', label: 'Fluxo de produção', icon: Trello, roles: ['admin', 'atendimento', 'designer', 'impressao', 'producao', 'costura', 'finalizacao'] },
    { id: 'orders', label: 'Ordens de Serviço', icon: FileText, roles: ['admin', 'atendimento', 'designer', 'impressao', 'producao', 'costura', 'finalizacao'] },
    { id: 'clients', label: 'Clientes', icon: Users, roles: ['admin', 'atendimento'] },
    { id: 'inventory', label: 'Estoque', icon: Package, roles: ['admin', 'atendimento', 'producao'] },
    { id: 'finance', label: 'Financeiro e Faturamento', icon: DollarSign, roles: ['admin', 'atendimento'] },
    { id: 'employees', label: 'Colaboradores', icon: UserCheck, roles: ['admin'] },
    { id: 'chat', label: 'Mensagens Internas', icon: MessageSquare, roles: ['admin', 'atendimento', 'designer', 'impressao', 'producao', 'costura', 'finalizacao'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['admin'] }
  ];

  const allowedTabs = tabs.filter(t => t.roles.includes(activeUser.role));

  // Handle auto routing if the current selected tab isn't permitted for a new logged-in user
  const isTabAllowed = allowedTabs.some(t => t.id === activeTab);
  const currentTab = isTabAllowed ? activeTab : (allowedTabs[0]?.id || 'kanban');

  // Compute unread notifications
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`h-screen w-screen overflow-hidden font-sans flex transition-colors duration-300 ${isDark ? 'dark' : ''} ${
      isDark ? 'bg-[#0A0A0C] text-[#E2E8F0]' : 'bg-slate-50 text-black'
    }`}>
      
      {/* 1. SIDEBAR NAVIGATION - DESKTOP */}
      <aside className={`w-64 hidden lg:flex flex-col justify-between border-r shrink-0 ${
        isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'
      }`}>
        <div className="flex flex-col flex-1">
          {/* Company branding header with official logo url */}
          <div className="p-5 border-b flex items-center gap-3 border-slate-800/10 dark:border-white/5">
            <img 
              src="https://github.com/MarceloGomes-Dev/LosGomes/blob/main/logo%20ts.png?raw=true" 
              alt="Logo Tecido Sublimado Fortaleza" 
              className="h-10 w-auto rounded object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className={`font-display font-bold text-xs leading-none uppercase tracking-widest ${isDark ? 'text-cyan-400' : 'text-indigo-500'}`}>SubliGestão</h1>
              <p className="text-4xs font-mono text-slate-500 mt-1 uppercase tracking-widest leading-none">Fortaleza ERP</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            {allowedTabs.map(tab => {
              const Icon = tab.icon;
              const isSelected = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected 
                      ? (isDark ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-100')
                      : (isDark ? 'hover:bg-[#1A1A1E] text-slate-400' : 'hover:bg-slate-50 text-slate-600')
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isSelected ? (isDark ? 'text-cyan-400' : 'text-indigo-700') : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {isSelected && <ChevronRight className={`w-3.5 h-3.5 ml-auto ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Active Profile & Logout controls */}
        <div className="p-4 border-t border-slate-800/10 dark:border-white/5 space-y-3.5">
          <div className={`p-3 rounded-xl flex items-center gap-3 ${
            isDark ? 'bg-[#1A1A1E]' : 'bg-slate-50'
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${activeUser.avatarColor || (isDark ? 'bg-cyan-600 text-white' : 'bg-indigo-600 text-white')}`}>
              {activeUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate text-2xs">
              <h4 className="font-semibold truncate leading-tight text-slate-800 dark:text-slate-200">{activeUser.name}</h4>
              <span className="text-slate-500 font-mono text-3xs uppercase tracking-wider">{getRoleLabel(activeUser.role).split(' / ')[0]}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-600/15 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* 2. SIDEBAR NAVIGATION - MOBILE DRAWER (Framer motion styled) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/85 z-40 lg:hidden flex">
          <div className={`w-64 h-full flex flex-col justify-between border-r p-5 shadow-2xl animate-slide-in ${
            isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'
          }`}>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800/10 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://github.com/MarceloGomes-Dev/LosGomes/blob/main/logo%20ts.png?raw=true" 
                    alt="Logo" 
                    className="h-8 w-auto rounded object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <h1 className={`font-display font-bold text-sm tracking-tight ${isDark ? 'text-cyan-400' : 'text-indigo-500'}`}>SubliGestão</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="space-y-1">
                {allowedTabs.map(tab => {
                  const Icon = tab.icon;
                  const isSelected = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected 
                          ? (isDark ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-100')
                          : (isDark ? 'hover:bg-[#1A1A1E] text-slate-400' : 'hover:bg-slate-50 text-slate-600')
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${isSelected ? (isDark ? 'text-cyan-400' : 'text-indigo-700') : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Profile footer inside mobile drawer */}
            <div className="space-y-3 pt-4 border-t border-slate-800/10 dark:border-white/5">
              <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-[#1A1A1E]' : 'bg-slate-50'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${activeUser.avatarColor || (isDark ? 'bg-cyan-600 text-white' : 'bg-indigo-600 text-white')}`}>
                  {activeUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-xs leading-none truncate">{activeUser.name}</h4>
                  <span className="text-slate-500 font-mono text-4xs uppercase tracking-wider block mt-1">{getRoleLabel(activeUser.role).split(' / ')[0]}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-600/15 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do Sistema</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Utilities Panel */}
        <header className={`p-4 border-b flex items-center justify-between z-10 shrink-0 ${
          isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-100'
        }`}>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 lg:hidden rounded hover:bg-slate-800/10 text-slate-500 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Header Title with Motivational quote block */}
            <div className="hidden sm:block">
              <span className="text-3xs font-mono uppercase text-slate-500 tracking-wider">Módulo Ativo</span>
              <h2 className="font-display font-bold text-sm tracking-tight capitalize">{tabs.find(t => t.id === currentTab)?.label || 'Painel'}</h2>
            </div>
          </div>

          {/* Slogan ticker / Motivational quotes panel */}
          <div className="hidden md:flex flex-1 mx-8 justify-center max-w-lg text-center truncate">
            <span className={`text-2xs font-mono italic ${isDark ? 'text-cyan-400' : 'text-indigo-500'}`}>
              {/*"Módulo Ativo"*/}
            </span>
          </div>

          {/* Right Action Suite (theme toggle, alert center, user profile details) */}
          <div className="flex items-center gap-3 text-xs">
            
            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                isDark ? 'border-white/5 hover:bg-[#1A1A1E] text-amber-400' : 'border-slate-200 hover:bg-slate-50 text-indigo-600'
              }`}
              title="Alternar tema de cores"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification alert center dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllNotificationsAsRead();
                }}
                className={`p-2 rounded-xl border cursor-pointer transition-colors relative ${
                  isDark ? 'border-white/5 hover:bg-[#1A1A1E] text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 text-white rounded-full text-4xs font-bold flex items-center justify-center animate-bounce ${isDark ? 'bg-cyan-500' : 'bg-rose-500'}`}>
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Dropdown panel */}
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 p-4 rounded-xl border shadow-2xl z-20 space-y-3.5 ${
  isDark ? 'bg-[#111114] border-white/10' : 'bg-white border-slate-200 text-slate-850'
}`}>
  <div className="flex justify-between items-center border-b border-slate-800/20 dark:border-white/5 pb-2">
    <h3 className={`font-display font-bold text-2xs uppercase tracking-wider ${
      isDark ? 'text-white' : 'text-slate-900'
    }`}>
      Alertas Recentes
    </h3>

    <button 
      onClick={() => setShowNotifications(false)} 
      className="text-4xs text-slate-500 hover:underline cursor-pointer"
    >
      Fechar
    </button>
  </div>
  
  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
    {notifications.length === 0 ? (
      <p className="text-3xs text-slate-500 italic text-center py-6">
        Nenhum alerta pendente.
      </p>
    ) : (
      notifications.map(notif => (
        <div 
          key={notif.id} 
          className={`p-2.5 rounded-xl border text-3xs font-mono space-y-1 ${
            isDark 
              ? 'bg-[#1A1A1E] border-white/5' 
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <p className={`font-bold leading-tight flex items-center gap-1.5 ${
            isDark ? 'text-slate-200' : 'text-slate-900'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isDark 
                ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' 
                : 'bg-indigo-400'
            }`} />
            {notif.title}
          </p>

          <p className={`font-sans leading-normal ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {notif.description}
          </p>

          <span className={`text-4xs block text-right mt-1 ${
            isDark ? 'text-slate-600' : 'text-slate-500'
          }`}>
            {notif.timestamp}
          </span>
        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick profile info summary */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800/10 dark:border-white/5">
              <span className="text-slate-400 font-bold font-mono uppercase text-3xs tracking-wider">
                {activeUser.name.split(' ')[0]}
              </span>
              <span className={`text-4xs font-mono px-1.5 py-0.2 rounded uppercase ${isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                {getRoleLabel(activeUser.role).split(' / ')[0]}
              </span>
            </div>

          </div>

        </header>

        {/* Dynamic content rendering frame based on activeTab */}
        <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
          {currentTab === 'dashboard' && (
            <DashboardView 
              osList={osList} 
              clients={clients}
              users={users}
              finances={finances} 
              theme={theme} 
              monthlyGoal={monthlyGoal}
              selectedGoalMonth={selectedGoalMonth}
              monthlyGoals={monthlyGoals}
              setSelectedGoalMonth={setSelectedGoalMonth}
              clearFaturamento={clearFaturamento}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView 
              clients={clients} 
              osList={osList}
              addClient={addClient} 
              updateClient={updateClient} 
              theme={theme} 
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView 
              osList={osList} 
              clients={clients} 
              products={products} 
              categories={categories} 
              users={users} 
              createOS={createOS} 
              advanceOSStage={advanceOSStage} 
              updateOSChecklistItem={updateOSChecklistItem} 
              addOSChatMessage={addOSChatMessage} 
              getStageLabel={getStageLabel} 
              activeUser={activeUser} 
              theme={theme} 
              updateOSPaymentInfo={updateOSPaymentInfo}
              updateOSInvoiceInfo={updateOSInvoiceInfo}
              addTransaction={addFinancialRecord}
            />
          )}

          {currentTab === 'kanban' && (
            <KanbanBoard 
              osList={osList} 
              users={users} 
              advanceOSStage={advanceOSStage} 
              getStageLabel={getStageLabel} 
              activeUser={activeUser}
              theme={theme} 
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView 
              products={products} 
              categories={categories} 
              rawMaterials={rawMaterials} 
              suppliers={suppliers} 
              addProduct={addProduct} 
              updateProductStock={updateProductStock} 
              addRawMaterial={addRawMaterial} 
              updateRawMaterialStock={updateRawMaterialStock} 
              addCategory={addCategory} 
              theme={theme} 
            />
          )}

          {currentTab === 'finance' && (
            <FinanceView 
              transactions={finances} 
              osList={osList} 
              users={users} 
              addTransaction={addFinancialRecord} 
              theme={theme} 
              activeUser={activeUser}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesView 
              users={users} 
              registerUser={registerUser} 
              updateUserStatus={updateUserStatus} 
              getRoleLabel={getRoleLabel} 
              theme={theme} 
            />
          )}

          {currentTab === 'chat' && (
            <ChatInternalView 
              chatInternal={chatInternal} 
              sendInternalMessage={sendInternalMessage} 
              markInternalMessagesRead={markInternalMessagesRead} 
              getRoleLabel={getRoleLabel} 
              activeUser={activeUser} 
              theme={theme} 
            />
          )}

          {currentTab === 'settings' && (
            <AdminSettingsView 
              logs={logs} 
              users={users} 
              clearLogs={() => {
                localStorage.setItem('erp_logs', JSON.stringify([]));
                window.location.reload();
              }} 
              theme={theme} 
              setTheme={(t) => {
                toggleTheme();
              }} 
              monthlyGoal={monthlyGoal}
              updateMonthlyGoal={updateMonthlyGoal}
              selectedGoalMonth={selectedGoalMonth}
              monthlyGoals={monthlyGoals}
              setSelectedGoalMonth={setSelectedGoalMonth}
            />
          )}
        </main>

      </div>

    </div>
  );
}
