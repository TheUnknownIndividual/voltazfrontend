export type SolarSystemType = 'on-grid' | 'off-grid' | 'hybrid';

export interface InitialAssessmentDocxData {
  date: Date;
  documentNumber?: string;
  address: string;
  mountDescription: string;
  mountType: 'roof' | 'ground';
  systemType: SolarSystemType;
  systemKw: number;
  panelCount: number;
  panelWattage: number;
  yearlyProductionKWh: number;
  monthlyProductionKWh: number;
  annualSavingsAzn: number;
  customerType: 'residential' | 'nonResidential';
  panelModel: string;
  panelSpec: string;
  inverterModel: string;
  inverterSpec: string;
  inverterCount: number;
  basePriceAzn: number;
  vatAzn: number;
  totalPriceAzn: number;
  installationDays: number;
  customBoqItems?: InitialAssessmentBoqItem[];
}

export interface InitialAssessmentBoqItem {
  name: string;
  spec: string;
  unit: string;
  quantity: number;
  priceAzn: number;
}

interface ZipEntry {
  name: string;
  method: number;
  compressedData: Uint8Array;
  uncompressedSize: number;
  modTime: number;
  modDate: number;
}

const TEMPLATE_URL = '/templates/solarix-ilkin-qiymetlendirme.docx';
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const azMonths = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr'
];

const systemTypeCopy: Record<SolarSystemType, { short: string; system: string; requirement: string }> = {
  'on-grid': {
    short: 'On-Grid',
    system: 'Şəbəkəyə qoşulu (On-Grid) PV system',
    requirement: 'şəbəkəyə bağlı (On-Grid)'
  },
  'off-grid': {
    short: 'Off-Grid',
    system: 'Avtonom (Off-Grid) PV system',
    requirement: 'avtonom (Off-Grid)'
  },
  hybrid: {
    short: 'Hybrid',
    system: 'Hibrid (Hybrid) PV system',
    requirement: 'hibrid (Hybrid)'
  }
};

const readUInt16 = (data: Uint8Array, offset: number) => data[offset] | (data[offset + 1] << 8);

const readUInt32 = (data: Uint8Array, offset: number) =>
  (data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)) >>> 0;

const writeUInt16 = (view: DataView, offset: number, value: number) => view.setUint16(offset, value, true);

const writeUInt32 = (view: DataView, offset: number, value: number) => view.setUint32(offset, value >>> 0, true);

const concatBytes = (chunks: Uint8Array[]) => {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;

  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });

  return output;
};

const toArrayBuffer = (data: Uint8Array) =>
  data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;

