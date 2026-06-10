"use client";

import {
  type SimulationResults,
  type SimulatorInputs,
  type WarehouseRecord,
  CUB_REFERENCES,
  calculateKpis,
  computeWarehouse,
  formatCurrency,
  formatNumber,
} from "./data";

type WorkbookContext = {
  database: WarehouseRecord[];
  filters: {
    bairro: string;
    porte: string;
    padrao: string;
  };
  simulationInputs: SimulatorInputs;
  simulationResults: SimulationResults;
};

type Cell = {
  ref: string;
  type?: "n" | "s";
  value?: number | string;
  formula?: string;
  style?: number;
};

type ZipFile = {
  name: string;
  data: Uint8Array;
};

const encoder = new TextEncoder();

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function utf8(value: string) {
  return encoder.encode(value);
}

function cell(ref: string, value: string | number, style = 0, formula?: string): Cell {
  return {
    ref,
    value,
    formula,
    style,
    type: typeof value === "number" ? "n" : "s",
  };
}

function buildCols(widths: number[]) {
  return `<cols>${widths
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join("")}</cols>`;
}

function buildSheetXml({
  cells,
  merges = [],
  widths = [],
  dimension,
  autoFilter,
  freeze,
  showGridLines = true,
}: {
  cells: Cell[];
  merges?: string[];
  widths?: number[];
  dimension: string;
  autoFilter?: string;
  freeze?: { x?: number; y?: number; topLeftCell?: string };
  showGridLines?: boolean;
}) {
  const rows = new Map<number, Cell[]>();

  for (const currentCell of cells) {
    const rowNumber = Number(currentCell.ref.match(/\d+/)?.[0] || 1);
    const row = rows.get(rowNumber) || [];
    row.push(currentCell);
    rows.set(rowNumber, row);
  }

  const rowXml = [...rows.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rowNumber, rowCells]) => {
      const cellsXml = rowCells
        .sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }))
        .map((currentCell) => {
          const styleAttr = currentCell.style !== undefined ? ` s="${currentCell.style}"` : "";
          if (currentCell.formula) {
            return `<c r="${currentCell.ref}"${styleAttr}><f>${xmlEscape(currentCell.formula)}</f><v>${currentCell.value ?? 0}</v></c>`;
          }
          if (currentCell.type === "n") {
            return `<c r="${currentCell.ref}"${styleAttr}><v>${currentCell.value ?? 0}</v></c>`;
          }
          return `<c r="${currentCell.ref}" t="inlineStr"${styleAttr}><is><t>${xmlEscape(String(currentCell.value ?? ""))}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowNumber}">${cellsXml}</row>`;
    })
    .join("");

  const mergeXml = merges.length
    ? `<mergeCells count="${merges.length}">${merges.map((ref) => `<mergeCell ref="${ref}"/>`).join("")}</mergeCells>`
    : "";

  const paneXml = freeze
    ? `<pane xSplit="${freeze.x ?? 0}" ySplit="${freeze.y ?? 0}" topLeftCell="${freeze.topLeftCell ?? "A1"}" activePane="bottomRight" state="frozen"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetViews>
    <sheetView workbookViewId="0"${showGridLines ? "" : ` showGridLines="0"`}>${paneXml}</sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  ${widths.length ? buildCols(widths) : ""}
  <sheetData>${rowXml}</sheetData>
  ${autoFilter ? `<autoFilter ref="${autoFilter}"/>` : ""}
  ${mergeXml}
</worksheet>`;
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="4">
    <numFmt numFmtId="164" formatCode="R$ #,##0.00"/>
    <numFmt numFmtId="165" formatCode="R$ #,##0"/>
    <numFmt numFmtId="166" formatCode="0.00%"/>
    <numFmt numFmtId="167" formatCode="#,##0.0"/>
  </numFmts>
  <fonts count="7">
    <font><sz val="11"/><color rgb="FFD7DFEA"/><name val="Aptos"/></font>
    <font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Aptos Display"/></font>
    <font><b/><sz val="11"/><color rgb="FF9FB3C8"/><name val="Aptos"/></font>
    <font><b/><sz val="20"/><color rgb="FF38E1A4"/><name val="Aptos Display"/></font>
    <font><b/><sz val="20"/><color rgb="FF6EA8FF"/><name val="Aptos Display"/></font>
    <font><b/><sz val="20"/><color rgb="FFFFC34D"/><name val="Aptos Display"/></font>
    <font><b/><sz val="20"/><color rgb="FF55C8FF"/><name val="Aptos Display"/></font>
  </fonts>
  <fills count="8">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0E172A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F6D53"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E293B"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF020617"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF12976E"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF111827"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FF334155"/></left>
      <right style="thin"><color rgb="FF334155"/></right>
      <top style="thin"><color rgb="FF334155"/></top>
      <bottom style="thin"><color rgb="FF334155"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FF1F7A5E"/></left>
      <right style="thin"><color rgb="FF1F7A5E"/></right>
      <top style="thin"><color rgb="FF1F7A5E"/></top>
      <bottom style="thin"><color rgb="FF1F7A5E"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="14">
    <xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFill="1" applyFont="1"/>
    <xf numFmtId="0" fontId="1" fillId="3" borderId="2" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf>
    <xf numFmtId="164" fontId="3" fillId="4" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyNumberFormat="1"/>
    <xf numFmtId="164" fontId="4" fillId="4" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyNumberFormat="1"/>
    <xf numFmtId="0" fontId="5" fillId="4" borderId="1" applyFill="1" applyFont="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="6" fillId="4" borderId="1" applyFill="1" applyFont="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="7" borderId="1" applyFill="1" applyFont="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFill="1" applyFont="1" applyBorder="1"/>
    <xf numFmtId="165" fontId="0" fillId="7" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyNumberFormat="1"/>
    <xf numFmtId="0" fontId="0" fillId="7" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
    <xf numFmtId="166" fontId="3" fillId="5" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyNumberFormat="1"/>
    <xf numFmtId="167" fontId="5" fillId="5" borderId="1" applyFill="1" applyFont="1" applyBorder="1" applyNumberFormat="1"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

function buildWorkbookXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView activeTab="0"/></bookViews>
  <sheets>
    <sheet name="DASHBOARD" sheetId="1" r:id="rId1"/>
    <sheet name="BD_LOCACAO" sheetId="2" r:id="rId2"/>
    <sheet name="PARAMS_CUSTOS" sheetId="3" r:id="rId3"/>
  </sheets>
  <calcPr calcId="191029" fullCalcOnLoad="1"/>
</workbook>`;
}

function buildWorkbookRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function buildRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function buildContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function buildDashboardSheet(context: WorkbookContext) {
  const records = context.database.map(computeWarehouse);
  const kpis = calculateKpis(records);
  const lastRow = records.length + 1;

  const cells: Cell[] = [
    cell("A1", "Blumenau_Galpoes_Analise_CUB2026.xlsx", 1),
    cell("A3", "Monitor de inteligência imobiliária industrial | Fidélis + Itoupava Central", 2),
    cell("A5", "Segmentação ativa", 2),
    cell("A6", `Bairro: ${context.filters.bairro}`, 8),
    cell("A7", `Porte: ${context.filters.porte}`, 8),
    cell("A8", `Padrão: ${context.filters.padrao}`, 8),
    cell("A10", "Faixas de leitura", 2),
    cell("A11", "Pequeno: até 350 m²", 8),
    cell("A12", "Médio: 350 a 1.000 m²", 8),
    cell("A13", "Grande: acima de 1.000 m²", 8),
    cell("E5", "Média ponderada", 2),
    cell("E6", kpis.precoMedioPonderado, 3, `IFERROR(SUBTOTAL(109,BD_LOCACAO!E2:E${lastRow})/SUBTOTAL(109,BD_LOCACAO!D2:D${lastRow}),0)`),
    cell("J5", "Média simples", 2),
    cell("J6", kpis.precoMedioSimples, 4, `IFERROR(AVERAGE(BD_LOCACAO!F2:F${lastRow}),0)`),
    cell("E9", "Soma de área útil", 2),
    cell("E10", kpis.totalArea, 5, `SUBTOTAL(109,BD_LOCACAO!D2:D${lastRow})`),
    cell("J9", "Ativos filtrados", 2),
    cell("J10", kpis.totalCount, 6, `SUBTOTAL(103,BD_LOCACAO!B2:B${lastRow})`),
    cell("E13", "Aluguel médio por bairro", 2),
    cell(
      "E14",
      "Fidélis",
      9,
    ),
    cell(
      "G14",
      records.filter((item) => item.bairro === "Fidélis").reduce((acc, item) => acc + item.aluguel, 0) /
        records.filter((item) => item.bairro === "Fidélis").reduce((acc, item) => acc + item.area, 0),
      3,
      `IFERROR(SUMIF(BD_LOCACAO!C2:C${lastRow},"Fidélis",BD_LOCACAO!E2:E${lastRow})/SUMIF(BD_LOCACAO!C2:C${lastRow},"Fidélis",BD_LOCACAO!D2:D${lastRow}),0)`,
    ),
    cell("J13", "Distribuição da amostra", 2),
    cell("J14", "Fidélis", 9),
    cell(
      "L14",
      records.filter((item) => item.bairro === "Fidélis").length,
      6,
      `COUNTIF(BD_LOCACAO!C2:C${lastRow},"Fidélis")`,
    ),
    cell("E15", "Itoupava Central", 9),
    cell(
      "G15",
      records.filter((item) => item.bairro === "Itoupava Central").reduce((acc, item) => acc + item.aluguel, 0) /
        records.filter((item) => item.bairro === "Itoupava Central").reduce((acc, item) => acc + item.area, 0),
      3,
      `IFERROR(SUMIF(BD_LOCACAO!C2:C${lastRow},"Itoupava Central",BD_LOCACAO!E2:E${lastRow})/SUMIF(BD_LOCACAO!C2:C${lastRow},"Itoupava Central",BD_LOCACAO!D2:D${lastRow}),0)`,
    ),
    cell("J15", "Itoupava Central", 9),
    cell(
      "L15",
      records.filter((item) => item.bairro === "Itoupava Central").length,
      5,
      `COUNTIF(BD_LOCACAO!C2:C${lastRow},"Itoupava Central")`,
    ),
    cell("A19", "Simulador de viabilidade imobiliária", 2),
    cell("A21", "Área projetada (m²)", 9),
    cell("C21", context.simulationInputs.simArea, 11),
    cell("A22", "Padrão técnico", 9),
    cell("C22", context.simulationInputs.simPadrao, 8),
    cell("A23", "Estrutura", 9),
    cell("C23", context.simulationInputs.simEstrutura, 8),
    cell("A24", "Regime CUB", 9),
    cell("C24", context.simulationInputs.simRegime, 8),
    cell("H21", "Terreno (R$/m²)", 9),
    cell("J21", context.simulationInputs.simCustoTerreno, 10),
    cell("H22", "Risco de solo (%)", 9),
    cell("J22", context.simulationInputs.simRiscoSolo / 100, 12),
    cell("H23", "Aluguel alvo (R$/m²)", 9),
    cell("J23", context.simulationInputs.simAluguelAlvo, 10),
    cell("H24", "Área de terreno estimada", 9),
    cell("J24", context.simulationResults.areaTerrenoNecessaria, 11, "C21/0.6"),
    cell("N21", "CAPEX estimado", 2),
    cell("N22", context.simulationResults.capexTotal, 3, '((C21*((IF(C24="Regular",PARAMS_CUSTOS!B3,PARAMS_CUSTOS!B2)*IF(C22="Logístico AAA",PARAMS_CUSTOS!B4,1))+IF(C23="Concreto Pré-Moldado",PARAMS_CUSTOS!B5,0))*(1+J22))+((C21/PARAMS_CUSTOS!B6)*J21*(1+PARAMS_CUSTOS!B7)))'),
    cell("N24", "NOI anual", 2),
    cell("N25", context.simulationResults.netOperatingIncome, 3, '((C21*J23)*12)*(1-PARAMS_CUSTOS!B8)'),
    cell("N27", "ROI líquido", 2),
    cell("N28", context.simulationResults.roiLiquido / 100, 12, "IFERROR(N25/N22,0)"),
    cell("N30", "Payback", 2),
    cell("N31", context.simulationResults.paybackAnos, 13, "IFERROR(N22/N25,0)"),
    cell("A34", "O dashboard no Excel usa fórmulas nativas e filtros automáticos na aba BD_LOCACAO.", 2),
  ];

  return buildSheetXml({
    cells,
    merges: [
      "A1:Q2",
      "A3:Q3",
      "A5:C5",
      "A10:C10",
      "E5:H5",
      "E6:H7",
      "J5:M5",
      "J6:M7",
      "E9:H9",
      "E10:H11",
      "J9:M9",
      "J10:M11",
      "E13:H13",
      "J13:M13",
      "A19:Q19",
      "N21:Q21",
      "N22:Q23",
      "N24:Q24",
      "N25:Q26",
      "N27:Q27",
      "N28:Q29",
      "N30:Q30",
      "N31:Q32",
      "A34:Q34",
    ],
    widths: [18, 16, 16, 14, 14, 13, 13, 13, 4, 14, 13, 13, 13, 14, 14, 14, 14],
    dimension: "A1:Q34",
    showGridLines: false,
  });
}

function buildDatabaseSheet(database: WarehouseRecord[]) {
  const cells: Cell[] = [
    cell("A1", "ID", 7),
    cell("B1", "Endereco", 7),
    cell("C1", "Bairro", 7),
    cell("D1", "Area_Util", 7),
    cell("E1", "Aluguel_Mensal", 7),
    cell("F1", "Preco_m2", 7),
    cell("G1", "Classificacao_Porte", 7),
    cell("H1", "Padrao_Tecnico", 7),
  ];

  database.forEach((item, index) => {
    const row = index + 2;
    cells.push(cell(`A${row}`, item.id, 11));
    cells.push(cell(`B${row}`, item.endereco, 8));
    cells.push(cell(`C${row}`, item.bairro, 8));
    cells.push(cell(`D${row}`, item.area, 11));
    cells.push(cell(`E${row}`, item.aluguel, 10));
    cells.push(cell(`F${row}`, computeWarehouse(item).precoM2, 10, `IFERROR(E${row}/D${row},0)`));
    cells.push(
      cell(
        `G${row}`,
        computeWarehouse(item).porte,
        8,
        `IF(D${row}<=350,"Pequeno (<350m²)",IF(D${row}<=1000,"Médio (350-1000m²)","Grande (>1000m²)"))`,
      ),
    );
    cells.push(cell(`H${row}`, item.padrao, 8));
  });

  const lastRow = database.length + 1;

  return buildSheetXml({
    cells,
    widths: [8, 38, 20, 14, 18, 14, 24, 24],
    dimension: `A1:H${lastRow}`,
    autoFilter: `A1:H${lastRow}`,
    freeze: { y: 1, topLeftCell: "A2" },
  });
}

function buildParamsSheet() {
  const rows: Array<[string, number | string]> = [
    ["Parametro", "Valor"],
    ["CUB_GI_Desonerado_Mar_2026", CUB_REFERENCES.desoneradoMarco2026],
    ["CUB_GI_Regular_Mar_2026", CUB_REFERENCES.regularMarco2026],
    ["Multiplicador_Logistico_AAA", CUB_REFERENCES.multiplicadorLogisticoAAA],
    ["Adicional_Concreto_Premoldado", CUB_REFERENCES.adicionalConcretoPremoldado],
    ["Taxa_Ocupacao_Solo", CUB_REFERENCES.taxaOcupacaoSolo],
    ["Custos_Legais_Terreno", CUB_REFERENCES.custosLegaisTerreno],
    ["Friccao_Operacional_NOI", CUB_REFERENCES.friccaoOperacional],
    ["CUB_GI_Jan_2026_Sem_Encargos", CUB_REFERENCES.janeiro2026SemEncargos],
    ["Terreno_Referencia_m2", 500],
    ["Distancia_BR470_km", 30],
    ["Distancia_BR101_km", 41],
    ["Distancia_Porto_Itajai_km", 51],
    ["Distancia_Aeroporto_Navegantes_km", 52],
    ["Observacao", "Premissas compiladas a partir do estudo de viabilidade imobiliária enviado pelo usuário."],
  ];

  const cells: Cell[] = [];
  rows.forEach(([label, value], index) => {
    const row = index + 1;
    cells.push(cell(`A${row}`, label, row === 1 ? 7 : 8));
    cells.push(cell(`B${row}`, value, row === 1 ? 7 : typeof value === "number" ? 10 : 8));
  });

  return buildSheetXml({
    cells,
    widths: [38, 26],
    dimension: "A1:B15",
    freeze: { y: 1, topLeftCell: "A2" },
  });
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getSeconds() >> 1) | (date.getMinutes() << 5) | (date.getHours() << 11);
  const dosDate = date.getDate() | ((date.getMonth() + 1) << 5) | ((year - 1980) << 9);
  return { dosDate, dosTime };
}

function buildZip(files: ZipFile[]) {
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let localOffset = 0;
  const { dosDate, dosTime } = getDosDateTime();

  files.forEach((file) => {
    const fileName = utf8(file.name);
    const crc = crc32(file.data);
    const localHeader = new Uint8Array(30 + fileName.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, dosTime);
    writeUint16(localView, 12, dosDate);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, file.data.length);
    writeUint32(localView, 22, file.data.length);
    writeUint16(localView, 26, fileName.length);
    writeUint16(localView, 28, 0);
    localHeader.set(fileName, 30);
    localChunks.push(localHeader, file.data);

    const centralHeader = new Uint8Array(46 + fileName.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, dosTime);
    writeUint16(centralView, 14, dosDate);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, file.data.length);
    writeUint32(centralView, 24, file.data.length);
    writeUint16(centralView, 28, fileName.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, localOffset);
    centralHeader.set(fileName, 46);
    centralChunks.push(centralHeader);

    localOffset += localHeader.length + file.data.length;
  });

  const centralDirectory = concatBytes(centralChunks);
  const localData = concatBytes(localChunks);
  const endHeader = new Uint8Array(22);
  const endView = new DataView(endHeader.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralDirectory.length);
  writeUint32(endView, 16, localData.length);
  writeUint16(endView, 20, 0);

  return new Blob([localData, centralDirectory, endHeader], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadWorkbook(context: WorkbookContext) {
  const workbookFiles: ZipFile[] = [
    { name: "[Content_Types].xml", data: utf8(buildContentTypesXml()) },
    { name: "_rels/.rels", data: utf8(buildRootRelsXml()) },
    { name: "xl/workbook.xml", data: utf8(buildWorkbookXml()) },
    { name: "xl/_rels/workbook.xml.rels", data: utf8(buildWorkbookRelsXml()) },
    { name: "xl/styles.xml", data: utf8(buildStylesXml()) },
    { name: "xl/worksheets/sheet1.xml", data: utf8(buildDashboardSheet(context)) },
    { name: "xl/worksheets/sheet2.xml", data: utf8(buildDatabaseSheet(context.database)) },
    { name: "xl/worksheets/sheet3.xml", data: utf8(buildParamsSheet()) },
  ];

  const blob = buildZip(workbookFiles);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Blumenau_Galpoes_Analise_CUB2026.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildExportSummary(context: WorkbookContext) {
  const computed = context.database.map(computeWarehouse);
  const kpis = calculateKpis(computed);

  return {
    registros: computed.length,
    areaTotal: formatNumber(kpis.totalArea),
    aluguelMedio: formatCurrency(kpis.precoMedioPonderado),
  };
}
