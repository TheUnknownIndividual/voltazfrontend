import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';

export type SolarInverterSystemType = 'on-grid' | 'off-grid' | 'hybrid';
export type SolarInverterPhase = 'single' | 'three';

export interface SolarInverterOption {
  productId: number;
  specificationId: number | null;
  technicalPower: string;
  modelLabel: string;
  productName: string;
  systemType: SolarInverterSystemType;
  phase: SolarInverterPhase;
  nominalAcKw: number;
  maxDcKw: number;
  mpptCount?: number | null;
  inputCount?: number | null;
  mpptRange?: string | null;
  maxDcVoltage?: number | null;
  maxInputCurrent?: string | null;
  manufacturer?: string | null;
  regionalGridVersion?: string | null;
  datasheetRevision?: string | null;
  datasheetUrl?: string | null;
  datasheetReviewedAt?: string | null;
  maxAcApparentPowerKva?: number | null;
  maxAcOutputCurrentA?: number | null;
  nominalAcVoltageV?: number | null;
  supportedGridVoltageRange?: string | null;
  supportedFrequencyRange?: string | null;
  startVoltageV?: number | null;
  mpptMinVoltageV?: number | null;
  mpptMaxVoltageV?: number | null;
  nominalDcVoltageV?: number | null;
  stringInputsPerMppt?: number | null;
  maxOperatingCurrentPerStringA?: number | null;
  maxOperatingCurrentPerMpptA?: number | null;
  maxShortCircuitCurrentPerStringA?: number | null;
  maxShortCircuitCurrentPerMpptA?: number | null;
  hasIntegratedDcSwitch?: boolean | null;
  acSpdClass?: string | null;
  dcSpdClass?: string | null;
  hasAfci?: boolean | null;
  requiredGridCertifications?: string | null;
  hasCompleteEngineeringData: boolean;
  warrantyYears: number;
  inStock: boolean;
  availableCount: number;
}

const cache = new Map<string, SolarInverterOption[]>();

export const getSolarInverters = async (
  systemType: SolarInverterSystemType,
  phase: SolarInverterPhase
) => {
  const key = `${systemType}:${phase}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const response = await axiosInstance.get(API_ENDPOINTS.SOLAR_INVERTERS.GET_ALL(systemType, phase));
  const data = response.data?.data;
  const options = Array.isArray(data) ? (data as SolarInverterOption[]) : [];
  // Do not retain an empty response. A catalog can be temporarily empty while
  // a backend seed/migration is being applied, and caching that response would
  // keep an already-open calculator stale until the entire page is reloaded.
  if (options.length > 0) {
    cache.set(key, options);
  }
  return options;
};
