export type AssetType = {
  id: number;
  name: string;
  purchaseAccount: string;
  depreciationAccount: string;
};

export type FixedAsset = {
  id: number;
  name: string;
  description?: string;
  registrationDate: string;
  status: boolean;
  purchaseValue: number;
  residualValue: number;
  usefulLifeMonths: number | null;
  accumulatedDepreciation: number;
  departmentId?: number;
  assetTypeId?: number;
  department?: { id: number; name: string };
  assetType?: AssetType;
};

export type DepreciationCalculation = {
  id: number;
  processYear: number;
  processMonth: number;
  processDate: string;
  amountDepreciation: number;
  accumulatedDepreciation: number;
  purchaseAccount: string;
  depreciationAccount: string;
  fixedAssetId: number;
  fixedAsset?: FixedAsset;
  createdAt?: string;
  updatedAt?: string;
};

export type AssetDepreciationStatus = "deprecated" | "pending" | "ineligible";

export type AssetPreview = {
  asset: FixedAsset;
  status: AssetDepreciationStatus;
  reason?: string;
  monthlyDepreciation: number;
  existingRecord?: DepreciationCalculation;
};

export type RunResult = {
  processYear: number;
  processMonth: number;
  processDate: string;
  totalAssetsEvaluated: number;
  totalCalculationsCreated: number;
  totalAssetsSkipped: number;
  totalAmountDepreciated: number;
  skippedAssets: Array<{ fixedAssetId: number; reason: string }>;
};

export type SortDirection = "asc" | "desc";
export type SortableKey =
  | "fixedAssetId"
  | "processDate"
  | "amountDepreciation"
  | "accumulatedDepreciation";

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "RD$ 0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "RD$ 0.00";
  return num.toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  });
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateAssetDepreciation(asset: FixedAsset) {
  const purchaseValue = Number(asset.purchaseValue ?? 0);
  const residualValue = Number(asset.residualValue ?? 0);
  const usefulLifeMonths = Number(asset.usefulLifeMonths ?? 0);
  const currentAccumulated = Number(asset.accumulatedDepreciation ?? 0);

  if (purchaseValue <= 0 || residualValue < 0 || usefulLifeMonths <= 0) {
    return { monthlyDepreciation: 0, newAccumulated: currentAccumulated };
  }

  const baseDepreciable = roundCurrency(purchaseValue - residualValue);
  if (baseDepreciable <= 0) {
    return { monthlyDepreciation: 0, newAccumulated: currentAccumulated };
  }

  const remainingAmount = roundCurrency(baseDepreciable - currentAccumulated);
  if (remainingAmount <= 0) {
    return { monthlyDepreciation: 0, newAccumulated: currentAccumulated };
  }

  const monthly = roundCurrency(baseDepreciable / usefulLifeMonths);
  const amountDepreciation = roundCurrency(Math.min(monthly, remainingAmount));

  return {
    monthlyDepreciation: amountDepreciation,
    newAccumulated: roundCurrency(currentAccumulated + amountDepreciation),
  };
}

export function classifyAsset(
  asset: FixedAsset,
  existingRecords: Map<number, DepreciationCalculation>,
  processYear: number,
  processMonth: number,
): AssetPreview {
  const existingRecord = existingRecords.get(asset.id);
  if (existingRecord) {
    return {
      asset,
      status: "deprecated",
      monthlyDepreciation: Number(existingRecord.amountDepreciation),
      existingRecord,
    };
  }

  if (!asset.status) {
    return {
      asset,
      status: "ineligible",
      reason: "Activo inactivo",
      monthlyDepreciation: 0,
    };
  }

  if (!asset.assetType) {
    return {
      asset,
      status: "ineligible",
      reason: "Sin tipo de activo",
      monthlyDepreciation: 0,
    };
  }

  if (
    !asset.assetType.purchaseAccount ||
    !asset.assetType.depreciationAccount
  ) {
    return {
      asset,
      status: "ineligible",
      reason: "Faltan cuentas contables",
      monthlyDepreciation: 0,
    };
  }

  const processDate = new Date(Date.UTC(processYear, processMonth, 0));
  const regDate = new Date(asset.registrationDate);
  if (regDate > processDate) {
    return {
      asset,
      status: "ineligible",
      reason: "Fecha de registro posterior",
      monthlyDepreciation: 0,
    };
  }

  const { monthlyDepreciation } = calculateAssetDepreciation(asset);
  if (monthlyDepreciation <= 0) {
    return {
      asset,
      status: "ineligible",
      reason: "Depreciación máxima alcanzada",
      monthlyDepreciation: 0,
    };
  }

  return { asset, status: "pending", monthlyDepreciation };
}
