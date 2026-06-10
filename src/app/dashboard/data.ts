"use client";

export type WarehouseRecord = {
  id: number;
  endereco: string;
  bairro: string;
  area: number;
  aluguel: number;
  padrao: string;
};

export type WarehouseComputed = WarehouseRecord & {
  precoM2: number;
  porte: string;
};

export type SimulatorInputs = {
  simArea: number;
  simPadrao: string;
  simEstrutura: string;
  simRegime: string;
  simCustoTerreno: number;
  simRiscoSolo: number;
  simAluguelAlvo: number;
};

export type SimulationResults = {
  custoConstrucaoM2: number;
  custoConstrucaoTurnkey: number;
  areaTerrenoNecessaria: number;
  custoTerrenoTotal: number;
  capexTotal: number;
  receitaMensalBruta: number;
  netOperatingIncome: number;
  roiLiquido: number;
  paybackAnos: number;
};

export type DashboardKpis = {
  totalCount: number;
  totalArea: number;
  totalAluguel: number;
  precoMedioPonderado: number;
  precoMedioSimples: number;
};

export const NEIGHBORHOODS = ["Todos", "Fidélis", "Itoupava Central"] as const;
export const SIZE_BUCKETS = [
  "Todos",
  "Pequeno (<350m²)",
  "Médio (350-1000m²)",
  "Grande (>1000m²)",
] as const;
export const QUALITY_STANDARDS = ["Todos", "Convencional", "Logístico Classe A"] as const;

export const CUB_REFERENCES = {
  janeiro2026SemEncargos: 1500.27,
  regularMarco2026: 1505.08,
  desoneradoMarco2026: 1396.75,
  multiplicadorLogisticoAAA: 1.35,
  adicionalConcretoPremoldado: 150,
  taxaOcupacaoSolo: 0.6,
  custosLegaisTerreno: 0.04,
  friccaoOperacional: 0.08,
};

export const INITIAL_DATABASE: WarehouseRecord[] = [
  { id: 1, endereco: "Rua Guilherme Scharf, 3200", bairro: "Fidélis", area: 638, aluguel: 9570, padrao: "Convencional" },
  { id: 2, endereco: "Rua Guilherme Scharf (Padrão)", bairro: "Fidélis", area: 630, aluguel: 9450, padrao: "Convencional" },
  { id: 3, endereco: "Rua Guilherme Scharf (Grande)", bairro: "Fidélis", area: 1900, aluguel: 35000, padrao: "Logístico Classe A" },
  { id: 4, endereco: "Rua Guilherme Scharf (Em Obras)", bairro: "Fidélis", area: 1900, aluguel: 35000, padrao: "Logístico Classe A" },
  { id: 5, endereco: "Rua Paul Henschel, 145", bairro: "Itoupava Central", area: 550, aluguel: 20000, padrao: "Convencional" },
  { id: 6, endereco: "Rua Marconi, 05", bairro: "Itoupava Central", area: 350, aluguel: 10000, padrao: "Convencional" },
  { id: 7, endereco: "Rua Gustavo Zimmermann", bairro: "Itoupava Central", area: 350, aluguel: 6000, padrao: "Convencional" },
  { id: 8, endereco: "Condomínio Logístico M1", bairro: "Itoupava Central", area: 12500, aluguel: 312500, padrao: "Logístico Classe A" },
  { id: 9, endereco: "Condomínio Logístico M2", bairro: "Itoupava Central", area: 15700, aluguel: 392500, padrao: "Logístico Classe A" },
  { id: 10, endereco: "Condomínio Logístico M3", bairro: "Itoupava Central", area: 18000, aluguel: 312500, padrao: "Logístico Classe A" },
  { id: 11, endereco: "Galpão Pequeno Geral 1", bairro: "Itoupava Central", area: 100, aluguel: 4500, padrao: "Convencional" },
  { id: 12, endereco: "Galpão Pequeno Geral 2", bairro: "Itoupava Central", area: 110, aluguel: 4000, padrao: "Convencional" },
  { id: 13, endereco: "Modular Compacto", bairro: "Itoupava Central", area: 120, aluguel: 3500, padrao: "Convencional" },
  { id: 14, endereco: "Médio Porte Comercial 1", bairro: "Itoupava Central", area: 720, aluguel: 14900, padrao: "Convencional" },
  { id: 15, endereco: "Médio Porte Comercial 2", bairro: "Itoupava Central", area: 750, aluguel: 17500, padrao: "Convencional" },
  { id: 16, endereco: "Médio Porte Comercial 3", bairro: "Itoupava Central", area: 850, aluguel: 18700, padrao: "Convencional" },
  { id: 17, endereco: "Logístico Integrado de Porte", bairro: "Itoupava Central", area: 3348, aluguel: 101000, padrao: "Logístico Classe A" },
  { id: 18, endereco: "Rua Professor Hermann Lange, 339", bairro: "Fidélis", area: 350, aluguel: 8150, padrao: "Convencional" },
  { id: 19, endereco: "Rua Hermann Lange, 1234", bairro: "Fidélis", area: 344, aluguel: 8150, padrao: "Convencional" },
  { id: 20, endereco: "Fidélis Médio Porte", bairro: "Fidélis", area: 750, aluguel: 17500, padrao: "Convencional" },
  { id: 21, endereco: "Fidélis Compacto", bairro: "Fidélis", area: 252, aluguel: 6200, padrao: "Convencional" },
];