const findEndOfCentralDirectory = (data: Uint8Array) => {
  const minOffset = Math.max(0, data.length - 0xffff - 22);

  for (let offset = data.length - 22; offset >= minOffset; offset -= 1) {
    if (readUInt32(data, offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error('DOCX arxivinin mərkəzi kataloqu tapılmadı.');
};

const parseZip = (data: Uint8Array): ZipEntry[] => {
  const eocdOffset = findEndOfCentralDirectory(data);
  const entryCount = readUInt16(data, eocdOffset + 10);
  let centralOffset = readUInt32(data, eocdOffset + 16);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (readUInt32(data, centralOffset) !== 0x02014b50) {
      throw new Error('DOCX arxivinin kataloq yazısı oxunmadı.');
    }

    const method = readUInt16(data, centralOffset + 10);
    const modTime = readUInt16(data, centralOffset + 12);
    const modDate = readUInt16(data, centralOffset + 14);
    const compressedSize = readUInt32(data, centralOffset + 20);
    const uncompressedSize = readUInt32(data, centralOffset + 24);
    const nameLength = readUInt16(data, centralOffset + 28);
    const extraLength = readUInt16(data, centralOffset + 30);
    const commentLength = readUInt16(data, centralOffset + 32);
    const localHeaderOffset = readUInt32(data, centralOffset + 42);
    const name = textDecoder.decode(data.slice(centralOffset + 46, centralOffset + 46 + nameLength));

    if (readUInt32(data, localHeaderOffset) !== 0x04034b50) {
      throw new Error(`${name} üçün lokal DOCX yazısı oxunmadı.`);
    }

    const localNameLength = readUInt16(data, localHeaderOffset + 26);
    const localExtraLength = readUInt16(data, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;

    entries.push({
      name,
      method,
      compressedData: data.slice(dataStart, dataStart + compressedSize),
      uncompressedSize,
      modTime,
      modDate
    });

    centralOffset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
};

const decompressEntry = async (entry: ZipEntry) => {
  if (entry.method === 0) {
    return entry.compressedData;
  }

  if (entry.method !== 8) {
    throw new Error(`${entry.name} üçün dəstəklənməyən sıxılma formatı.`);
  }

  const DecompressionStreamCtor = (globalThis as typeof globalThis & {
    DecompressionStream?: new (format: string) => TransformStream<Uint8Array, Uint8Array>;
  }).DecompressionStream;

  if (!DecompressionStreamCtor) {
    throw new Error('Brauzer DOCX şablonunu açmaq üçün DecompressionStream dəstəkləmir.');
  }

  const stream = new Blob([toArrayBuffer(entry.compressedData)]).stream().pipeThrough(new DecompressionStreamCtor('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
};

const crcTable = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
})();

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;

  for (let index = 0; index < data.length; index += 1) {
    crc = crcTable[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const buildZip = (entries: Array<Omit<ZipEntry, 'method' | 'compressedData' | 'uncompressedSize'> & { data: Uint8Array }>) => {
  const fileChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const nameBytes = textEncoder.encode(entry.name);
    const checksum = crc32(entry.data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);

    writeUInt32(localView, 0, 0x04034b50);
    writeUInt16(localView, 4, 20);
    writeUInt16(localView, 6, 0x0800);
    writeUInt16(localView, 8, 0);
    writeUInt16(localView, 10, entry.modTime);
    writeUInt16(localView, 12, entry.modDate);
    writeUInt32(localView, 14, checksum);
    writeUInt32(localView, 18, entry.data.length);
    writeUInt32(localView, 22, entry.data.length);
    writeUInt16(localView, 26, nameBytes.length);
    writeUInt16(localView, 28, 0);
    localHeader.set(nameBytes, 30);

    fileChunks.push(localHeader, entry.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);

    writeUInt32(centralView, 0, 0x02014b50);
    writeUInt16(centralView, 4, 20);
    writeUInt16(centralView, 6, 20);
    writeUInt16(centralView, 8, 0x0800);
    writeUInt16(centralView, 10, 0);
    writeUInt16(centralView, 12, entry.modTime);
    writeUInt16(centralView, 14, entry.modDate);
    writeUInt32(centralView, 16, checksum);
    writeUInt32(centralView, 20, entry.data.length);
    writeUInt32(centralView, 24, entry.data.length);
    writeUInt16(centralView, 28, nameBytes.length);
    writeUInt16(centralView, 30, 0);
    writeUInt16(centralView, 32, 0);
    writeUInt16(centralView, 34, 0);
    writeUInt16(centralView, 36, 0);
    writeUInt32(centralView, 38, 0);
    writeUInt32(centralView, 42, offset);
    centralHeader.set(nameBytes, 46);

    centralChunks.push(centralHeader);
    offset += localHeader.length + entry.data.length;
  });

  const centralDirectory = concatBytes(centralChunks);
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  writeUInt32(eocdView, 0, 0x06054b50);
  writeUInt16(eocdView, 8, entries.length);
  writeUInt16(eocdView, 10, entries.length);
  writeUInt32(eocdView, 12, centralDirectory.length);
  writeUInt32(eocdView, 16, offset);
  writeUInt16(eocdView, 20, 0);

  return concatBytes([...fileChunks, centralDirectory, eocd]);
};

const formatInteger = (value: number) => Math.round(value).toLocaleString('az-AZ').replace(/\./g, ' ');

const formatDecimal = (value: number, maximumFractionDigits = 1) => {
  const rounded = Number(value.toFixed(maximumFractionDigits));

  return rounded.toLocaleString('en-US', {
    useGrouping: false,
    maximumFractionDigits,
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1
  });
};

const formatMoney = (value: number) => `${formatInteger(value)} AZN`;

const formatKWh = (value: number) => formatInteger(value);

const formatPlainInteger = (value: number) => formatInteger(value);

const formatKw = (value: number) => formatDecimal(value, 1);

const formatPlainMoney = (value: number) => `${formatInteger(value)} AZN`;

const formatTotalSavingsMoney = (value: number) => `${formatInteger(value)}  AZN`;

const formatDateLine = (date: Date, documentNumber?: string) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const fullYear = date.getFullYear();
  const fallbackDocumentNumber = `T-${String(month).padStart(2, '0')}/${String(fullYear).slice(-2)}-${String(day).padStart(2, '0')}`;

  return `№  ${documentNumber || fallbackDocumentNumber}               “${day}” ${azMonths[month - 1]} ${fullYear}-cı il`;
};

const getDateParts = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const fullYear = date.getFullYear();
  const shortMonth = String(month).padStart(2, '0');
  const shortYear = String(fullYear).slice(-2);
  const shortDay = String(day).padStart(2, '0');

  return {
    day: String(day),
    shortDay,
    shortMonth,
    shortYear,
    monthName: azMonths[month - 1],
    year: String(fullYear)
  };
};

const getParagraphText = (paragraph: Element) =>
  Array.from(paragraph.getElementsByTagNameNS(W_NS, 't'))
    .map((node) => node.textContent || '')
    .join('');

const setParagraphText = (paragraph: Element, text: string) => {
  const textNodes = Array.from(paragraph.getElementsByTagNameNS(W_NS, 't'));
  const [firstNode, ...remainingNodes] = textNodes;

  if (!firstNode) {
    return;
  }

  firstNode.textContent = text;

  if (/^\s|\s$|\s{2,}/.test(text)) {
    firstNode.setAttributeNS(XML_NS, 'xml:space', 'preserve');
  } else {
    firstNode.removeAttributeNS(XML_NS, 'space');
  }

  remainingNodes.forEach((node) => {
    node.textContent = '';
    node.removeAttributeNS(XML_NS, 'space');
  });
};

const getRunText = (run: Element) =>
  Array.from(run.getElementsByTagNameNS(W_NS, 't'))
    .map((node) => node.textContent || '')
    .join('');

const isBoldRun = (run: Element) => run.getElementsByTagNameNS(W_NS, 'b').length > 0;

const setRunPropertiesBold = (dom: Document, runProperties: Element, bold: boolean) => {
  Array.from(runProperties.childNodes).forEach((node) => {
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : undefined;

    if (element?.namespaceURI === W_NS && (element.localName === 'b' || element.localName === 'bCs')) {
      runProperties.removeChild(node);
    }
  });

  if (bold) {
    runProperties.appendChild(dom.createElementNS(W_NS, 'w:b'));
    runProperties.appendChild(dom.createElementNS(W_NS, 'w:bCs'));
  }
};

const createTextRun = (dom: Document, templateRun: Element | undefined, text: string, bold = false) => {
  const run = dom.createElementNS(W_NS, 'w:r');
  const runProperties = templateRun?.getElementsByTagNameNS(W_NS, 'rPr')[0];

  if (runProperties) {
    const clonedRunProperties = runProperties.cloneNode(true) as Element;
    setRunPropertiesBold(dom, clonedRunProperties, bold);
    run.appendChild(clonedRunProperties);
  }

  const textNode = dom.createElementNS(W_NS, 'w:t');
  textNode.textContent = text;

  if (/^\s|\s$|\s{2,}/.test(text)) {
    textNode.setAttributeNS(XML_NS, 'xml:space', 'preserve');
  }

  run.appendChild(textNode);
  return run;
};

const setParagraphSegments = (paragraph: Element, segments: Array<{ text: string; bold?: boolean }>) => {
  const dom = paragraph.ownerDocument;
  const runs = Array.from(paragraph.getElementsByTagNameNS(W_NS, 'r'));
  const normalRun = runs.find((run) => !isBoldRun(run)) || runs[0];
  const boldRun = runs.find((run) => isBoldRun(run)) || normalRun;

  Array.from(paragraph.childNodes).forEach((node) => {
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : undefined;

    if (element?.namespaceURI === W_NS && element.localName === 'r') {
      paragraph.removeChild(node);
    }
  });

  segments.forEach((segment) => {
    if (segment.text.length > 0) {
      paragraph.appendChild(createTextRun(dom, segment.bold ? boldRun : normalRun, segment.text, Boolean(segment.bold)));
    }
  });
};

const updateDateParagraph = (paragraphs: Element[], date: Date, documentNumber?: string) => {
  const paragraph = paragraphs.find((item) => getParagraphText(item).startsWith('№  T-'));

  if (!paragraph) {
    return;
  }

  if (documentNumber) {
    setParagraphText(paragraph, formatDateLine(date, documentNumber));
    return;
  }

  const parts = getDateParts(date);
  const textNodes = Array.from(paragraph.getElementsByTagNameNS(W_NS, 't'));
  const currentRuns = Array.from(paragraph.getElementsByTagNameNS(W_NS, 'r')).filter((run) => getRunText(run).length > 0);

  if (textNodes.length >= 20 && currentRuns.length >= 20) {
    textNodes[3].textContent = parts.shortMonth[0];
    textNodes[4].textContent = parts.shortMonth[1];
    textNodes[5].textContent = `/${parts.shortYear[0]}`;
    textNodes[6].textContent = parts.shortYear[1];
    textNodes[8].textContent = parts.shortDay;
    textNodes[12].textContent = parts.day;
    textNodes[14].textContent = parts.monthName;
    textNodes[15].textContent = ` ${parts.year.slice(0, 3)}`;
    textNodes[16].textContent = parts.year[3];
    return;
  }

  setParagraphText(paragraph, formatDateLine(date));
};

const updateFirstParagraph = (paragraphs: Element[], predicate: (text: string) => boolean, text: string) => {
  const paragraph = paragraphs.find((item) => predicate(getParagraphText(item)));

  if (paragraph) {
    setParagraphText(paragraph, text);
  }
};

const removeEmptyParagraphBefore = (paragraphs: Element[], predicate: (text: string) => boolean) => {
  const index = paragraphs.findIndex((item) => predicate(getParagraphText(item)));
  const previous = index > 0 ? paragraphs[index - 1] : undefined;

  if (previous && getParagraphText(previous).trim().length === 0) {
    previous.parentNode?.removeChild(previous);
  }
};

const updateFirstParagraphSegments = (
  paragraphs: Element[],
  predicate: (text: string) => boolean,
  segments: Array<{ text: string; bold?: boolean }>
) => {
  const paragraph = paragraphs.find((item) => predicate(getParagraphText(item)));

  if (paragraph) {
    setParagraphSegments(paragraph, segments);
  }
};

const updateParagraphAfter = (paragraphs: Element[], label: string, text: string) => {
  const index = paragraphs.findIndex((paragraph) => getParagraphText(paragraph).trim() === label);
  const target =
    index >= 0
      ? paragraphs.slice(index + 1).find((paragraph) => getParagraphText(paragraph).trim().length > 0)
      : undefined;

  if (target) {
    setParagraphText(target, text);
  }
};

const updateTableRowByAnchor = (paragraphs: Element[], anchor: string, updates: Array<{ offset: number; text: string }>) => {
  const index = paragraphs.findIndex((paragraph) => getParagraphText(paragraph).startsWith(anchor));

  if (index < 0) {
    return;
  }

  updates.forEach((update) => {
    const target = paragraphs[index + update.offset];

    if (target) {
      setParagraphText(target, update.text);
    }
  });
};

const setTableCellText = (cell: Element, text: string) => {
  const paragraph = cell.getElementsByTagNameNS(W_NS, 'p')[0];

  if (paragraph) {
    setParagraphText(paragraph, text);
  }
};

const insertCustomBoqRows = (dom: Document, items: InitialAssessmentBoqItem[] | undefined) => {
  const validItems = (items || []).filter((item) => item.name.trim().length > 0);

  if (validItems.length === 0) {
    return;
  }

  const rows = Array.from(dom.getElementsByTagNameNS(W_NS, 'tr'));
  const priceRow = rows.find((row) => getParagraphText(row).trim().startsWith('Qiymət'));
  const templateRow =
    rows.find((row) => getParagraphText(row).startsWith('Monitorinq və enerji ölçmə dəsti')) ||
    rows.find((row) => getParagraphText(row).startsWith('LONGi LR7-72HVHF-650M'));

  if (!priceRow || !templateRow || !priceRow.parentNode) {
    return;
  }

  validItems.forEach((item) => {
    const row = templateRow.cloneNode(true) as Element;
    const cells = Array.from(row.getElementsByTagNameNS(W_NS, 'tc'));
    const quantity = Math.max(1, Math.round(item.quantity || 1));
    const priceNote = item.priceAzn > 0 ? ` Qiymət: ${formatMoney(item.priceAzn)}.` : '';

    setTableCellText(cells[0], item.name.trim());
    setTableCellText(cells[1], `${item.spec.trim()}${priceNote}`.trim());
    setTableCellText(cells[2], item.unit.trim() || 'ədəd');
    setTableCellText(cells[3], String(quantity));
    priceRow.parentNode.insertBefore(row, priceRow);
  });
};

const patchDocumentXml = (xml: string, data: InitialAssessmentDocxData) => {
  const dom = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = dom.getElementsByTagName('parsererror')[0];

  if (parserError) {
    throw new Error('DOCX XML məzmunu oxunmadı.');
  }

  const paragraphs = Array.from(dom.getElementsByTagNameNS(W_NS, 'p'));
  const system = systemTypeCopy[data.systemType];
  const monthlySavings = data.annualSavingsAzn / 12;
  const totalSavings = data.annualSavingsAzn * 25;
  const paybackYears = data.annualSavingsAzn > 0 ? data.totalPriceAzn / data.annualSavingsAzn : 0;
  const systemKw = formatKw(data.systemKw);
  const panelWattage = formatInteger(data.panelWattage);
  const tariffAudience = data.customerType === 'residential' ? 'əhali' : 'qeyri-əhali';
  const tariffBasis = data.customerType === 'residential' ? 'mövcud pilləli tariflərə' : 'mövcud tariflərə';

  updateDateParagraph(paragraphs, data.date, data.documentNumber);
  updateFirstParagraph(
    paragraphs,
    (text) => text.startsWith('Biz nə vəd edirik'),
    'Biz nə vəd edirik?'
  );
  updateFirstParagraph(
    paragraphs,
    (text) => text.startsWith('Malların (işlərin və xidmətlərin) qiymət cədvəli'),
    ' Malların (işlərin və xidmətlərin) qiymət cədvəli'
  );
  removeEmptyParagraphBefore(paragraphs, (text) => text.trim().startsWith('Qeyd'));
  updateFirstParagraph(
    paragraphs,
    (text) => text.startsWith('Layihənin adı:'),
    `Layihənin adı: Günəş Elektrik Stansiyasının (${system.short}) Quraşdırılması / Ünvan: ${data.address}. ${data.mountDescription}. Sistemin növü: ${system.system}/ Ümumi güc : ${systemKw} kW`
  );
  updateFirstParagraphSegments(
    paragraphs,
    (text) => text.startsWith('Günəş panellərinin '),
    [
      { text: `Günəş panellərinin ${system.requirement} mexanizm ilə quraşdırılması: `, bold: true },
      { text: 'Dam örtüyü və ya yerdə yüksək səmərəli günəş panellərinin və ev və ya sənaye tipli invertorların montajı, daxili elektrik şəbəkəsinə inteqrasiyası.' }
    ]
  );
  updateFirstParagraphSegments(
    paragraphs,
    (text) => text.startsWith('Azərbaycanın günəş radiasiyası'),
    [
      { text: 'Azərbaycanın günəş radiasiyası göstəricilərinə əsasən, quraşdırmış olacağımız ' },
      { text: String(data.panelCount), bold: true },
      { text: ' ədəd ' },
      { text: `${panelWattage} W`, bold: true },
      { text: ' gücündə, ümumi gücü ' },
      { text: `${systemKw} kWp`, bold: true },
      { text: '  olan ' },
      { text: system.short, bold: true },
      { text: ' günəş elektrik stansiyası illik ' },
      {
        text: `≈ ${formatKWh(data.yearlyProductionKWh)} kWh (aylıq ≈ ${formatPlainInteger(data.monthlyProductionKWh)} kWh)`,
        bold: true
      },
      { text: ' elektrik enerjisi istehsal etməsi gözlənilir. Layihənin ümumi dəyərini nəzərə alsaq, sistem investisiyasının təxmini geri dönüş müddəti: ' },
      { text: `${formatDecimal(paybackYears, 1)} il`, bold: true },
      { text: ` təşkil edir. Bu isə ${tariffAudience} üçün tətbiq olunan ${tariffBasis} əsasən ildə təxminən ` },
      { text: `${formatPlainMoney(data.annualSavingsAzn)} (aylıq ≈ ${formatPlainInteger(monthlySavings)})`, bold: true },
      { text: ' həcmində elektrik xərclərinə qənaət deməkdir.' }
    ]
  );
  updateFirstParagraphSegments(
    paragraphs,
    (text) => text.startsWith('Müasir günəş panellərinin orta istismar'),
    [
      { text: 'Müasir günəş panellərinin orta istismar müddəti ' },
      { text: '25 il', bold: true },
      { text: ' və daha çox təşkil edir. Bu müddət ərzində günəş elektrik stansiyası obyekt üçün stabil şəkildə enerji istehsal etməyə davam edir. Orta hesabla ildə ' },
      { text: formatPlainMoney(data.annualSavingsAzn), bold: true },
      { text: ' qənaət nəzərə alındıqda, ' },
      { text: '25 illik', bold: true },
      { text: ' istismar müddətində ümumi iqtisadi qənaət: ' },
      { text: formatTotalSavingsMoney(totalSavings), bold: true },
      { text: ' təşkil edə bilər. Bu isə layihənin ilkin investisiyadan dəfələrlə artıq iqtisadi fayda verdiyini göstərir və onu uzunmüddətli və yüksək səmərəli investisiya kimi qiymətləndirməyə imkan yaradır. ' }
    ]
  );
  insertCustomBoqRows(dom, data.customBoqItems);
  if (data.mountType === 'ground') {
    updateTableRowByAnchor(paragraphs, 'Damüstü montaj', [
      { offset: 0, text: 'Torpaq montaj konstruksiyası — tam dəst' },
      {
        offset: 1,
        text: 'Daşıyıcı relslər/profillər, dayaq elementləri, betonlama, orta və kənar sıxaclar, birləşdiricilər, bərkidicilər, EPDM və suizolyasiya materialları'
      }
    ]);
  }
  updateTableRowByAnchor(paragraphs, 'LONGi LR7-72HVHF-650M', [
    { offset: 0, text: data.panelModel },
    { offset: 1, text: data.panelSpec },
    { offset: 3, text: String(data.panelCount) }
  ]);
  updateTableRowByAnchor(paragraphs, 'Growatt MID 15KTL3-X', [
    { offset: 0, text: data.inverterModel },
    { offset: 1, text: data.inverterSpec },
    { offset: 3, text: String(data.inverterCount) }
  ]);
  updateFirstParagraph(
    paragraphs,
    (text) => text.startsWith('Konstruksiya, '),
    `Konstruksiya, ${data.panelCount} modul, DC/AC kabelləşmə, inverter və şit montajı, torpaqlama, kabel idarəetməsi və suizolyasiya`
  );
  updateParagraphAfter(paragraphs, 'Qiymət', formatMoney(data.basePriceAzn));
  updateParagraphAfter(paragraphs, 'ƏDV 18%', formatMoney(data.vatAzn));
  updateParagraphAfter(paragraphs, 'Yekun', formatMoney(data.totalPriceAzn));
  updateFirstParagraph(
    paragraphs,
    (text) => text.startsWith('Ödəniş olunduğu gündən'),
    `Ödəniş olunduğu gündən etibarən 30 gün ərzində çatdırılma (Bakı anbarından 3 gün ərzində) , quraşdırma müddəti ${data.installationDays} gün ərzində olacaqdır`
  );
  updateFirstParagraph(
    paragraphs,
    (text) => text.startsWith('Quraşdırılan günəş panelləri'),
    `Quraşdırılan günəş panelləri və invertorlar ümumi ${systemKw} kVt gərginlik üçün nəzərdə tutulmuşdur və gələcəkdə dəyişdirilməsi (və ya artırılması) mümkündür`
  );

  return new XMLSerializer().serializeToString(dom);
};

export const buildInitialAssessmentDocx = async (data: InitialAssessmentDocxData) => {
  const response = await fetch(TEMPLATE_URL);

  if (!response.ok) {
    throw new Error('İlkin qiymətləndirmə şablonu yüklənmədi.');
  }

  const entries = parseZip(new Uint8Array(await response.arrayBuffer()));
  const outputEntries = await Promise.all(
    entries.map(async (entry) => {
      const originalData = await decompressEntry(entry);
      const patchedData =
        entry.name === 'word/document.xml'
          ? textEncoder.encode(patchDocumentXml(textDecoder.decode(originalData), data))
          : originalData;

      return {
        name: entry.name,
        modTime: entry.modTime,
        modDate: entry.modDate,
        data: patchedData
      };
    })
  );

  return new Blob([toArrayBuffer(buildZip(outputEntries))], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
};
