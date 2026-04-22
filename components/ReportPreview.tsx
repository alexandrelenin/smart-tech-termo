
import React from 'react';
import { ReportData } from '../types';
import SmartTechLogo from './SmartTechLogo';

const ReportPreview: React.FC<{ data: ReportData }> = ({ data }) => {
  const Footer = () => (
    <div className="mt-auto pt-8 border-t border-slate-200 text-[9px] text-slate-400 font-sans leading-tight print:block">
      <div className="flex justify-between items-end">
        <div className="max-w-[70%] space-y-1">
          <p className="font-bold text-slate-800 uppercase tracking-tight">SMART TECH - SOLUÇÕES EM TECNOLOGIA EDUCACIONAL LTDA</p>
          <p>Rua Coronel Constantino, 130, Sala 141, Bairro Tabajaras, Uberlândia-MG</p>
          <p>CNPJ: 52.625.847/0001-65 | suporte2@smarttechschool.com.br</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="w-16 h-1 bg-red-600 mb-2"></div>
          <span className="font-black text-slate-900">DOCUMENTO OFICIAL DE ENTREGA</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-[20mm] md:p-[25mm] text-slate-800 font-serif leading-relaxed text-justify relative min-h-[297mm] flex flex-col bg-white pb-[30mm]">
      {/* Header Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-5 -mr-16 -mt-16 rounded-full"></div>
      
      {/* Header Logo */}
      <div className="flex justify-between items-start mb-10 relative">
        <SmartTechLogo className="h-14" />
        <div className="text-right font-sans">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Documento Gerado em</p>
          <p className="text-xs text-slate-900 font-black">{new Date(data.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-black uppercase mb-3 tracking-tight leading-tight text-slate-900">
          Termo de Entrega de Licença Perpétua<br />de Uso de Software
        </h1>
        <div className="flex justify-center items-center gap-4 text-xs font-black font-sans uppercase text-slate-400">
          <div className="h-px w-8 bg-slate-200"></div>
          <span>Protocolo Digital Nº {data.reportNumber}</span>
          <div className="h-px w-8 bg-slate-200"></div>
        </div>
      </div>

      {/* Context/Ref */}
      <div className="mb-6 p-5 bg-slate-50 border-l-4 border-red-600 text-[11px] font-sans rounded-r-lg space-y-1">
        <p><span className="font-bold text-slate-500 uppercase">Referência Contratual:</span> {data.contractRef}</p>
        <p><span className="font-bold text-slate-500 uppercase">Processo Adm:</span> {data.processRef} | {data.pregaoRef}</p>
      </div>

      {/* Parties Block */}
      <div className="space-y-3 mb-6 text-[12px] leading-[1.6]">
        <p>
          <span className="font-bold uppercase tracking-tight text-slate-900">CONTRATANTE:</span> <span className="font-bold">{data.contratante.name}</span>, CNPJ nº <span className="font-bold">{data.contratante.cnpj}</span>, representada por seu gestor municipal, Sr. {data.contratante.representative}, portador do CPF nº {data.contratante.cpf}.
        </p>
        <p>
          <span className="font-bold uppercase tracking-tight text-slate-900">CONTRATADA:</span> <span className="font-bold">{data.contratada.name}</span>, CNPJ nº <span className="font-bold">{data.contratada.cnpj}</span>, com sede em {data.contratada.address}.
        </p>
      </div>

      {/* Items Section */}
      <div className="mb-6">
        <h3 className="font-black uppercase text-[10px] text-red-600 tracking-[0.2em] mb-3 font-sans">Tabela de Itens Entregues:</h3>
        {data.items.map((item, idx) => (
          <div key={idx} className="mb-3">
            <table className="w-full border-collapse font-sans shadow-sm">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                  <th className="p-2 w-[15%] text-center border border-slate-900">Qtd</th>
                  <th className="p-2 w-[25%] text-left border border-slate-900">Chave de Licença</th>
                  <th className="p-2 w-[60%] text-left border border-slate-900">Especificação e Uso</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                <tr>
                  <td className="border border-slate-200 p-3 font-bold text-center bg-slate-50 text-slate-900">{item.quantity}<br/>{item.category}</td>
                  <td className="border border-slate-200 p-3 font-mono font-bold text-red-700">{item.key}</td>
                  <td className="border border-slate-200 p-3 text-slate-600 leading-relaxed italic">{item.description}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Conformity Declaration */}
      <div className="mb-6 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
        <h3 className="font-black uppercase text-[10px] text-slate-900 tracking-[0.1em] mb-2 font-sans">Declaração de Conformidade:</h3>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Declaramos que as licenças de uso entregues cumprem integralmente as exigências contidas no Termo de Referência do <strong>{data.pregaoRef}</strong>, realizado pelo Município de <strong>{data.credentials.city}</strong>.
        </p>
      </div>

      {/* Installation Data */}
      <div className="mb-6 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
        <h3 className="font-black uppercase text-[10px] text-slate-900 tracking-[0.1em] mb-3 font-sans">Dados da Instalação:</h3>
        <div className="grid grid-cols-2 gap-4 text-[11px]">
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Responsável Técnico</p>
            <p className="font-bold">{data.techResponsible.name} <span className="text-slate-400 font-normal">RG: {data.techResponsible.rg}</span></p>
          </div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Ambiente</p>
            <p className="font-bold">{data.installation.environment}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Acesso Restrito</p>
            <p className="font-bold">{data.installation.restrictedTo}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Link de Acesso</p>
            <p className="font-bold text-blue-600 underline">{data.installation.accessLink}</p>
          </div>
        </div>
      </div>

      {/* Pela Contratada Section */}
      <div className="mb-8 p-6 border border-slate-200 rounded-2xl bg-slate-50/50">
        <h3 className="font-black uppercase text-[10px] text-slate-900 tracking-[0.1em] mb-4 font-sans">Pela Contratada:</h3>
        <div className="flex justify-between items-start text-[11px]">
          <div>
            <p className="font-black text-slate-900 uppercase">{data.contratada.representative}</p>
            <p className="text-slate-500">CPF: {data.contratada.cpf}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Cargo</p>
            <p className="font-bold">Representante Legal – SMART EDU LTDA</p>
          </div>
        </div>
      </div>

      {/* Access Credentials Block */}
      <div className="mb-6 bg-slate-900 text-white rounded-3xl p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-10 -mt-10 rounded-full"></div>
        <h3 className="font-black uppercase text-[10px] text-red-500 tracking-[0.2em] mb-4 font-sans border-b border-white/20 pb-2">Credenciais de Acesso Oficial</h3>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-sans text-[11px]">
          <div>
            <p className="text-white/40 uppercase text-[8px] font-black tracking-widest">Cidade / Município</p>
            <p className="font-bold">{data.credentials.city}</p>
          </div>
          <div>
            <p className="text-white/40 uppercase text-[8px] font-black tracking-widest">Data de Emissão</p>
            <p className="font-bold">{new Date(data.date).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-white/40 uppercase text-[8px] font-black tracking-widest">Contratante</p>
            <p className="font-bold">{data.contratante.representative}</p>
          </div>
          <div>
            <p className="text-white/40 uppercase text-[8px] font-black tracking-widest">CPF / CNPJ do Contratante</p>
            <p className="font-bold">{data.contratante.cpf}</p>
          </div>
          <div className="col-span-2 py-1"></div>
          <div>
            <p className="text-red-400 uppercase text-[8px] font-black tracking-widest">Usuário Padrão</p>
            <p className="font-mono font-bold text-sm">{data.credentials.username}</p>
          </div>
          <div>
            <p className="text-red-400 uppercase text-[8px] font-black tracking-widest">Senha Padrão</p>
            <p className="font-mono font-bold text-sm">{data.credentials.password}</p>
            <p className="text-[8px] text-white/30">(alteração obrigatória no 1º acesso)</p>
          </div>
        </div>
      </div>

      {/* Atesto de Recebimento Section */}
      <div className="mt-4 p-8 border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50/30">
        <h3 className="font-black uppercase text-[10px] text-slate-400 tracking-[0.2em] mb-4 font-sans text-center">Atesto de Recebimento</h3>
        <p className="text-[12px] text-center italic text-slate-500 mb-12 px-8 leading-relaxed">
          Atesto o recebimento dos objetos constantes neste termo, em perfeitas condições de uso e em total conformidade com as especificações técnicas e obrigações contratuais vigentes para o pleno funcionamento das unidades escolares do município.
        </p>
        
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[420px] text-center pt-8 border-t-2 border-slate-900">
            <p className="text-slate-900 font-black uppercase text-[12px] mb-1">
              FISCAL DO CONTRATO / SECRETARIA DE EDUCAÇÃO
            </p>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[8px]">
              Assinatura e Carimbo
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReportPreview;
