import React, { useState, useMemo } from 'react';
import { 
  Package, Layers, AlertOctagon, Archive, ArrowUpDown, Plus, 
  MapPin, Phone, Mail, Edit3, Trash2, Check, ShoppingBag, ShieldAlert, BadgeAlert 
} from 'lucide-react';
import { Product, Category, RawMaterial, Supplier } from '../types';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProductStock: (id: string, newStock: number) => void;
  addRawMaterial: (raw: Omit<RawMaterial, 'id'>) => void;
  updateRawMaterialStock: (id: string, delta: number) => void;
  addCategory: (name: string, description?: string) => void;
  theme: 'claro' | 'escuro';
}

export default function InventoryView({
  products, categories, rawMaterials, suppliers, addProduct, updateProductStock,
  addRawMaterial, updateRawMaterialStock, addCategory, theme
}: InventoryViewProps) {
  const isDark = theme === 'escuro';
  const [activeTab, setActiveTab] = useState<'products' | 'raw_materials' | 'suppliers'>('products');

  // Search filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showRawMaterialModal, setShowRawMaterialModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Form states - Product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodSku, setProdSku] = useState('');
  const [prodStock, setProdStock] = useState(100);
  const [prodUnit, setProdUnit] = useState('unidade');
  const [prodProductionCost, setProdProductionCost] = useState<number>(0);
  const [prodProductionTime, setProdProductionTime] = useState<number>(0);

  // Form states - RawMaterial
  const [rawName, setRawName] = useState('');
  const [rawStock, setRawStock] = useState(10);
  const [rawMinStock, setRawMinStock] = useState(3);
  const [rawUnit, setRawUnit] = useState('rolo');
  const [rawSupplier, setRawSupplier] = useState('');

  // Form states - Category
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Stock edit states
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState(0);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Filtered Raw Materials
  const filteredRawMaterials = useMemo(() => {
    return rawMaterials.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawMaterials, searchQuery]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  // Handle Product Submits
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSku) return;
    addProduct({
      name: prodName,
      category: prodCategory || 'Eventos',
      price: prodPrice,
      sku: prodSku,
      stock: prodStock,
      unit: prodUnit,
      productionCost: prodProductionCost,
      productionTime: prodProductionTime
    });
    setShowProductModal(false);
    setProdName('');
    setProdSku('');
    setProdPrice(0);
    setProdProductionCost(0);
    setProdProductionTime(0);
  };

  // Handle Raw Material submits
  const handleAddRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawName) return;
    addRawMaterial({
      name: rawName,
      stock: rawStock,
      minStock: rawMinStock,
      unit: rawUnit,
      supplier: rawSupplier || 'Fortal Tecidos'
    });
    setShowRawMaterialModal(false);
    setRawName('');
  };

  // Handle Category submits
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    addCategory(catName, catDesc);
    setShowCategoryModal(false);
    setCatName('');
    setCatDesc('');
  };

  const handleSaveStockUpdate = (pId: string) => {
    updateProductStock(pId, editingStockValue);
    setEditingStockId(null);
  };

  // Low stock warning list for raw materials
  const lowStockRawMaterials = useMemo(() => {
    return rawMaterials.filter(r => r.stock < r.minStock);
  }, [rawMaterials]);

  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight">Estoque & Matéria-Prima</h2>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Controle de bobinas de papel sublimático, tintas sublimáticas EPSON por litro, tecidos poliéster em rolos e catálogo de produtos finalizados.
          </p>
        </div>

        {/* Dynamic button depending on active tab */}
        <div className="flex flex-wrap gap-2">
          {activeTab === 'products' && (
            <>
              <button
                onClick={() => setShowCategoryModal(true)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-white/5 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Nova Categoria</span>
              </button>
              <button
                onClick={() => setShowProductModal(true)}
                className={`px-4 py-2 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Produto</span>
              </button>
            </>
          )}

          {activeTab === 'raw_materials' && (
            <button
              onClick={() => setShowRawMaterialModal(true)}
              className={`px-4 py-2 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Low stock alerts dashboard band */}
      {lowStockRawMaterials.length > 0 && activeTab === 'raw_materials' && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-3">
          <BadgeAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-xs text-rose-500 uppercase tracking-wider font-mono">Alerta de Reposição Crítica</h4>
            <p className="text-2xs text-slate-400 leading-relaxed">
              As seguintes matérias-primas estão abaixo do estoque de segurança configurado e precisam ser adquiridas dos fornecedores homologados:
            </p>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {lowStockRawMaterials.map(r => (
                <span key={r.id} className="text-3xs font-mono bg-red-500/15 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full font-bold">
                  {r.name} • Estoque: {r.stock} {r.unit} (Min: {r.minStock})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs navigation panel */}
      <div className="flex border-b border-slate-800/10 gap-4 text-xs font-semibold">
        <button
          onClick={() => { setActiveTab('products'); setSearchQuery(''); }}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'products' ? (isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-indigo-500 border-b-2 border-indigo-500') : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produtos & Catálogo ({products.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('raw_materials'); setSearchQuery(''); }}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'raw_materials' ? (isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-indigo-500 border-b-2 border-indigo-500') : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Matérias-primas / Insumos ({rawMaterials.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('suppliers'); setSearchQuery(''); }}
          className={`pb-3.5 px-1 relative transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'suppliers' ? (isDark ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-indigo-500 border-b-2 border-indigo-500') : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Fornecedores Credenciados ({suppliers.length})</span>
        </button>
      </div>

      {/* Sub Search Bar */}
      <div className="relative text-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Layers className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Pesquisar na listagem de ${
            activeTab === 'products' ? 'produtos e SKUs' :
            activeTab === 'raw_materials' ? 'insumos e bobinas' : 'fornecedores'
          }...`}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none focus:ring-1 transition-all ${
            isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500 focus:border-cyan-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* TAB 1: PRODUCTS LIST */}
      {activeTab === 'products' && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-3xs font-mono uppercase tracking-wider ${isDark ? 'border-slate-800/20 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                  <th className="py-3 px-2">SKU / Referência</th>
                  <th className="py-3 px-2">Nome do Produto</th>
                  <th className="py-3 px-2">Categoria</th>
                  <th className="py-3 px-2">Preço Venda</th>
                  <th className="py-3 px-2">Custo Prod.</th>
                  <th className="py-3 px-2">Margem</th>
                  <th className="py-3 px-2">Tempo Fabr.</th>
                  <th className="py-3 px-2">Qtd Estoque</th>
                  <th className="py-3 px-2 text-right">Ação Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/10 text-xs">
                {filteredProducts.map(p => {
                  const pCost = p.productionCost || 0;
                  const profit = p.price - pCost;
                  const marginPercent = p.price > 0 ? (profit / p.price) * 100 : 0;
                  return (
                    <tr key={p.id} className={isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-800'}>
                      <td className="py-4 px-2 font-mono text-2xs text-slate-500 font-bold">{p.sku}</td>
                      <td className="py-4 px-2 font-medium">{p.name}</td>
                      <td className="py-4 px-2 text-slate-400">
                        <span className={`px-2 py-0.5 rounded text-3xs ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' : 'bg-indigo-500/10 text-indigo-400'}`}>{p.category}</span>
                      </td>
                      <td className="py-4 px-2 font-mono font-semibold text-emerald-500">R$ {p.price.toFixed(2)}</td>
                      <td className="py-4 px-2 font-mono text-rose-500">
                        {p.productionCost !== undefined ? `R$ ${p.productionCost.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="py-4 px-2 font-mono text-2xs text-slate-400">
                        {p.productionCost !== undefined ? (
                          <span className={profit > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            R$ {profit.toFixed(2)} ({marginPercent.toFixed(0)}%)
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="py-4 px-2 font-mono text-slate-400">
                        {p.productionTime !== undefined ? `${p.productionTime} min` : 'N/A'}
                      </td>
                      <td className="py-4 px-2">
                        {editingStockId === p.id ? (
                          <input
                            type="number"
                            value={editingStockValue}
                            onChange={(e) => setEditingStockValue(parseInt(e.target.value) || 0)}
                            className={`w-16 p-1 rounded border text-center ${isDark ? 'bg-[#1A1A1E] border-white/5 text-white' : 'bg-slate-50 border-slate-200'}`}
                          />
                        ) : (
                          <span className={`font-semibold font-mono ${p.stock < 100 ? 'text-amber-500' : (isDark ? 'text-cyan-400' : 'text-emerald-400')}`}>
                            {p.stock} {p.unit}s
                          </span>
                        )}
                      </td>
                    <td className="py-4 px-2 text-right">
                      {editingStockId === p.id ? (
                        <button
                          onClick={() => handleSaveStockUpdate(p.id)}
                          className={`px-2 py-1 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white rounded text-2xs font-semibold cursor-pointer`}
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStockId(p.id);
                            setEditingStockValue(p.stock);
                          }}
                          className={`${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-indigo-400 hover:text-indigo-300'} hover:underline text-2xs cursor-pointer font-semibold`}
                        >
                          Ajustar Estoque
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RAW MATERIALS */}
      {activeTab === 'raw_materials' && (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-100'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-3xs font-mono uppercase tracking-wider ${isDark ? 'border-slate-800/20 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                  <th className="py-3 px-2">Insumo</th>
                  <th className="py-3 px-2">Estoque Atual</th>
                  <th className="py-3 px-2">Mínimo Segurança</th>
                  <th className="py-3 px-2">Unidade de Medida</th>
                  <th className="py-3 px-2">Fornecedor Padrão</th>
                  <th className="py-3 px-2 text-right">Modificar (+/-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/10 text-xs">
                {filteredRawMaterials.map(r => {
                  const isBelowMin = r.stock < r.minStock;
                  return (
                    <tr key={r.id} className={isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-800'}>
                      <td className="py-4 px-2 font-semibold">
                        <span className="flex items-center gap-1.5">
                          {isBelowMin && <AlertOctagon className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                          <span>{r.name}</span>
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          isBelowMin ? 'bg-red-500/10 text-red-500' : (isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-500')
                        }`}>
                          {r.stock}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-mono text-slate-500">{r.minStock}</td>
                      <td className="py-4 px-2 font-mono text-slate-500 capitalize">{r.unit}</td>
                      <td className="py-4 px-2 text-slate-400">{r.supplier}</td>
                      <td className="py-4 px-2 text-right space-x-1">
                        <button
                          onClick={() => updateRawMaterialStock(r.id, -1)}
                          className={`px-2 py-0.5 ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'} hover:bg-opacity-20 rounded font-mono font-bold text-2xs cursor-pointer`}
                          title="Remover 1 unidade"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateRawMaterialStock(r.id, 1)}
                          className={`px-2 py-0.5 ${isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'} hover:bg-opacity-20 rounded font-mono font-bold text-2xs cursor-pointer`}
                          title="Adicionar 1 unidade"
                        >
                          +1
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map(s => (
            <div 
              key={s.id} 
              className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm ${
                isDark ? 'bg-[#111114] border-white/5 shadow-2xl' : 'bg-white border-slate-200'
              }`}
            >
              <div className="border-b border-slate-800/10 pb-3">
                <h4 className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">{s.name}</h4>
                <p className="text-3xs font-mono text-slate-500 mt-1">CNPJ: {s.document}</p>
              </div>

              <div className="space-y-2 text-xs">
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{s.phone}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-400">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{s.email}</span>
                </p>
                <p className="flex items-start gap-1.5 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span>{s.address}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/10 text-3xs font-mono text-slate-500">
                Parceiro de insumos homologado homologado pelo departamento financeiro.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT DIALOG */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-sm shadow-2xl space-y-4 ${
            isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-display font-bold tracking-tight">Adicionar Produto ao Catálogo</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abadá de Poliéster Premium"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Categoria</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Código SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABD-POL-PREM"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Preço Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Estoque Inicial</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Unidade</label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Custo Estimado Prod. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodProductionCost}
                    onChange={(e) => setProdProductionCost(parseFloat(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Tempo Fabr. Médio (min)</label>
                  <input
                    type="number"
                    required
                    value={prodProductionTime}
                    onChange={(e) => setProdProductionTime(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
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
                  Confirmar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAW MATERIAL DIALOG */}
      {showRawMaterialModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-sm shadow-2xl space-y-4 ${
            isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-display font-bold tracking-tight">Adicionar Novo Insumo</h3>
            <form onSubmit={handleAddRawMaterial} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Nome da Matéria-Prima</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tecido Malha PP (Rolo 50m)"
                  value={rawName}
                  onChange={(e) => setRawName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Qtd em Estoque</label>
                  <input
                    type="number"
                    required
                    value={rawStock}
                    onChange={(e) => setRawStock(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Estoque Mínimo</label>
                  <input
                    type="number"
                    required
                    value={rawMinStock}
                    onChange={(e) => setRawMinStock(parseInt(e.target.value) || 0)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">Medida</label>
                  <input
                    type="text"
                    required
                    placeholder="rolo, bobina, litro"
                    value={rawUnit}
                    onChange={(e) => setRawUnit(e.target.value)}
                    className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                      isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Fornecedor Preferencial</label>
                <select
                  value={rawSupplier}
                  onChange={(e) => setRawSupplier(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="">Selecione o Fornecedor...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRawMaterialModal(false)}
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
                  Adicionar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY DIALOG */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-2xl border text-sm shadow-2xl space-y-4 ${
            isDark ? 'bg-[#111114] border-white/5' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-display font-bold tracking-tight">Criar Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abadás de Eventos"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-mono">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Detalhamento operational da linha de itens..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-[#1A1A1E] border-white/5 text-white focus:ring-cyan-500' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className={`flex-1 py-2 border rounded-xl text-xs font-semibold ${
                    isDark ? 'border-white/5 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 ${isDark ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-xs font-semibold`}
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
