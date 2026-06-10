"use client";

import { useMemo, useState } from "react";

const ASSET = {
  totalArea: 128000,
  usefulArea: 68000,
  frontage: 1400,
  landCostM2: 600,
  landTargetM2: 1800,
  viaductDate: "outubro de 2027",
  coordinates: "-26.845397, -49.072970",
};

const CUB = {
  gi: 1366.85,
  commercial: 3297.09,
  residential: 3096.25,
};

const COST = {
  itbi: 0.02,
  centralAdmin: 0.04,
  localAdmin: 0.06,
  postSaleRisk: 0.015,
  projectsAndFees: 0.045,
  publicity: 0.02,
  saleTaxes: 0.0673,
  brokerage: 0.05,
};

const presets = [2500, 3000, 5000];

const vocations = [
  ["Supermercado", "Frente longa e fluxo crescente favorecem uma loja ancora."],
  ["Posto", "A rotula cria parada natural para veiculos e conveniencia."],
  ["Varejo", "Farmacia, material de construcao e servicos ganham visibilidade."],
  ["Logistica", "Galpoes modulares atendem estoque, entrega urbana e last mile."],
];

const rentSamples = [
  ["Itoupava Central", 119, 3500],
  ["Itoupava Central", 350, 6000],
  ["Itoupava Central", 749, 13500],
  ["Itoupava Central", 750, 17500],
  ["Fidelis", 90, 2500],
  ["Itoupavazinha", 450, 11500],
];

function money(value: number, digits = 0) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function num(value: number, digits = 0) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function pct(value: number, digits = 1) {
  return `${num(value, digits)}%`;
}

function yieldLabel(value: number) {
  if (value < 5) return "Fraco";
  if (value < 6.5) return "Atencao";
  if (value < 8.5) return "Bom";
  return "Forte";
}

