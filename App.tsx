
import React, { useState, useEffect, useRef } from 'react';
import {
  PlusIcon, TrashIcon, SparklesIcon, PrinterIcon,
  ArrowPathIcon, DocumentTextIcon, BuildingOfficeIcon,
  CpuChipIcon, ShieldCheckIcon, CloudArrowUpIcon,
  ArchiveBoxIcon, DocumentDuplicateIcon, ArrowDownTrayIcon,
  HomeIcon, GlobeAltIcon, ArrowUpTrayIcon, EnvelopeIcon,
  CheckCircleIcon, XMarkIcon, ArrowDownIcon, UserGroupIcon,
  IdentificationIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { LicenseItem, ReportData } from './types';
import ReportPreview from './components/ReportPreview';
import SmartTechLogo from './components/SmartTechLogo';

const initialData: ReportData = {
  id: Date.now().toString(),
  reportNumber: '001/2025',
  processRef: 'Processo Licitatório nº 084/2025',
  pregaoRef: 'Pregão Eletrônico nº 046/2025',
  contractRef: 'Contrato nº 001/2025',
  date: new Date().toISOString().split('T')[0],
  contratante: {
    name: 'PREFEITURA MUNICIPAL DE IPANEMA/MG',
    address: 'Avenida Sete de Setembro, nº 2155 – Bairro Centro, CEP 36.950-000 – MG',
    cnpj: '18.334.292/0001-64',
    representative: 'Júlio Fontoura de Moraes Júnior',
    cpf: '024.587.797-51'
  },
  contratada: {
    name: 'SMART EDU LTDA',
    address: 'Rua Coronel Constantino, nº 130 – Bairro Tabajaras, Uberlândia/MG, CEP 38.400-222',
    cnpj: '52.625.847/0001-65',
    representative: 'Carlos Henrique da Costa Carvalho',
    cpf: '060.541.786-52'
  },
  softwareDescription: 'software de gerenciamento integrado de dados educacionais (Frequência Escolar Facial e Web Ponto)',
  items: [
    {
      id: 'alunos-id',
      category: 'ALUNOS',
      quantity: '2.991',
      key: '102025-100FGE-RMG',
      description: 'Licença de aquisição perpétua de sistema informatizado, por aluno, para gerenciamento dos dados relativos à presença registrada nos dispositivos de autenticação da face e à educação municipal.'
    },
    {
      id: 'servidores-id',
      category: 'SERVIDORES',
      quantity: '450',
      key: '102025-100WPT-RMG',
      description: 'Licença de aquisição perpétua de sistema informatizado, por servidor, para gerenciamento dos dados relativos à presença registrada nos dispositivos de autenticação da face.'
    }
  ],
  techResponsible: { name: 'Antônio Alves Reis Neto', rg: '862086' },
  installation: {
    environment: 'Cloud',
    restrictedTo: 'Secretaria Municipal de Educação de Ipanema/MG',
    accessLink: 'https://ipanema.pontoid.com.br/'
  },
  credentials: {
    username: '02549389140.ipanema',
    password: '02549389140',
    city: 'Ipanema / MG'
  }
};

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(initialData);
  const [savedReports, setSavedReports] = useState<ReportData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('Geral');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoadingReports(true);
    setLoadError(null);
    fetch('/api/terms')
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar termos: ${res.status}`);
        return res.json() as Promise<ReportData[]>;
      })
      .then(reports => {
        setSavedReports(reports);
      })
      .catch(err => {
        console.error('Erro ao carregar termos:', err);
        setLoadError('Não foi possível carregar os termos. Verifique a conexão com o servidor.');
      })
      .finally(() => {
        setIsLoadingReports(false);
      });
  }, []);

  const handleUpdate = (path: string, value: any) => {
    const keys = path.split('.');
    setData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const updateItem = (id: string, field: keyof LicenseItem, value: string) => {
    const newItems = data.items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleUpdate('items', newItems);
  };

  const saveToDatabase = () => {
    setSaveStatus('saving');
    fetch('/api/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao salvar: ${res.status}`);
        return res.json() as Promise<ReportData>;
      })
      .then(saved => {
        setSavedReports(prev => {
          const index = prev.findIndex(r => r.id === saved.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = saved;
            return updated;
          }
          return [saved, ...prev];
        });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      })
      .catch(err => {
        console.error('Erro ao salvar termo:', err);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      });
  };

  const deleteReport = (id: string) => {
    fetch(`/api/terms/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao deletar: ${res.status}`);
        setSavedReports(prev => prev.filter(r => r.id !== id));
      })
      .catch(err => {
        console.error('Erro ao deletar termo:', err);
      });
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    const element = reportRef.current;
    const opt = {
      margin: 0,
      filename: `Termo_${data.reportNumber.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const NavItem = ({ active, onClick, icon, label }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] border ${active ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white'}`}
    >
      <span className="w-5 h-5">{icon}</span>
      {label}
    </button>
  );

  if (showPreview) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] overflow-y-auto">
        <div className="no-print sticky top-0 z-50 bg-black/95 backdrop-blur-2xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
          <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">
            <HomeIcon className="w-4 h-4" /> Voltar ao Editor
          </button>
          <div className="flex gap-4">
            <button onClick={downloadPDF} disabled={isDownloading} className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
              {isDownloading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowDownIcon className="w-4 h-4" />}
              {isDownloading ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>
        <div className="max-w-[210mm] mx-auto my-12 shadow-2xl" ref={reportRef}>
          <ReportPreview data={data} />
        </div>
      </div>
    );
  }

  const studentItem = data.items.find(i => i.id === 'alunos-id');
  const staffItem = data.items.find(i => i.id === 'servidores-id');

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-black border-r border-white/5 p-8 flex flex-col sticky top-0 h-auto md:h-screen z-20">
        <div className="mb-12"><SmartTechLogo light className="h-10" /></div>
        <nav className="flex-1 space-y-2">
          <NavItem active={activeTab === 'Geral'} onClick={() => setActiveTab('Geral')} icon={<DocumentTextIcon />} label="Protocolo" />
          <NavItem active={activeTab === 'Partes'} onClick={() => setActiveTab('Partes')} icon={<BuildingOfficeIcon />} label="Entidades" />
          <NavItem active={activeTab === 'Licencas'} onClick={() => setActiveTab('Licencas')} icon={<CpuChipIcon />} label="Licenças" />
          <NavItem active={activeTab === 'Conformidade'} onClick={() => setActiveTab('Conformidade')} icon={<CheckBadgeIcon />} label="Conformidade" />
          <NavItem active={activeTab === 'Instalacao'} onClick={() => setActiveTab('Instalacao')} icon={<GlobeAltIcon />} label="Instalação" />
          <NavItem active={activeTab === 'Banco'} onClick={() => setActiveTab('Banco')} icon={<ArchiveBoxIcon />} label="Histórico" />
        </nav>
        <button
          onClick={() => setData({ ...initialData, id: Date.now().toString() })}
          className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <PlusIcon className="w-4 h-4" />
          Novo Termo
        </button>
        <button onClick={saveToDatabase} disabled={saveStatus === 'saving'} className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
          {saveStatus === 'saving' ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CloudArrowUpIcon className="w-4 h-4" />}
          {saveStatus === 'success' ? 'Sincronizado' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvar no Histórico'}
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-16 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Editor de Termo</h1>
            <p className="text-white/40 font-medium text-sm">Preencha os dados oficiais para geração do PDF.</p>
          </div>
          <button onClick={() => setShowPreview(true)} className="bg-red-600 hover:bg-red-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all">
            Visualizar Termo
          </button>
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'Geral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
              <Input label="Número do Termo" value={data.reportNumber} onChange={v => handleUpdate('reportNumber', v)} placeholder="Ex: 001/2025" />
              <Input label="Data de Emissão" type="date" value={data.date} onChange={v => handleUpdate('date', v)} />
              <Input label="Processo Administrativo" value={data.processRef} onChange={v => handleUpdate('processRef', v)} />
              <Input label="Referência do Contrato" value={data.contractRef} onChange={v => handleUpdate('contractRef', v)} className="md:col-span-2" />
            </div>
          )}

          {activeTab === 'Conformidade' && (
            <div className="bg-white/5 p-10 rounded-[40px] border border-red-600/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <CheckBadgeIcon className="w-32 h-32 text-red-600" />
               </div>
               <h3 className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-8">Configurações da Declaração Legal</h3>
               <div className="grid grid-cols-1 gap-8 relative z-10">
                 <Input
                   label="Número do Pregão Eletrônico"
                   value={data.pregaoRef}
                   onChange={v => handleUpdate('pregaoRef', v)}
                   placeholder="Ex: Pregão Eletrônico nº 046/2025"
                 />
                 <Input
                   label="Cidade de Realização (Exibida na Declaração)"
                   value={data.credentials.city}
                   onChange={v => handleUpdate('credentials.city', v)}
                   placeholder="Ex: Uberlândia / MG"
                 />
                 <div className="p-6 bg-black/40 border border-white/10 rounded-3xl italic text-xs text-white/40 leading-relaxed">
                   "Declaramos que as licenças de uso entregues cumprem integralmente as exigências contidas no Termo de Referência do <span className="text-red-500 font-bold">{data.pregaoRef || '...'}</span>, realizado pelo Município de <span className="text-red-500 font-bold">{data.credentials.city || '...'}</span>."
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'Partes' && (
            <div className="space-y-8">
              <section className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                <h3 className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Dados do Contratante</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Nome da Prefeitura" value={data.contratante.name} onChange={v => handleUpdate('contratante.name', v)} className="md:col-span-2" />
                  <Input label="CNPJ" value={data.contratante.cnpj} onChange={v => handleUpdate('contratante.cnpj', v)} />
                  <Input label="Endereço Completo" value={data.contratante.address} onChange={v => handleUpdate('contratante.address', v)} />
                  <Input label="Representante (Prefeito/Secretário)" value={data.contratante.representative} onChange={v => handleUpdate('contratante.representative', v)} />
                  <Input label="CPF do Representante" value={data.contratante.cpf} onChange={v => handleUpdate('contratante.cpf', v)} />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Licencas' && (
            <div className="space-y-8">
              {/* Seção Alunos */}
              <div className="bg-white/5 border-l-4 border-red-600 p-8 rounded-r-[32px] relative">
                <div className="flex items-center gap-3 mb-6">
                  <UserGroupIcon className="w-6 h-6 text-red-600" />
                  <h3 className="text-white font-black text-[12px] uppercase tracking-[0.2em]">Licenças para Alunos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Quantidade de Alunos"
                    value={studentItem?.quantity || ''}
                    onChange={v => updateItem('alunos-id', 'quantity', v)}
                    placeholder="Ex: 2.991"
                  />
                  <Input
                    label="Chave de Licença"
                    value={studentItem?.key || ''}
                    onChange={v => updateItem('alunos-id', 'key', v)}
                    className="md:col-span-2"
                  />
                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Descrição do Objeto</label>
                    <textarea
                      rows={2}
                      value={studentItem?.description || ''}
                      onChange={e => updateItem('alunos-id', 'description', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white/60 focus:border-red-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Servidores */}
              <div className="bg-white/5 border-l-4 border-blue-600 p-8 rounded-r-[32px] relative">
                <div className="flex items-center gap-3 mb-6">
                  <IdentificationIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-white font-black text-[12px] uppercase tracking-[0.2em]">Licenças para Servidores</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Quantidade de Servidores"
                    value={staffItem?.quantity || ''}
                    onChange={v => updateItem('servidores-id', 'quantity', v)}
                    placeholder="Ex: 450"
                  />
                  <Input
                    label="Chave de Licença"
                    value={staffItem?.key || ''}
                    onChange={v => updateItem('servidores-id', 'key', v)}
                    className="md:col-span-2"
                  />
                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Descrição do Objeto</label>
                    <textarea
                      rows={2}
                      value={staffItem?.description || ''}
                      onChange={e => updateItem('servidores-id', 'description', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white/60 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Instalacao' && (
            <div className="space-y-8">
              <section className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                <h3 className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Infraestrutura e Acesso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Responsável Técnico" value={data.techResponsible.name} onChange={v => handleUpdate('techResponsible.name', v)} />
                  <Input label="RG do Responsável" value={data.techResponsible.rg} onChange={v => handleUpdate('techResponsible.rg', v)} />
                  <Input label="Ambiente de Instalação" value={data.installation.environment} onChange={v => handleUpdate('installation.environment', v)} />
                  <Input label="Link de Acesso" value={data.installation.accessLink} onChange={v => handleUpdate('installation.accessLink', v)} />
                  <Input label="Acesso Restrito a" value={data.installation.restrictedTo} onChange={v => handleUpdate('installation.restrictedTo', v)} className="md:col-span-2" />
                </div>
              </section>
              <section className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                <h3 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Credenciais de Acesso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Usuário Padrão" value={data.credentials.username} onChange={v => handleUpdate('credentials.username', v)} />
                  <Input label="Senha Padrão" value={data.credentials.password} onChange={v => handleUpdate('credentials.password', v)} />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Banco' && (
            <div className="grid grid-cols-1 gap-4">
              {isLoadingReports ? (
                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                  <ArrowPathIcon className="w-8 h-8 text-white/20 mx-auto mb-4 animate-spin" />
                  <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Carregando termos...</p>
                </div>
              ) : loadError ? (
                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-red-500/20">
                  <XMarkIcon className="w-12 h-12 text-red-500/40 mx-auto mb-4" />
                  <p className="text-red-400/60 font-bold uppercase text-[10px] tracking-widest">{loadError}</p>
                </div>
              ) : savedReports.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                  <ArchiveBoxIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Nenhum termo salvo ainda</p>
                </div>
              ) : (
                savedReports.map(report => (
                  <div key={report.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:border-red-500/30 transition-all">
                    <div>
                      <h4 className="font-black text-sm mb-1">{report.contratante.name}</h4>
                      <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-white/40">
                        <span>Nº {report.reportNumber}</span>
                        <span>•</span>
                        <span>{new Date(report.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setData(report)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteReport(report.id)} className="p-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-xl transition-all border border-white/10">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, className = "" }: any) => (
  <div className={className}>
    <label className="block text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-red-600 outline-none transition-all placeholder:text-white/10"
    />
  </div>
);

export default App;
