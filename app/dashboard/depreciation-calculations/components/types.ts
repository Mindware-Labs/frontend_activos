export type FixedAsset = {
  id: number;
  name: string;
  status: boolean;
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

export type DepreciationFormState = {
  processYear: string;
  processMonth: string;
  processDate: string;
  amountDepreciation: string;
  accumulatedDepreciation: string;
  purchaseAccount: string;
  depreciationAccount: string;
  fixedAssetId: string;
};

export type DepreciationStatusFilter = "all" | "active" | "inactive";
export type SortDirection = "asc" | "desc";
export type SortableDepreciationKey =
  | "processYear"
  | "processMonth"
  | "processDate"
  | "amountDepreciation"
  | "accumulatedDepreciation"
  | "fixedAssetId";

export type DepreciationStats = {
  total: number;
  totalAmount: number;
  totalAccumulated: number;
};

export type SetDepreciationFormField = <K extends keyof DepreciationFormState>(
  field: K,
  value: DepreciationFormState[K],
) => void;