export default function Home() {
  const [lotArea, setLotArea] = useState(5000);
  const [coverage, setCoverage] = useState(60);
  const [rentM2, setRentM2] = useState(30);
  const [occupancy, setOccupancy] = useState(92);
  const [saleM2, setSaleM2] = useState(6000);
  const builtArea = Math.round(lotArea * coverage / 100);

  const result = useMemo(() => {
    const landCost = lotArea * ASSET.landCostM2;
    const futureLandValue = lotArea * ASSET.landTargetM2;
    const directConstruction = builtArea * CUB.gi;
    const itbi = landCost * COST.itbi;
    const centralAdmin = directConstruction * COST.centralAdmin;
    const localAdmin = directConstruction * COST.localAdmin;
    const postSaleRisk = directConstruction * COST.postSaleRisk;
    const projectsAndFees = directConstruction * COST.projectsAndFees;
    const totalInvestment = landCost + directConstruction + itbi + centralAdmin + localAdmin + postSaleRisk + projectsAndFees;
    const monthlyRevenue = builtArea * rentM2 * occupancy / 100;
    const annualNoi = monthlyRevenue * 12 * 0.9;
    const yieldOnCost = annualNoi / totalInvestment * 100;
    const vgv = builtArea * saleM2;
    const saleExpenses = vgv * (COST.publicity + COST.saleTaxes + COST.brokerage);
    const profit = vgv - totalInvestment - saleExpenses;
    const margin = profit / vgv * 100;
    const safetySpread = futureLandValue - landCost;
    return { landCost, futureLandValue, directConstruction, itbi, centralAdmin, localAdmin, postSaleRisk, projectsAndFees, totalInvestment, monthlyRevenue, annualNoi, yieldOnCost, vgv, saleExpenses, profit, margin, safetySpread };
  }, [builtArea, lotArea, occupancy, rentM2, saleM2]);

  const scenarios = [
    ["Conservador", 24, 88, 5200],
    ["Base", 30, 92, 6000],
    ["Pos-viaduto", 36, 95, 6800],
  ].map(([name, rent, occ, sale]) => {
    const monthly = builtArea * Number(rent) * Number(occ) / 100;
    const noi = monthly * 12 * 0.9;
    const vgv = builtArea * Number(sale);
    const expenses = vgv * (COST.publicity + COST.saleTaxes + COST.brokerage);
    const profit = vgv - result.totalInvestment - expenses;
    return { name, monthly, yoc: noi / result.totalInvestment * 100, vgv, profit, margin: profit / vgv * 100 };
  });

  return (
    <main className="min-h-screen bg-[#eef3f8] text-[#10243d]">
      <header className="sticky top-0 z-20 border-b border-[#d9e1ec] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-black text-[#061d36]">Rua Guilherme Scharf, Blumenau - SC</p>
            <p className="text-xs font-semibold text-[#6d7a89]">Coordenadas {ASSET.coordinates} | viaduto previsto: {ASSET.viaductDate}</p>
          </div>
          <img src="/carlito-logo-investidor.svg" alt="Carlito de Souza Corretor de Imoveis" className="h-auto w-[132px] sm:w-[170px]" />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-5 sm:px-6 xl:grid-cols-[220px_1fr]">
        <aside className="hidden rounded-lg bg-[#061d36] p-4 text-white xl:block">
          <p className="text-xs font-bold uppercase text-white/55">Business Case</p>
          <h1 className="mt-1 text-xl font-black">Guilherme Scharf</h1>
          <nav className="mt-6 grid gap-2 text-sm font-bold text-white/75">
            <a href="#visao" className="rounded-md bg-[#f97316] px-3 py-2 text-white">Visao geral</a>
            <a href="#simulador" className="rounded-md px-3 py-2 hover:bg-white/10">Simulador</a>
            <a href="#mercado" className="rounded-md px-3 py-2 hover:bg-white/10">Mercado</a>
            <a href="#custos" className="rounded-md px-3 py-2 hover:bg-white/10">Custos</a>
            <a href="#investidor" className="rounded-md px-3 py-2 hover:bg-white/10">Investidor</a>
          </nav>
          <div className="mt-8 rounded-lg border border-[#f97316]/60 p-3">
            <p className="text-xs font-bold uppercase text-white/55">Contato</p>
            <p className="mt-1 text-lg font-black">47 99192-6000</p>
            <p className="text-xs text-white/65">CRECI 6894F</p>
          </div>
        </aside>

        <section className="grid gap-4">
          <section id="visao" className="grid gap-4 xl:grid-cols-[1fr_420px]">
            <div className="card p-5">
              <p className="text-sm font-black uppercase text-[#f97316]">Area estrategica na rotula</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#061d36] sm:text-5xl">Simulador simples para decidir rapido</h2>
              <p className="mt-3 max-w-4xl text-base leading-7 text-[#5c6b7d]">A area total mostra escala, mas a proposta comercial fica clara em fracoes de compra. O investidor escolhe o lote, ve a area construida estimada, a renda mensal, o VGV e o retorno.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi label="Area total" value={`${num(ASSET.totalArea)} m2`} note="potencial macro" />
                <Kpi label="Area util" value={`${num(ASSET.usefulArea)} m2`} note="base aproveitavel" />
                <Kpi label="Frente" value={`${num(ASSET.frontage)} m`} note="Guilherme Scharf" />
                <Kpi label="Entrada" value="R$ 600/m2" note="cota atual" />
              </div>
            </div>
            <div className="card overflow-hidden">
              <img src="/rotula-guilherme-scharf.svg" alt="Desenho da area da rotula" className="h-full min-h-[320px] w-full object-cover" />
            </div>
          </section>

          <section id="simulador" className="card">
            <PanelTitle title="Simulador por fracao" />
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
              <div className="grid gap-3">
                <div className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3">
                  <p className="text-sm font-black text-[#061d36]">Escolha o tamanho do lote</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {presets.map((area) => <button key={area} onClick={() => setLotArea(area)} className={`rounded-md border px-3 py-2 text-sm font-black ${lotArea === area ? "border-[#f97316] bg-[#f97316] text-white" : "border-[#d9e1ec] bg-white text-[#0b4d8c]"}`}>{num(area)} m2</button>)}
                  </div>
                </div>
                <Range label="Lote comprado" value={lotArea} min={2000} max={10000} step={250} suffix="m2" onChange={setLotArea} />
                <Range label="Ocupacao do lote" value={coverage} min={45} max={70} step={1} suffix="%" onChange={setCoverage} />
                <Range label="Aluguel medio" value={rentM2} min={17} max={45} step={1} prefix="R$ " suffix="/m2" onChange={setRentM2} />
                <Range label="Ocupacao media" value={occupancy} min={70} max={98} step={1} suffix="%" onChange={setOccupancy} />
                <Range label="Venda pos-2027" value={saleM2} min={4200} max={7600} step={100} prefix="R$ " suffix="/m2" onChange={setSaleM2} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Result label="Area construida" value={`${num(builtArea)} m2`} note="lote x ocupacao" />
                <Result label="Investimento" value={money(result.totalInvestment)} note="terreno + obra + indiretos" />
                <Result label="Receita mensal" value={money(result.monthlyRevenue)} note="aluguel com ocupacao" />
                <Result label="Yield on Cost" value={pct(result.yieldOnCost)} note={`${yieldLabel(result.yieldOnCost)} para renda`} />
                <div className="rounded-lg border border-[#d9e1ec] bg-[#061d36] p-4 text-white sm:col-span-2">
                  <p className="text-xs font-black uppercase text-[#ffb15f]">Margem de seguranca patrimonial</p>
                  <p className="mt-2 text-3xl font-black">{money(result.safetySpread)}</p>
                  <p className="mt-2 text-sm leading-6 text-white/75">Diferenca entre comprar a R$ 600/m2 e a tese de R$ 1.800/m2 apos o viaduto, antes de considerar aluguel.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="mercado" className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="card">
              <PanelTitle title="Vocacao comercial" />
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {vocations.map(([title, text]) => <article key={title} className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4"><p className="font-black text-[#061d36]">{title}</p><p className="mt-1 text-sm leading-6 text-[#5c6b7d]">{text}</p></article>)}
              </div>
            </div>
            <div className="card">
              <PanelTitle title="Pesquisa de aluguel" />
              <div className="grid gap-2 p-4">
                {rentSamples.map(([region, area, rent]) => <div key={`${region}-${area}`} className="flex items-center justify-between gap-3 rounded-md bg-[#f8fafc] px-3 py-2 text-sm"><span className="font-bold text-[#5c6b7d]">{region} | {num(Number(area))} m2</span><span className="font-black text-[#0b4d8c]">{money(Number(rent) / Number(area), 2)}/m2</span></div>)}
                <p className="mt-2 rounded-md bg-[#e9f2ff] p-3 text-sm leading-6 text-[#173c68]">Leitura: galpoes pequenos pedem mais por m2; medios e grandes ficam mais perto de R$ 17 a R$ 26/m2. A tese pos-viaduto usa aumento prudente de aluguel, nao triplica a renda automaticamente.</p>
              </div>
            </div>
          </section>

          <section className="card">
            <PanelTitle title="Cenarios financeiros" />
            <div className="grid gap-3 p-4 lg:grid-cols-3">
              {scenarios.map((s) => <article key={String(s.name)} className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4"><p className="text-xs font-black uppercase text-[#f97316]">{s.name}</p><Line label="Aluguel mensal" value={money(s.monthly)} /><Line label="Yield on Cost" value={pct(s.yoc)} /><Line label="VGV" value={money(s.vgv)} /><Line label="Lucro" value={money(s.profit)} /><p className="mt-3 text-xs font-bold text-[#6d7a89]">Margem: {pct(s.margin)}</p></article>)}
            </div>
          </section>

          <section id="custos" className="card">
            <PanelTitle title="Custos e formulas auditadas" />
            <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg bg-[#061d36] p-4 text-white">
                <p className="text-xs font-black uppercase text-[#ffb15f]">CUB SC Junho/2026</p>
                <p className="mt-2 text-3xl font-black">GI {money(CUB.gi, 2)}/m2</p>
                <p className="mt-2 text-sm leading-6 text-white/75">Comercial medio: {money(CUB.commercial, 2)}/m2. Residencial medio: {money(CUB.residential, 2)}/m2. Para supermercado e posto, o GI e ponto de partida, nao orcamento definitivo.</p>
              </div>
              <div className="grid gap-2 text-sm">
                <Line label="Terreno" value={money(result.landCost)} />
                <Line label="Obra direta" value={money(result.directConstruction)} />
                <Line label="ITBI 2%" value={money(result.itbi)} />
                <Line label="Administracao central 4%" value={money(result.centralAdmin)} />
                <Line label="Administracao local 6%" value={money(result.localAdmin)} />
                <Line label="Risco pos-venda 1,5%" value={money(result.postSaleRisk)} />
                <Line label="Projetos e aprovacoes 4,5%" value={money(result.projectsAndFees)} />
                <Line label="Despesas de venda 13,73%" value={money(result.saleExpenses)} />
              </div>
            </div>
            <div className="grid gap-2 px-4 pb-4 text-sm leading-6 text-[#5c6b7d]">
              <p><strong>Investimento total:</strong> terreno + obra direta + custos indiretos.</p>
              <p><strong>NOI anual:</strong> aluguel mensal x 12 x 90%, usando 10% como friccao operacional.</p>
              <p><strong>Yield on Cost:</strong> NOI anual dividido pelo custo total. Nao e Cap Rate de imovel pronto comprado no mercado.</p>
              <p><strong>Lucro:</strong> VGV - investimento total - despesas de venda.</p>
            </div>
          </section>

          <section id="investidor" className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="card p-5">
              <p className="text-sm font-black uppercase text-[#f97316]">Ranking comercial</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Score label="Potencial de crescimento" score="9,6" />
                <Score label="Liquidez" score="8,7" />
              </div>
            </div>
            <div className="card p-5">
              <p className="text-sm font-black uppercase text-[#f97316]">3 argumentos finais</p>
              <ol className="mt-3 grid gap-3 text-sm leading-6 text-[#5c6b7d]">
                <li><strong>1. Compra antes do evento:</strong> entrada antes de o viaduto ser totalmente precificado.</li>
                <li><strong>2. Terreno pronto:</strong> terraplanagem e licenca na cota 15 reduzem risco e tempo.</li>
                <li><strong>3. Saida dupla:</strong> renda mensal por aluguel ou venda futura com VGV maior.</li>
              </ol>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function PanelTitle({ title }: { title: string }) {
  return <div className="panel-title"><span>{title}</span><img src="/carlito-logo-investidor.svg" alt="Carlito" className="hidden h-auto w-[92px] rounded bg-white px-2 py-1 sm:block" /></div>;
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4"><p className="text-xs font-black uppercase text-[#6d7a89]">{label}</p><p className="mt-1 text-3xl font-black text-[#061d36]">{value}</p><p className="mt-1 text-sm text-[#6d7a89]">{note}</p></article>;
}

function Range({ label, value, min, max, step, prefix = "", suffix = "", onChange }: { label: string; value: number; min: number; max: number; step: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  return <label className="block rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-black text-[#061d36]">{label}</span><span className="rounded bg-white px-2 py-1 text-sm font-black text-[#0b4d8c] shadow-sm">{prefix}{num(value)}{suffix}</span></div><input className="mt-3 w-full" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Result({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4"><p className="text-xs font-black uppercase text-[#6d7a89]">{label}</p><p className="mt-2 text-2xl font-black text-[#0b4d8c]">{value}</p><p className="mt-1 text-xs font-semibold text-[#6d7a89]">{note}</p></article>;
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-[#d9e1ec] py-2"><span className="text-[#6d7a89]">{label}</span><span className="font-black text-[#061d36]">{value}</span></div>;
}

function Score({ label, score }: { label: string; score: string }) {
  return <article className="rounded-lg border border-[#d9e1ec] bg-[#f8fafc] p-4 text-center"><p className="text-sm font-black uppercase text-[#6d7a89]">{label}</p><p className="mt-2 text-5xl font-black text-[#0b4d8c]">{score}<span className="text-2xl">/10</span></p></article>;
}
