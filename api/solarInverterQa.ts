import axiosInstance from './axiosInstance';

export type SolarInverterQaStatus = 'not-confirmed' | 'hold' | 'confirmed';

export interface SolarInverterQaDataset {
  technicalPower: string;
  modelLabel: string;
  systemType: 'on-grid' | 'off-grid' | 'hybrid' | 'unknown';
  phase: 'single' | 'three' | 'unknown';
  nominalAcKw: number;
  maxDcKw: number;
  mpptCount: number | null;
  inputCount: number | null;
  mpptRange: string | null;
  maxDcVoltage: number | null;
  maxInputCurrent: string | null;
  manufacturer: string | null;
  regionalGridVersion: string | null;
  datasheetRevision: string | null;
  maxAcApparentPowerKva: number | null;
  maxAcOutputCurrentA: number | null;
  nominalAcVoltageV: number | null;
  supportedGridVoltageRange: string | null;
  supportedFrequencyRange: string | null;
  startVoltageV: number | null;
  mpptMinVoltageV: number | null;
  mpptMaxVoltageV: number | null;
  nominalDcVoltageV: number | null;
  stringInputsPerMppt: number | null;
  maxOperatingCurrentPerStringA: number | null;
  maxOperatingCurrentPerMpptA: number | null;
  maxShortCircuitCurrentPerStringA: number | null;
  maxShortCircuitCurrentPerMpptA: number | null;
  hasIntegratedDcSwitch: boolean | null;
  acSpdClass: string | null;
  dcSpdClass: string | null;
  hasAfci: boolean | null;
  requiredGridCertifications: string | null;
  warrantyYears: number;
  isEligible: boolean;
}

export interface SolarInverterQaListItem {
  specificationId: number;
  productId: number;
  productName: string;
  technicalPower: string;
  modelLabel: string;
  systemType: string;
  phase: string;
  qaStatus: SolarInverterQaStatus;
  sourceUrl: string | null;
  sourceUrls: string[];
  documentKind: string | null;
  requiresOcr: boolean;
  hasCorrections: boolean;
  qaReviewedAt: string | null;
  qaDoneAt: string | null;
  productionPromotedAt: string | null;
}

export interface SolarInverterQaList {
  items: SolarInverterQaListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  statusCounts: Record<string, number>;
}

export interface SolarInverterQaDetail {
  specificationId: number;
  productId: number;
  productName: string;
  qaStatus: SolarInverterQaStatus;
  qaNotes: string | null;
  qaReviewedAt: string | null;
  qaReviewedByAdminId: number | null;
  qaDoneAt: string | null;
  productionPromotedAt: string | null;
  productionPromotionMessage: string | null;
  sourceUrl: string | null;
  sourceUrls: string[];
  documentSha256: string | null;
  documentKind: string | null;
  pageCount: number | null;
  requiresOcr: boolean;
  originalExtractedText: string;
  correctedExtractedText: string | null;
  extractionMetadataJson: string | null;
  catalogProvenanceJson: string | null;
  dataset: SolarInverterQaDataset;
}

export interface SolarInverterQaDone {
  completed: boolean;
  autoPromotionEnabled: boolean;
  promotedToProduction: boolean;
  message: string;
  productionPromotedAt: string | null;
}

const unwrap = <T,>(response: any): T => {
  if (response.data?.success === false) {
    throw new Error(response.data?.error?.details || 'QA request failed.');
  }
  return response.data?.data ?? response.data;
};

export const getSolarInverterQaList = async (params: {
  status?: SolarInverterQaStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}) => unwrap<SolarInverterQaList>(
  await axiosInstance.get('SolarInverters/datasheets/qa', { params })
);

export const getSolarInverterQaDetail = async (specificationId: number) =>
  unwrap<SolarInverterQaDetail>(
    await axiosInstance.get(`SolarInverters/datasheets/qa/${specificationId}`)
  );

export const updateSolarInverterQa = async (
  specificationId: number,
  payload: {
    qaStatus: SolarInverterQaStatus;
    qaNotes: string | null;
    correctedExtractedText: string | null;
    dataset: SolarInverterQaDataset;
  }
) => unwrap<SolarInverterQaDetail>(
  await axiosInstance.put(
    `SolarInverters/datasheets/qa/${specificationId}`,
    payload
  )
);

export const completeSolarInverterQa = async (specificationId: number) =>
  unwrap<SolarInverterQaDone>(
    await axiosInstance.post(
      `SolarInverters/datasheets/qa/${specificationId}/done`
    )
  );
