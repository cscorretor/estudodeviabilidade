"use client";
/* eslint-disable @next/next/no-img-element -- Logo uses a fixed public path to stay reliable on GitHub Pages. */

import Image from "next/image";
import plantaReal from "../../../public/planta-real-guilherme-scharf.png";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock3,
  Fuel,
  Gauge,
  Landmark,
  MapPinned,
  MessageCircle,
  Presentation,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Store,
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
  builtArea: number;
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
  annualGrossRevenue: number;
  annualNoi: number;
  capRate: number;
  vgv: number;
  saleExpenses: number;
  profit: number;
  margin: number;
  monthlyRevenue2027: number;
  safetySpread: number;
  costPerBuiltM2: number;
  paybackYears: number;
  roiOnSale: number;
  equityMultiple: number;
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
const WHATSAPP_URL =
  "https://wa.me/5547991926000?text=Ol%C3%A1%2C%20quero%20analisar%20uma%20fra%C3%A7%C3%A3o%20da%20%C3%A1rea%20Guilherme%20Scharf.";

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

function calculateFinancials({
  lotArea,
  coverage,
  cubM2,
  rentM2,
  occupancy,
  saleM2,
}: {
  lotArea: number;
  coverage: number;
  cubM2: number;
  rentM2: number;
  occupancy: number;
  saleM2: number;
}): SimulationResult {
  const builtArea = Math.round(lotArea * (coverage / 100));
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
  const annualGrossRevenue = monthlyRevenue * 12;
  const annualNoi = annualGrossRevenue * 0.9;
  const capRate = totalInvestment > 0 ? (annualNoi / totalInvestment) * 100 : 0;
  const vgv = builtArea * saleM2;
  const saleExpenses = vgv * (COST_RATES.publicity + COST_RATES.saleTaxes + COST_RATES.brokerage);
  const profit = vgv - totalInvestment - saleExpenses;
  const margin = vgv > 0 ? (profit / vgv) * 100 : 0;
  const monthlyRevenue2027 = builtArea * 36 * 0.95;
  const costPerBuiltM2 = builtArea > 0 ? totalInvestment / builtArea : 0;
  const paybackYears = annualNoi > 0 ? totalInvestment / annualNoi : 0;
  const roiOnSale = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  const equityMultiple = totalInvestment > 0 ? (vgv - saleExpenses) / totalInvestment : 0;

  return {
    builtArea,
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
    annualGrossRevenue,
    annualNoi,
    capRate,
    vgv,
    saleExpenses,
    profit,
    margin,
    monthlyRevenue2027,
    safetySpread: futureLandValue - landCost,
    costPerBuiltM2,
    paybackYears,
    roiOnSale,
    equityMultiple,
  };
}

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

  const results = useMemo(
    () => calculateFinancials({ lotArea, coverage, cubM2, rentM2, occupancy, saleM2 }),
    [coverage, cubM2, lotArea, occupancy, rentM2, saleM2],
  );

  const fractionSummaries = useMemo(
    () =>
      LOT_PRESETS.map((area) => ({
        lotArea: area,
        ...calculateFinancials({ lotArea: area, coverage, cubM2, rentM2, occupancy, saleM2 }),
      })),
    [coverage, cubM2, occupancy, rentM2, saleM2],
  );

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
    { label: "Visão geral", icon: BarChart3, id: "visao-geral" },
    { label: "Localização", icon: MapPinned, id: "localizacao" },
    { label: "Mercado", icon: Truck, id: "mercado" },
    { label: "Simulador", icon: Calculator, id: "simulador" },
    { label: "Custos", icon: Landmark, id: "custos" },
    { label: "Investidor", icon: ShieldCheck, id: "investidor" },
  ];

  const handleNavClick = (label: string, id: string) => {
    setActiveSection(label);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#10243d]">
      <Header nav={nav} activeSection={activeSection} onNavClick={handleNavClick} />

      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
            <section
              id="visao-geral"
              className="relative isolate grid min-h-[680px] scroll-mt-24 overflow-hidden rounded-[2px] bg-[#061d36] shadow-2xl xl:grid-cols-[1.03fr_0.97fr]"
            >
              <Image
                src={plantaReal}
                alt="Planta aérea real do terreno na Rua Guilherme Scharf"
                fill
                priority
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,29,54,0.98)_0%,rgba(6,29,54,0.90)_34%,rgba(6,29,54,0.55)_64%,rgba(6,29,54,0.18)_100%)]" />
              <div className="relative z-10 flex flex-col justify-between p-6 text-white sm:p-8 lg:p-12">
                <div>
                  <p className="max-w-fit border-l-4 border-[#f97316] pl-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffb15f]">
                    Memorando de investimento imobiliário
                  </p>
                  <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl">
                    Guilherme Scharf antes da reprecificação do corredor
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
                    Frações comerciais com frente estratégica, tese de renda e potencial patrimonial associado à
                    conexão com a Via-Expressa. Um ativo para quem busca entrar antes da maturação urbana da região.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 hover:bg-[#ea580c]"
                    >
                      <MessageCircle size={18} />
                      Quero analisar uma fração
                    </a>
                    <button
                      type="button"
                      onClick={() => handleNavClick("Simulador", "simulador")}
                      className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur hover:bg-white/18"
                    >
                      <Calculator size={18} />
                      Simular investimento
                    </button>
                  </div>
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  <HeroProof label="Entrada" value="R$ 600/m²" copy="Cota atual da fração" tone="dark" />
                  <HeroProof label="Cenário-alvo" value="R$ 1.800/m²" copy="Tese patrimonial pós-2027" tone="dark" />
                  <HeroProof label="Frente" value="1.400 m" copy="Exposição para a Guilherme Scharf" tone="dark" />
                </div>
              </div>
              <div className="relative z-10 flex items-end p-6 sm:p-8 lg:p-12">
                <div className="w-full border border-white/18 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center bg-[#f97316]">
                      <Presentation size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb15f]">Tese em 30 segundos</p>
                      <p className="text-xl font-black">Renda mensal + valorização patrimonial</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <ValueStep number="1" title="Comprar antes do evento" copy="Entrada antes da conclusão prevista do viaduto, quando a tese ainda não foi totalmente absorvida pelo preço." />
                    <ValueStep number="2" title="Transformar frente em renda" copy="A frente de 1.400 m permite modular supermercado, posto, serviços, varejo e logística urbana." />
                    <ValueStep number="3" title="Ter duas saídas" copy="Aluguel recorrente ou venda futura com VGV maior quando o corredor estiver mais maduro." />
                  </div>
                  <div className="mt-5 border-t border-white/14 pt-4 text-xs font-semibold leading-5 text-white/68">
                    Premissa, não promessa: os cenários dependem de custo executivo, ocupação, prazo da infraestrutura
                    e mercado de locação no momento da implantação.
                  </div>
                </div>
              </div>
            </section>

            <InvestmentOptionsPanel
              summaries={fractionSummaries}
              selectedLot={lotArea}
              onSelect={(area) => {
                setLotArea(area);
                handleNavClick("Simulador", "simulador");
              }}
            />

            <InvestmentThesisPanel />

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

            <RiskAndActionPanel />
      </div>
    </main>
  );
}