export function getPorte(area: number) {
  if (area <= 350) {
    return "Pequeno (<350m²)";
  }
  if (area <= 1000) {
    return "Médio (350-1000m²)";
  }
  return "Grande (>1000m²)";
}

export function computeWarehouse(record: WarehouseRecord): WarehouseComputed {
  return {
    ...record,
    precoM2: record.area > 0 ? record.aluguel / record.area : 0,
    porte: getPorte(record.area),
  };
}

export function calculateKpis(records: WarehouseComputed[]): DashboardKpis {
  const totalCount = records.length;
  const totalArea = records.reduce((acc, current) => acc + current.area, 0);
  const totalAluguel = records.reduce((acc, current) => acc + current.aluguel, 0);
  const precoMedioPonderado = totalArea > 0 ? totalAluguel / totalArea : 0;
  const precoMedioSimples =
    totalCount > 0 ? records.reduce((acc, current) => acc + current.precoM2, 0) / totalCount : 0;

  return {
    totalCount,
    totalArea,
    totalAluguel,
    precoMedioPonderado,
    precoMedioSimples,
  };
}

export function calculateSimulation(inputs: SimulatorInputs): SimulationResults {
  const baseCUB =
    inputs.simRegime === "Regular" ? CUB_REFERENCES.regularMarco2026 : CUB_REFERENCES.desoneradoMarco2026;
  const multiplicadorPadrao = inputs.simPadrao === "Logístico AAA" ? CUB_REFERENCES.multiplicadorLogisticoAAA : 1;
  const adicionalEstrutura =
    inputs.simEstrutura === "Concreto Pré-Moldado" ? CUB_REFERENCES.adicionalConcretoPremoldado : 0;
  const custoConstrucaoM2 = baseCUB * multiplicadorPadrao + adicionalEstrutura;
  const custoConstrucaoTurnkey = inputs.simArea * custoConstrucaoM2 * (1 + inputs.simRiscoSolo / 100);
  const areaTerrenoNecessaria = inputs.simArea / CUB_REFERENCES.taxaOcupacaoSolo;
  const custoTerrenoTotal =
    areaTerrenoNecessaria * inputs.simCustoTerreno * (1 + CUB_REFERENCES.custosLegaisTerreno);
  const capexTotal = custoConstrucaoTurnkey + custoTerrenoTotal;
  const receitaMensalBruta = inputs.simArea * inputs.simAluguelAlvo;
  const netOperatingIncome = receitaMensalBruta * 12 * (1 - CUB_REFERENCES.friccaoOperacional);
  const roiLiquido = capexTotal > 0 ? (netOperatingIncome / capexTotal) * 100 : 0;
  const paybackAnos = netOperatingIncome > 0 ? capexTotal / netOperatingIncome : 0;

  return {
    custoConstrucaoM2,
    custoConstrucaoTurnkey,
    areaTerrenoNecessaria,
    custoTerrenoTotal,
    capexTotal,
    receitaMensalBruta,
    netOperatingIncome,
    roiLiquido,
    paybackAnos,
  };
}

export function formatCurrency(value: number, fractionDigits = 2) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatNumber(value: number, fractionDigits = 0) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
