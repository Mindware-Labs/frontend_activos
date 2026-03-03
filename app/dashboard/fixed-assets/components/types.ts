export type Department = {
  id: number;
  name: string;
  status: boolean;
  description?: string;
};

export type AssetType = {
  id: number;
  name: string;
  status: boolean;
  description?: string;
};

export type FixedAsset = {
  id: number;
  name: string;
  description: string;
  registrationDate: string;
  purchaseValue: number;
  residualValue: number;
  usefulLifeMonths: number | null;
  accumulatedDepreciation: number;
  status: boolean;
  departmentId: number;
  department?: Department;
  assetTypeId: number;
  assetType?: AssetType;
};

export type FixedAssetFormState = {
  name: string;
  description: string;
  registrationDate: string;
  purchaseValue: string;
  residualValue: string;
  usefulLifeMonths: string;
  status: boolean;
  departmentId: string;
  assetTypeId: string;
};

export type FixedAssetStatusFilter = "all" | "active" | "inactive";
export type SortDirection = "asc" | "desc";
export type SortableFixedAssetKey =
  | "name"
  | "registrationDate"
  | "purchaseValue"
  | "departmentId"
  | "assetTypeId"
  | "status";

export type FixedAssetStats = {
  total: number;
  active: number;
  inactive: number;
  totalPurchaseValue: number;
  totalResidualValue: number;
  totalAccumulatedDepreciation: number;
};

export type SetFixedAssetFormField = <K extends keyof FixedAssetFormState>(
  field: K,
  value: FixedAssetFormState[K],
) => void;
