"use client";

import Image from "next/image";
import rotulaMap from "../../../public/rotula-guilherme-scharf.jpeg";
import {
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Calculator,
  CheckCircle2,
  FileText,
  Fuel,
  Gauge,
  Landmark,
  MapPinned,
  PackageCheck,
  Route,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Target,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

type Scenario = {
  key: string;
  name: string;
  rentM2: number;
  occupancy: number;
  saleM2: number;
  note: string;
};

type SimulationResult = {
  landCost: number;
  futureLandValue: number;
  directConstruction: number;
  itbi: number;
  centralAdmin: number;
  localAdmin: number;
  postSaleRisk: number;
  projectsAndFees: number;
  indirectCosts: number;
  totalInvestment: number;
  monthlyRevenue: number;
  annualNoi: number;
  capRate: number;
  vgv: number;
  saleExpenses: number;
  profit: number;
  margin: number;
  monthlyRevenue2027: number;
  safetySpread: number;
};

const ASSET = {
  totalArea: 128000,
  usefulArea: 68000,
  frontage: 1400,
  landCostM2: 600,
  landTargetM2: 1800,
  currentTraffic: 8000,
  viaductDate: "outubro de 2027",
  coordinates: "-26.845397, -49.072970",
};

const COST_RATES = {
  itbi: 0.02,
  centralAdmin: 0.04,
  localAdmin: 0.06,
  postSaleRisk: 0.015,
  projectsAndFees: 0.045,
  publicity: 0.02,
  saleTaxes: 0.0673,
  brokerage: 0.05,
};

const CUB_SC_JUNE_2026 = {
  residentialAverage: 3096.25,
  residentialVariation: 1.05,
  commercialAverage: 3297.09,
  commercialVariation: 1.03,
  industrialWarehouseGI: 1366.85,
  reference: "Junho de 2026",
};

const MODULES = [
  { size: 150, currentRent: 30, futureRent: 38, tenant: "E-commerce, oficina leve, distribuidor local" },
  { size: 300, currentRent: 26, futureRent: 34, tenant: "Last mile, estoque regional, showroom tecnico" },
  { size: 500, currentRent: 24, futureRent: 32, tenant: "Operacao logistica maior, atacado, industria limpa" },
];

const LOT_PRESETS = [2500, 3000, 5000];

const VOCATIONS = [
  {
    icon: ShoppingCart,
    title: "Supermercado",
    copy: "Frente longa, fluxo crescente e bairros no entorno favorecem uma ancora de varejo.",
  },
  {
    icon: Fuel,
    title: "Posto de combustiveis",
    copy: "A rotula e o acesso a Via-Expressa aumentam conveniencia, parada rapida e visibilidade.",
  },
  {
    icon: Store,
    title: "Varejo de conveniencia",
    copy: "Farmacia, material de construcao, atacarejo leve e servicos podem ocupar frações menores.",
  },
  {
    icon: Truck,
    title: "Logistica e last mile",
    copy: "Galpoes modulares continuam fortes para distribuicao regional e entrega urbana.",
  },
];

const MARKET_RENT_SAMPLES = [
  { region: "Itoupava Central", area: 119, rent: 3500, source: "Viva Real" },
  { region: "Itoupava Central", area: 350, rent: 6000, source: "Viva Real" },
  { region: "Itoupava Central", area: 749, rent: 13500, source: "Viva Real" },
  { region: "Itoupava Central", area: 750, rent: 17500, source: "Viva Real" },
  { region: "Fidelis", area: 75, rent: 2500, source: "Viva Real" },
  { region: "Fidelis", area: 90, rent: 2500, source: "Viva Real" },
  { region: "Entorno Itoupavazinha", area: 450, rent: 11500, source: "Viva Real" },
  { region: "Entorno Itoupavazinha", area: 549, rent: 20000, source: "Viva Real" },
];

const SCENARIOS: Scenario[] = [
  {
    key: "conservador",
    name: "Conservador",
    rentM2: 24,
    occupancy: 88,
    saleM2: 5200,
    note: "Usa aluguel atual de mercado e absorcao mais lenta.",
  },
  {
    key: "base",
    name: "Base investidor",
    rentM2: 30,
    occupancy: 92,
    saleM2: 6000,
    note: "Considera modulos novos, boa frente e demanda de last mile.",
  },
  {
    key: "viaduto",
    name: "Pós-viaduto",
    rentM2: 36,
    occupancy: 95,
    saleM2: 6800,
    note: "Fluxo triplicado melhora visibilidade, acesso e liquidez.",
  },
];

const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/carlito-logo-investidor.png`;

const formatCurrency = (value: number, digits = 0) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const formatNumber = (value: number, digits = 0) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const formatPercent = (value: number, digits = 1) =>
  `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;

function getCapRateLabel(value: number) {
  if (value < 5) {
    return "Fraco";
  }
  if (value < 6.5) {
    return "Atenção";
  }
  if (value < 8.5) {
    return "Bom";
  }
  return "Forte";
}

export default function DashboardClient() {
  const [activeSection, setActiveSection] = useState("Visão geral");
  const [lotArea, setLotArea] = useState(5000);
  const [coverage, setCoverage] = useState(60);
  const [cubM2, setCubM2] = useState(CUB_SC_JUNE_2026.industrialWarehouseGI);
  const [rentM2, setRentM2] = useState(30);
  const [occupancy, setOccupancy] = useState(92);
  const [saleM2, setSaleM2] = useState(6000);
  const builtArea = Math.round(lotArea * (coverage / 100));

  const results = useMemo(() => {
    const landCost = lotArea * ASSET.landCostM2;
    const futureLandValue = lotArea * ASSET.landTargetM2;
    const directConstruction = builtArea * cubM2;
    const itbi = landCost * COST_RATES.itbi;
    const centralAdmin = directConstruction * COST_RATES.centralAdmin;
    const localAdmin = directConstruction * COST_RATES.localAdmin;
    const postSaleRisk = directConstruction * COST_RATES.postSaleRisk;
    const projectsAndFees = directConstruction * COST_RATES.projectsAndFees;
    const indirectCosts = itbi + centralAdmin + localAdmin + postSaleRisk + projectsAndFees;
    const totalInvestment = landCost + directConstruction + indirectCosts;
    const monthlyRevenue = builtArea * rentM2 * (occupancy / 100);
    const annualNoi = monthlyRevenue * 12 * 0.9;
    const capRate = totalInvestment > 0 ? (annualNoi / totalInvestment) * 100 : 0;
    const vgv = builtArea * saleM2;
    const saleExpenses = vgv * (COST_RATES.publicity + COST_RATES.saleTaxes + COST_RATES.brokerage);
    const profit = vgv - totalInvestment - saleExpenses;
    const margin = vgv > 0 ? (profit / vgv) * 100 : 0;
    const monthlyRevenue2027 = builtArea * 36 * 0.95;

    return {
      landCost,
      futureLandValue,
      directConstruction,
      itbi,
      centralAdmin,
      localAdmin,
      postSaleRisk,
      projectsAndFees,
      indirectCosts,
      totalInvestment,
      monthlyRevenue,
      annualNoi,
      capRate,
      vgv,
      saleExpenses,
      profit,
      margin,
      monthlyRevenue2027,
      safetySpread: futureLandValue - landCost,
    };
  }, [builtArea, cubM2, lotArea, occupancy, rentM2, saleM2]);

  const visibleScenario = SCENARIOS.map((scenario) => {
    const monthly = builtArea * scenario.rentM2 * (scenario.occupancy / 100);
    const noi = monthly * 12 * 0.9;
    const vgv = builtArea * scenario.saleM2;
    const saleExpenses = vgv * (COST_RATES.publicity + COST_RATES.saleTaxes + COST_RATES.brokerage);
    const profit = vgv - results.totalInvestment - saleExpenses;
    return {
      ...scenario,
      monthly,
      capRate: (noi / results.totalInvestment) * 100,
      vgv,
      profit,
      margin: (profit / vgv) * 100,
    };
  });

  const nav = [
    { label: "Visão geral", icon: BarChart3 },
    { label: "Localização", icon: MapPinned },
    { label: "Mercado", icon: Truck },
    { label: "Simulador", icon: Calculator },
    { label: "Custos", icon: Landmark },
    { label: "Investidor", icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen bg-[#eef3f8] text-[#10243d]">
      <div className="grid min-h-screen lg:grid-cols-[224px_1fr]">
        <aside className="hidden border-r border-[#d9e1ec] bg-[#061d36] text-white lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 p-5">
              <p className="text-xs font-bold uppercase text-white/55">Business Case</p>
              <p className="mt-1 text-lg font-black">Guilherme Scharf</p>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveSection(item.label)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold ${
                      isActive ? "bg-[#f97316] text-white" : "text-white/78 hover:bg-white/8"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="m-3 rounded-lg border border-[#f97316]/70 p-4">
              <p className="text-xs font-bold uppercase text-white/55">Contato</p>
              <p className="mt-2 text-xl font-black">47 99192-6000</p>
              <p className="mt-1 text-xs text-white/65">Carlito de Souza | CRECI 6894F</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <Header />

          <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-7">
            <section className="grid gap-4 xl:grid-cols-[1fr_440px]">
              <div className="rounded-lg border border-[#d9e1ec] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#061d36] sm:text-5xl">
                      Área estratégica na rótula da Guilherme Scharf
                    </h1>
                    <p className="mt-3 max-w-4xl text-base leading-7 text-[#5c6b7d]">
                      São 128.000 m² de terreno, 68.000 m² úteis e 1.400 m de frente para a Rua Guilherme Scharf.
                      A venda pode acontecer em frações, com vocação para supermercado, posto, varejo e logística.
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm font-bold text-[#173c68] sm:grid-cols-2 lg:w-[340px]">
                    <MiniProof icon={ShieldCheck} text="Terreno já terraplanado na cota 15" />
                    <MiniProof icon={FileText} text="Licenciado para uso logístico e comercial" />
                    <MiniProof icon={Route} text="Rótula e Via-Expressa como gatilho de fluxo" />
                    <MiniProof icon={PackageCheck} text="Supermercado, posto, varejo e galpões" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Kpi icon={MapPinned} label="Área total" value={`${formatNumber(ASSET.totalArea)} m²`} help="Escala para múltiplas operações" tone="blue" />
                  <Kpi icon={Target} label="Área útil" value={`${formatNumber(ASSET.usefulArea)} m²`} help="Base real de aproveitamento" tone="green" />
                  <Kpi icon={Route} label="Frente para rua" value={`${formatNumber(ASSET.frontage)} m`} help="Frente na Guilherme Scharf" tone="orange" />
                  <Kpi icon={BadgeDollarSign} label="Compra atual" value="R$ 600/m²" help="Cota de entrada da fração" tone="blue" />
                </div>
              </div>

              <div className="rounded-lg border border-[#d9e1ec] bg-[#061d36] p-5 text-white shadow-sm">
                <p className="text-sm font-black uppercase text-[#ffb15f]">A conta que o investidor entende</p>
                <div className="mt-4 grid gap-3">
                  <ValueStep number="1" title="Escolha uma fração" copy="A área total dá escala, mas o investidor pode comprar partes menores." />
                  <ValueStep number="2" title="Defina a vocação" copy="Supermercado, posto, varejo e logística têm leituras diferentes de retorno." />
                  <ValueStep number="3" title="Compare renda e valorização" copy="O ROI vem da locação, venda futura e alta patrimonial pós-viaduto." />
                </div>
              </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
              <MapPanel />
              <SimulatorPanel
                lotArea={lotArea}
                setLotArea={setLotArea}
                coverage={coverage}
                setCoverage={setCoverage}
                builtArea={builtArea}
                cubM2={cubM2}
                setCubM2={setCubM2}
                rentM2={rentM2}
                setRentM2={setRentM2}
                occupancy={occupancy}
                setOccupancy={setOccupancy}
                saleM2={saleM2}
                setSaleM2={setSaleM2}
                results={results}
              />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <MarketPanel />
              <ScenarioPanel scenarios={visibleScenario} />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
              <CostsPanel results={results} />
              <InvestorPanel results={results} />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d9e1ec] bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b4d8c] text-white">
            <MapPinned size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#061d36]">Rua Guilherme Scharf, Blumenau - SC</p>
            <p className="text-xs font-semibold text-[#6d7a89]">Coordenadas: {ASSET.coordinates} | Viaduto previsto: {ASSET.viaductDate}</p>
          </div>
        </div>
        <div className="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-[#d9e1ec]">
          <img
            src={logoSrc}
            alt="Carlito de Souza Corretor de Imóveis"
            width={210}
            height={72}
            className="h-auto w-[118px] sm:w-[158px]"
          />
        </div>
      </div>
    </header>
  );
}

function MapPanel() {
  return (
    <section className="overflow-hidden rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <PanelHeader icon={MapPinned} title="Localização principal: área da rótula" />
      <div className="grid gap-0 lg:grid-cols-[1fr_230px]">
        <div className="relative min-h-[360px] overflow-hidden bg-[#dde8f2]">
          <Image
            src={rotulaMap}
            alt="Desenho da área ancorada na rótula da Rua Guilherme Scharf"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 rounded-lg bg-[#061d36]/92 px-4 py-3 text-white shadow-lg">
            <p className="text-xs font-bold uppercase text-white/65">Foco comercial</p>
            <p className="text-2xl font-black">128.000 m² totais</p>
            <p className="text-sm text-white/78">68.000 m² úteis | 1.400 m de frente</p>
          </div>
        </div>
        <div className="grid border-t border-[#d9e1ec] lg:border-l lg:border-t-0">
          <LocationFact icon={ShoppingCart} title="Varejo ancora" copy="A frente e o fluxo favorecem supermercado, atacarejo leve e lojas de destino." />
          <LocationFact icon={Fuel} title="Posto e conveniência" copy="A rótula cria parada natural para veículos, serviços rápidos e alimentação." />
          <LocationFact icon={ArrowUpRight} title="Venda em frações" copy="A área total mostra escala, mas a proposta comercial vende opções menores." />
        </div>
      </div>
    </section>
  );
}

function SimulatorPanel({
  lotArea,
  setLotArea,
  coverage,
  setCoverage,
  builtArea,
  cubM2,
  setCubM2,
  rentM2,
  setRentM2,
  occupancy,
  setOccupancy,
  saleM2,
  setSaleM2,
  results,
}: {
  lotArea: number;
  setLotArea: (value: number) => void;
  coverage: number;
  setCoverage: (value: number) => void;
  builtArea: number;
  cubM2: number;
  setCubM2: (value: number) => void;
  rentM2: number;
  setRentM2: (value: number) => void;
  occupancy: number;
  setOccupancy: (value: number) => void;
  saleM2: number;
  setSaleM2: (value: number) => void;
  results: SimulationResult;
}) {
  return (
    <section className="rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <PanelHeader icon={SlidersHorizontal} title="Simulador de viabilidade por fração" />
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
            <p className="text-sm font-black text-[#061d36]">Escolha a fração de compra</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {LOT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setLotArea(preset)}
                  className={`rounded-lg border px-3 py-2 text-sm font-black ${
                    lotArea === preset
                      ? "border-[#f97316] bg-[#f97316] text-white"
                      : "border-[#d9e1ec] bg-white text-[#0b4d8c] hover:border-[#f97316]"
                  }`}
                >
                  {formatNumber(preset)} m²
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-[#6d7a89]">
              A área total de 128.000 m² serve como visão de potencial. A venda para investidor começa por frações.
            </p>
          </div>
          <RangeControl label="Área do lote comprado" value={lotArea} min={2000} max={10000} step={250} suffix="m²" onChange={setLotArea} />
          <RangeControl label="Taxa de ocupação do lote" value={coverage} min={45} max={70} step={1} suffix="%" onChange={setCoverage} />
          <div className="rounded-lg border border-[#d9e1ec] bg-[#e9f2ff] p-3">
            <p className="text-xs font-black uppercase text-[#0b4d8c]">Resultado físico do lote</p>
            <p className="mt-1 text-3xl font-black text-[#061d36]">{formatNumber(builtArea)} m² estimados</p>
            <p className="mt-1 text-sm text-[#5c6b7d]">Área construída estimada para calcular aluguel, ROI, VGV e Cap Rate.</p>
          </div>
          <RangeControl
            label="CUB GI desonerado SC"
            value={cubM2}
            min={1200}
            max={2600}
            step={0.05}
            prefix="R$ "
            suffix="/m²"
            digits={2}
            onChange={setCubM2}
          />
          <RangeControl label="Aluguel médio esperado" value={rentM2} min={17} max={45} step={1} prefix="R$ " suffix="/m²" onChange={setRentM2} />
          <RangeControl label="Ocupação média" value={occupancy} min={70} max={98} step={1} suffix="%" onChange={setOccupancy} />
          <RangeControl label="Preço de venda pós-2027" value={saleM2} min={4200} max={7600} step={100} prefix="R$ " suffix="/m²" onChange={setSaleM2} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ResultTile label="Investimento total" value={formatCurrency(results.totalInvestment)} help="Terreno + obra + indiretos" tone="blue" />
          <ResultTile label="Receita mensal" value={formatCurrency(results.monthlyRevenue)} help="Aluguel com ocupação" tone="green" />
          <ResultTile label="Yield on Cost" value={formatPercent(results.capRate)} help="NOI anual / custo total" tone="orange" />
          <ResultTile label="Lucro estimado" value={formatCurrency(results.profit)} help="Venda menos custos e despesas" tone="green" />
          <div className="rounded-lg border border-[#d9e1ec] bg-[#f6f9fc] p-4 sm:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[#6d7a89]">Leitura do Yield on Cost</p>
                <p className="mt-1 text-4xl font-black text-[#061d36]">{getCapRateLabel(results.capRate)}</p>
              </div>
              <Gauge className="h-12 w-12 text-[#f97316]" />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#5c6b7d]">
              Regra simples: abaixo de 5% é fraco para renda; entre 6% e 8% começa a fazer sentido;
              acima de 8% fica bom para renda comercial/logística, desde que a locação seja realista.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketPanel() {
  return (
    <section className="rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <PanelHeader icon={Truck} title="Vocação comercial e mercado de aluguel" />
      <div className="p-4">
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {VOCATIONS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
                <Icon size={24} className="text-[#f97316]" />
                <p className="mt-2 font-black text-[#061d36]">{item.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#6d7a89]">{item.copy}</p>
              </article>
            );
          })}
        </div>
        <div className="overflow-hidden rounded-lg border border-[#d9e1ec]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#061d36] text-white">
              <tr>
                <th className="p-3">Módulo</th>
                <th className="p-3">Aluguel hoje</th>
                <th className="p-3">Aluguel pós-viaduto</th>
                <th className="p-3">Quem usa</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((item) => (
                <tr key={item.size} className="border-t border-[#d9e1ec]">
                  <td className="p-3">
                    <p className="text-lg font-black text-[#0b4d8c]">{item.size} m²</p>
                    <p className="text-xs text-[#6d7a89]">galpão modular</p>
                  </td>
                  <td className="p-3 font-black text-[#061d36]">
                    {formatCurrency(item.currentRent, 2)}/m²
                    <span className="block text-xs font-semibold text-[#6d7a89]">{formatCurrency(item.currentRent * item.size)}/mês</span>
                  </td>
                  <td className="p-3 font-black text-[#15803d]">
                    {formatCurrency(item.futureRent, 2)}/m²
                    <span className="block text-xs font-semibold text-[#6d7a89]">{formatCurrency(item.futureRent * item.size)}/mês</span>
                  </td>
                  <td className="p-3 text-[#5c6b7d]">{item.tenant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-lg bg-[#e9f2ff] p-3 text-sm leading-6 text-[#173c68]">
          Premissa: o viaduto não triplica automaticamente o aluguel. Ele triplica o fluxo e aumenta a disputa pelo ponto.
          Por isso o simulador usa alta de aluguel mais prudente, entre 25% e 35%.
        </p>
        <div className="mt-3 rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
          <p className="text-sm font-black text-[#061d36]">Pesquisa de mercado usada como base</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {MARKET_RENT_SAMPLES.map((sample) => (
              <div key={`${sample.region}-${sample.area}`} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-xs shadow-sm">
                <span className="font-bold text-[#5c6b7d]">{sample.region} | {formatNumber(sample.area)} m²</span>
                <span className="font-black text-[#0b4d8c]">{formatCurrency(sample.rent / sample.area, 2)}/m²</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#6d7a89]">
            Fonte: anuncios publicos do Viva Real para Blumenau, Itoupava Central, Fidelis e entorno. Leitura:
            galpoes pequenos tendem a pedir mais por m²; galpoes medios e grandes ficam mais perto de R$ 17 a R$ 26/m².
          </p>
        </div>
      </div>
    </section>
  );
}

function ScenarioPanel({ scenarios }: { scenarios: Array<Scenario & { monthly: number; capRate: number; vgv: number; profit: number; margin: number }> }) {
  return (
    <section className="rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <PanelHeader icon={BarChart3} title="Cenários financeiros pós-2027" />
      <div className="grid gap-3 p-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <article key={scenario.key} className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase text-[#f97316]">{scenario.name}</p>
            <p className="mt-2 text-sm leading-6 text-[#5c6b7d]">{scenario.note}</p>
            <MetricRow label="Aluguel mensal" value={formatCurrency(scenario.monthly)} />
            <MetricRow label="Yield on Cost" value={formatPercent(scenario.capRate)} />
            <MetricRow label="VGV" value={formatCurrency(scenario.vgv)} />
            <MetricRow label="Lucro" value={formatCurrency(scenario.profit)} />
            <div className="mt-3 h-2 overflow-hidden rounded-sm bg-[#d9e1ec]">
              <div className="h-full bg-[#f97316]" style={{ width: `${Math.max(8, Math.min(100, scenario.margin * 3))}%` }} />
            </div>
            <p className="mt-2 text-xs font-bold text-[#6d7a89]">Margem: {formatPercent(scenario.margin)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CostsPanel({ results }: { results: SimulationResult }) {
  const indirect = [
    ["ITBI da transação", COST_RATES.itbi, results.itbi, "Sobre o terreno"],
    ["Administração central", COST_RATES.centralAdmin, results.centralAdmin, "Sobre obra"],
    ["Administração local", COST_RATES.localAdmin, results.localAdmin, "Equipe e canteiro"],
    ["Risco pós-venda", COST_RATES.postSaleRisk, results.postSaleRisk, "Assistência e garantias"],
    ["Projetos e aprovações", COST_RATES.projectsAndFees, results.projectsAndFees, "Projetos, taxas e licenças"],
  ];

  return (
    <section className="rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <PanelHeader icon={Landmark} title="Estrutura de custos do simulador" />
      <div className="grid gap-4 p-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-lg bg-[#061d36] p-4 text-white">
          <p className="text-sm font-black uppercase text-[#ffb15f]">Custo direto</p>
          <p className="mt-3 text-4xl font-black">{formatCurrency(results.directConstruction)}</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Área construída multiplicada pelo CUB de Galpão Industrial (GI) de SC em tábua desonerada. Para supermercado, posto ou varejo, este número deve ser tratado como ponto de partida e refinado em orçamento específico.
          </p>
          <div className="mt-4 rounded-lg bg-white/8 p-3">
            <p className="text-xs font-bold uppercase text-white/55">Terreno na entrada</p>
            <p className="text-2xl font-black">{formatCurrency(results.landCost)}</p>
          </div>
          <div className="mt-4 rounded-lg bg-white/8 p-3">
            <p className="text-xs font-bold uppercase text-white/55">Referência CUB/SC</p>
            <p className="mt-2 text-sm leading-6 text-white/78">
              {CUB_SC_JUNE_2026.reference}: GI {formatCurrency(CUB_SC_JUNE_2026.industrialWarehouseGI, 2)}/m²,
              comercial médio {formatCurrency(CUB_SC_JUNE_2026.commercialAverage, 2)}/m² e residencial médio{" "}
              {formatCurrency(CUB_SC_JUNE_2026.residentialAverage, 2)}/m².
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {indirect.map(([label, rate, value, note]) => (
            <div key={String(label)} className="grid grid-cols-[1fr_80px_120px] items-center gap-3 rounded-lg border border-[#d9e1ec] p-3 text-sm">
              <div>
                <p className="font-black text-[#061d36]">{label}</p>
                <p className="text-xs text-[#6d7a89]">{note}</p>
              </div>
              <p className="text-right font-black text-[#f97316]">{formatPercent(Number(rate) * 100)}</p>
              <p className="text-right font-black text-[#0b4d8c]">{formatCurrency(Number(value))}</p>
            </div>
          ))}
          <div className="rounded-lg border border-[#f97316]/35 bg-[#fff7ed] p-3">
            <p className="text-sm font-black text-[#9a3412]">Despesas de venda</p>
            <p className="mt-1 text-sm leading-6 text-[#7c2d12]">
              Publicidade 2,0% + impostos estimados 6,73% + corretagem 5,0% = impacto de {formatPercent((COST_RATES.publicity + COST_RATES.saleTaxes + COST_RATES.brokerage) * 100)} sobre o VGV.
            </p>
          </div>
          <div className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
            <p className="text-sm font-black text-[#061d36]">Auditoria das fórmulas</p>
            <div className="mt-3 grid gap-2 text-xs font-semibold leading-5 text-[#5c6b7d]">
              <p><strong>Área construída:</strong> área do lote × taxa de ocupação.</p>
              <p><strong>Investimento total:</strong> terreno + obra direta + ITBI + administração + projetos + risco pós-venda.</p>
              <p><strong>NOI anual:</strong> aluguel mensal × 12 × 90%, usando 10% como fricção operacional.</p>
              <p><strong>Yield on Cost:</strong> NOI anual ÷ investimento total. Não é Cap Rate de imóvel pronto comprado no mercado.</p>
              <p><strong>Lucro de venda:</strong> VGV - investimento total - despesas de venda.</p>
              <p><strong>Margem patrimonial:</strong> lote × (R$ 1.800/m² - R$ 600/m²), premissa vinculada ao evento do viaduto.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InvestorPanel({ results }: { results: SimulationResult }) {
  return (
    <section className="rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <PanelHeader icon={ShieldCheck} title="Resumo comercial para investidores" />
      <div className="grid gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ScoreCard label="Potencial de crescimento" score="9,6" copy="Compra a R$ 600/m² com tese de R$ 1.800/m² até o viaduto." tone="green" />
          <ScoreCard label="Liquidez" score="8,7" copy="Frente longa, venda em frações e múltiplas vocações ampliam o público comprador." tone="blue" />
        </div>

        <div className="rounded-lg bg-[#061d36] p-4 text-white">
          <p className="text-sm font-black uppercase text-[#ffb15f]">Margem de segurança</p>
          <p className="mt-2 text-3xl font-black">{formatCurrency(results.safetySpread)}</p>
          <p className="mt-2 text-sm leading-6 text-white/76">
            Diferença entre a compra na cota atual e a tese de valor pós-viaduto, antes mesmo de considerar renda ou operação comercial.
          </p>
        </div>

        <div className="grid gap-3">
          <Argument title="1. Compra antes do evento" copy="O investidor entra antes da conclusão do viaduto, quando o mercado ainda não precificou totalmente o novo acesso." />
          <Argument title="2. Terreno pronto reduz surpresa" copy="Terraplanagem e licença na cota 15 encurtam prazo, reduzem risco de aprovação e dão velocidade para construir." />
          <Argument title="3. Renda modular dá saída dupla" copy="É possível ganhar com aluguel mensal ou vender módulos/participação com VGV maior depois da infraestrutura." />
        </div>
      </div>
    </section>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  help,
  tone,
}: {
  icon: typeof MapPinned;
  label: string;
  value: string;
  help: string;
  tone: "blue" | "green" | "orange";
}) {
  const color = {
    blue: "bg-[#e9f2ff] text-[#0b4d8c]",
    green: "bg-[#eaf8ef] text-[#15803d]",
    orange: "bg-[#fff1df] text-[#f97316]",
  }[tone];

  return (
    <article className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4">
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-lg ${color}`}>
        <Icon size={22} />
      </div>
      <p className="text-xs font-black uppercase text-[#6d7a89]">{label}</p>
      <p className="mt-1 text-3xl font-black text-[#061d36]">{value}</p>
      <p className="mt-1 text-sm text-[#6d7a89]">{help}</p>
    </article>
  );
}

function PanelHeader({ icon: Icon, title }: { icon: typeof MapPinned; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#d9e1ec] bg-[#061d36] px-4 py-3 text-white">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-[#ffb15f]" />
        <h2 className="text-sm font-black uppercase">{title}</h2>
      </div>
      <img
        src={logoSrc}
        alt="Carlito de Souza"
        width={120}
        height={42}
        className="hidden h-auto w-[86px] rounded-sm bg-white px-2 py-1 sm:block"
      />
    </div>
  );
}

function MiniProof({ icon: Icon, text }: { icon: typeof MapPinned; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
      <Icon size={17} className="shrink-0 text-[#f97316]" />
      <span>{text}</span>
    </div>
  );
}

function ValueStep({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-white/8 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f97316] font-black">{number}</div>
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/72">{copy}</p>
      </div>
    </div>
  );
}

function LocationFact({ icon: Icon, title, copy }: { icon: typeof MapPinned; title: string; copy: string }) {
  return (
    <div className="border-b border-[#d9e1ec] p-4 last:border-b-0">
      <Icon className="text-[#f97316]" size={26} />
      <p className="mt-3 font-black text-[#061d36]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#5c6b7d]">{copy}</p>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  digits = 0,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  digits?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-[#061d36]">{label}</span>
        <span className="rounded-md bg-white px-2 py-1 text-sm font-black text-[#0b4d8c] shadow-sm">
          {prefix}
          {formatNumber(value, digits)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[#f97316]"
      />
    </label>
  );
}

function ResultTile({ label, value, help, tone }: { label: string; value: string; help: string; tone: "blue" | "green" | "orange" }) {
  const color = {
    blue: "text-[#0b4d8c]",
    green: "text-[#15803d]",
    orange: "text-[#f97316]",
  }[tone];

  return (
    <article className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4">
      <p className="text-xs font-black uppercase text-[#6d7a89]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#6d7a89]">{help}</p>
    </article>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#d9e1ec] pt-3 text-sm">
      <span className="text-[#6d7a89]">{label}</span>
      <span className="font-black text-[#061d36]">{value}</span>
    </div>
  );
}

function ScoreCard({ label, score, copy, tone }: { label: string; score: string; copy: string; tone: "green" | "blue" }) {
  const color = tone === "green" ? "text-[#15803d]" : "text-[#0b4d8c]";
  return (
    <article className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4 text-center">
      <p className="text-sm font-black uppercase text-[#6d7a89]">{label}</p>
      <p className={`mt-2 text-5xl font-black ${color}`}>
        {score}<span className="text-2xl">/10</span>
      </p>
      <p className="mt-2 text-sm leading-6 text-[#5c6b7d]">{copy}</p>
    </article>
  );
}

function Argument({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-[#d9e1ec] p-3">
      <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-[#15803d]" />
      <div>
        <p className="font-black text-[#061d36]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#5c6b7d]">{copy}</p>
      </div>
    </div>
  );
}
