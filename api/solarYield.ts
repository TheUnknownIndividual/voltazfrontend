import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../utils/constants';

export interface SolarYieldResult {
  latitude: number;
  longitude: number;
  tilt: number;
  azimuth: number;
  optimalAngles: boolean;
  systemLossPercent: number;
  specificYieldKwhPerKwp: number;
  radiationDatabase: string;
  source: string;
}

export interface SolarYieldRequest {
  lat: number;
  lon: number;
  // Omit both for PVGIS optimal angles.
  tilt?: number;
  // Compass orientation in degrees (180 = south), as entered in the calculators.
  orientation?: number;
}

// PVGIS aspect: 0 = south, -90 = east, 90 = west.
const toPvgisAzimuth = (orientation: number) => ((((Math.round(orientation) - 180) % 360) + 540) % 360) - 180;
const normalizeTilt = (tilt: number) => Math.min(90, Math.max(0, Math.round(tilt)));

export const getSolarYieldKey = ({ lat, lon, tilt, orientation }: SolarYieldRequest) =>
  tilt === undefined
    ? `${lat.toFixed(2)}:${lon.toFixed(2)}:opt`
    : `${lat.toFixed(2)}:${lon.toFixed(2)}:${normalizeTilt(tilt)}:${toPvgisAzimuth(orientation ?? 180)}`;

// One request per location/angle per page session; failures are dropped so a later call can retry.
const yieldCache = new Map<string, Promise<number>>();

export const getSolarYield = (request: SolarYieldRequest): Promise<number> => {
  const key = getSolarYieldKey(request);
  const cached = yieldCache.get(key);
  if (cached) return cached;

  const params: Record<string, number> = { lat: request.lat, lon: request.lon };
  if (request.tilt !== undefined) {
    params.tilt = normalizeTilt(request.tilt);
    params.azimuth = toPvgisAzimuth(request.orientation ?? 180);
  }

  const promise = axiosInstance
    .get(API_ENDPOINTS.SOLAR_YIELD, { params, timeout: 15000 })
    .then((response) => {
      const value = response.data?.success ? Number(response.data.data?.specificYieldKwhPerKwp) : NaN;
      if (!Number.isFinite(value) || value <= 0) throw new Error('SOLAR_YIELD_UNAVAILABLE');
      return Math.round(value);
    })
    .catch((error) => {
      yieldCache.delete(key);
      throw error;
    });

  yieldCache.set(key, promise);
  return promise;
};
