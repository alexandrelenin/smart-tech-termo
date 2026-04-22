
export interface LicenseItem {
  id: string;
  category: string; // Ex: ALUNOS, SERVIDORES
  quantity: string;
  key: string;
  description: string;
}

export interface Entity {
  name: string;
  address: string;
  cnpj: string;
  representative: string;
  cpf: string;
}

export interface ReportData {
  id: string;
  reportNumber: string;
  processRef: string;
  pregaoRef: string;
  contractRef: string;
  date: string;
  contratante: Entity;
  contratada: Entity;
  softwareDescription: string;
  items: LicenseItem[];
  techResponsible: {
    name: string;
    rg: string;
  };
  installation: {
    environment: string;
    restrictedTo: string;
    accessLink: string;
  };
  credentials: {
    username: string;
    password: string;
    city: string;
  };
}