function Header({
  nav,
  activeSection,
  onNavClick,
}: {
  nav: Array<{ label: string; icon: typeof MapPinned; id: string }>;
  activeSection: string;
  onNavClick: (label: string, id: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9e1ec] bg-white/94 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={logoSrc}
            alt="Carlito de Souza Corretor de Imóveis"
            width={210}
            height={72}
            className="h-auto w-[130px] sm:w-[170px]"
          />
          <div className="min-w-0">
            <p className="hidden text-xs font-black uppercase tracking-[0.18em] text-[#0b4d8c] sm:block">
              Investment memo imobiliário
            </p>
            <p className="hidden text-xs font-semibold text-[#6d7a89] md:block">
              Rua Guilherme Scharf, Blumenau - SC
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-1 rounded-full border border-[#d9e1ec] bg-[#f8fafc] p-1 lg:flex">
          {nav.map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => onNavClick(item.label, item.id)}
              className={`rounded-full px-3 py-2 text-xs font-black ${
                activeSection === item.label ? "bg-[#061d36] text-white" : "text-[#5c6b7d] hover:bg-white hover:text-[#061d36]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-[#ea580c]"
        >
          <MessageCircle size={16} />
          <span className="hidden sm:inline">Falar com Carlito</span>
          <span className="sm:hidden">Contato</span>
        </a>
      </div>
    </header>
  );
}

function InvestmentOptionsPanel({
  summaries,
  selectedLot,
  onSelect,
}: {
  summaries: Array<SimulationResult & { lotArea: number }>;
  selectedLot: number;
  onSelect: (area: number) => void;
}) {
  return (
    <section className="mt-4 rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <div className="grid gap-4 border-b border-[#d9e1ec] p-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase text-[#f97316]">Escolha sua fração de investimento</p>
          <h2 className="mt-2 text-2xl font-black text-[#061d36] sm:text-3xl">
            A decisão começa pelo tamanho do lote
          </h2>
        </div>
        <p className="text-sm leading-6 text-[#5c6b7d]">
          Estes cartões usam as mesmas premissas do simulador: compra a R$ 600/m², ocupação do lote,
          CUB GI/SC, aluguel médio e preço de venda pós-2027. A ideia é comparar opções sem matemática escondida.
        </p>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-3">
        {summaries.map((item) => {
          const isSelected = selectedLot === item.lotArea;
          return (
            <article
              key={item.lotArea}
              className={`rounded-lg border p-4 ${
                isSelected ? "border-[#f97316] bg-[#fff7ed]" : "border-[#d9e1ec] bg-[#f8fafc]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-[#6d7a89]">Fração</p>
                  <p className="mt-1 text-3xl font-black text-[#061d36]">{formatNumber(item.lotArea)} m²</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(item.lotArea)}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${
                    isSelected ? "bg-[#f97316] text-white" : "bg-white text-[#0b4d8c] ring-1 ring-[#d9e1ec]"
                  }`}
                >
                  Simular
                </button>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <MetricRow label="Aporte total estimado" value={formatCurrency(item.totalInvestment)} />
                <MetricRow label="Área construída" value={`${formatNumber(item.builtArea)} m²`} />
                <MetricRow label="Aluguel mensal" value={formatCurrency(item.monthlyRevenue)} />
                <MetricRow label="Yield on Cost" value={formatPercent(item.capRate)} />
                <MetricRow label="Lucro na venda" value={formatCurrency(item.profit)} />
              </div>
              <div className="mt-4 rounded-lg bg-white p-3 text-xs font-semibold leading-5 text-[#5c6b7d] ring-1 ring-[#d9e1ec]">
                Payback teórico de {formatNumber(item.paybackYears, 1)} anos pelo NOI e ROI de venda de{" "}
                {formatPercent(item.roiOnSale)} no cenário selecionado.
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function InvestmentThesisPanel() {
  const thesis = [
    {
      title: "Localização",
      value: "Rótula Guilherme Scharf",
      copy: "Ponto de leitura fácil para varejo e serviços, com frente longa e acesso em transformação.",
    },
    {
      title: "Catalisador",
      value: "Viaduto em 2027",
      copy: "A conexão com a Via-Expressa pode reposicionar a rua de via local para corredor de exposição.",
    },
    {
      title: "Preço",
      value: "Assimetria de entrada",
      copy: "Compra na cota atual de R$ 600/m² contra cenário-alvo patrimonial superior pós-infraestrutura.",
    },
    {
      title: "Liquidez",
      value: "Venda em frações",
      copy: "A área total cria escala, mas o investidor decide por lotes menores, mais fáceis de analisar e negociar.",
    },
  ];

  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-[#14385f] bg-[#061d36] shadow-sm">
      <div className="grid gap-4 border-b border-white/10 p-4 text-white lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[#ffb15f]">Narrativa de investimento</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">O que precisa ficar na cabeça do investidor</h2>
        </div>
        <p className="text-sm leading-6 text-white/72">
          A oportunidade combina localização com exposição comercial, evento de infraestrutura e entrada antes da
          possível reprecificação do corredor. O investidor pode analisar renda, valorização e liquidez por fração.
        </p>
      </div>
      <div className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
        {thesis.map((item) => (
          <article key={item.title} className="bg-[#061d36] p-4 text-white">
            <p className="text-xs font-black uppercase text-[#ffb15f]">{item.title}</p>
            <p className="mt-2 text-xl font-black">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-white/68">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MapPanel() {
  return (
    <section id="localizacao" className="scroll-mt-20 overflow-hidden rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
      <PanelHeader icon={MapPinned} title="Planta real do ativo e frente comercial" />
      <div className="grid gap-0 lg:grid-cols-[1fr_230px]">
        <div className="relative min-h-[440px] overflow-hidden bg-[#dde8f2]">
          <Image
            src={plantaReal}
            alt="Planta real do terreno com frente para a Rua Guilherme Scharf"
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
    <section id="simulador" className="scroll-mt-20 rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
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
            <p className="mt-1 text-sm text-[#5c6b7d]">Área construída estimada para calcular aluguel, ROI, VGV e Yield on Cost.</p>
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
          <ResultTile label="NOI anual" value={formatCurrency(results.annualNoi)} help="Receita anual menos 10% de fricção" tone="green" />
          <ResultTile label="Yield on Cost" value={formatPercent(results.capRate)} help="NOI anual / custo total" tone="orange" />
          <ResultTile label="Lucro estimado" value={formatCurrency(results.profit)} help="Venda menos custos e despesas" tone="green" />
          <ResultTile label="ROI na venda" value={formatPercent(results.roiOnSale)} help="Lucro / investimento total" tone="orange" />
          <ResultTile label="Payback teórico" value={`${formatNumber(results.paybackYears, 1)} anos`} help="Investimento / NOI anual" tone="blue" />
          <ResultTile label="Custo por m² pronto" value={formatCurrency(results.costPerBuiltM2)} help="Custo total / área construída" tone="blue" />
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

function RiskAndActionPanel() {
  const risks = [
    {
      title: "Prazo do viaduto",
      copy: "A tese de valorização depende da entrega e do efeito real da nova mobilidade. A data deve ser acompanhada como marco de decisão.",
    },
    {
      title: "Custo real da obra",
      copy: "CUB é referência, não orçamento executivo. Supermercado, posto e varejo podem exigir padrão construtivo e infraestrutura diferentes.",
    },
    {
      title: "Velocidade de locação",
      copy: "O aluguel projetado só vira retorno com ocupação. O simulador permite reduzir ocupação para enxergar um cenário mais prudente.",
    },
    {
      title: "Preço de saída",
      copy: "R$ 1.800/m² é tese de valor patrimonial, não garantia. O preço final dependerá de mercado, acesso, demanda e negociação.",
    },
  ];

  return (
    <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-lg border border-[#d9e1ec] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock3 className="text-[#f97316]" size={22} />
          <h2 className="text-lg font-black text-[#061d36]">Por que o preço ainda existe?</h2>
        </div>
        <div className="mt-4 grid gap-3">
          <Argument
            title="1. Evento ainda não totalmente precificado"
            copy="O viaduto previsto para outubro de 2027 é o gatilho. Antes da entrega, a leitura de valor ainda exige visão de futuro."
          />
          <Argument
            title="2. Área grande permite negociação em frações"
            copy="O terreno total é amplo, mas a compra pode ser estruturada por lotes menores, abrindo espaço para diferentes perfis de investidor."
          />
          <Argument
            title="3. Produto ainda precisa ser empacotado"
            copy="A oportunidade ganha liquidez quando vira uma tese simples: fração, vocação, custo, renda, risco e saída."
          />
        </div>
      </div>

      <div className="rounded-lg border border-[#d9e1ec] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-[#f97316]" size={22} />
          <h2 className="text-lg font-black text-[#061d36]">Riscos que o investidor deve enxergar</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {risks.map((risk) => (
            <article key={risk.title} className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
              <p className="font-black text-[#061d36]">{risk.title}</p>
              <p className="mt-1 text-sm leading-6 text-[#5c6b7d]">{risk.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-[#061d36] p-4 text-white">
          <p className="text-sm font-black uppercase text-[#ffb15f]">Próximo passo comercial</p>
          <p className="mt-2 text-2xl font-black">Receber estudo da fração no WhatsApp</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            O investidor deve sair da página com uma decisão simples: escolher uma fração e pedir a simulação personalizada.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-4 py-3 text-sm font-black text-white hover:bg-[#ea580c]"
          >
            <MessageCircle size={18} />
            Solicitar simulação agora
          </a>
        </div>
      </div>
    </section>
  );
}

function MarketPanel() {
  return (
    <section id="mercado" className="scroll-mt-20 rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
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
        <div className="overflow-x-auto rounded-lg border border-[#d9e1ec]">
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
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
    <section id="custos" className="scroll-mt-20 rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
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
            <div key={String(label)} className="grid gap-2 rounded-lg border border-[#d9e1ec] p-3 text-sm sm:grid-cols-[1fr_80px_120px] sm:items-center sm:gap-3">
              <div>
                <p className="font-black text-[#061d36]">{label}</p>
                <p className="text-xs text-[#6d7a89]">{note}</p>
              </div>
              <p className="font-black text-[#f97316] sm:text-right">{formatPercent(Number(rate) * 100)}</p>
              <p className="font-black text-[#0b4d8c] sm:text-right">{formatCurrency(Number(value))}</p>
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
    <section id="investidor" className="scroll-mt-20 rounded-lg border border-[#d9e1ec] bg-white shadow-sm">
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

function HeroProof({
  label,
  value,
  copy,
  tone = "light",
}: {
  label: string;
  value: string;
  copy: string;
  tone?: "light" | "dark";
}) {
  if (tone === "dark") {
    return (
      <div className="border border-white/16 bg-white/10 p-4 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffb15f]">{label}</p>
        <p className="mt-2 text-3xl font-black text-white">{value}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-white/68">{copy}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
      <p className="text-xs font-black uppercase text-[#6d7a89]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#061d36]">{value}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#6d7a89]">{copy}</p>
    </div>
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
