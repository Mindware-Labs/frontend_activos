export type AssetType = {
  id: number;
  name: string;
  status: boolean;
};

export type Department = {
  id: number;
  name: string;
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
  assetTypeId: number;
  department?: Department;
  assetType?: AssetType;
};

export type DepreciationRecord = {
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
};

export type MonthlyTrend = {
  label: string;
  month: number;
  year: number;
  amount: number;
  accumulated: number;
  projected?: boolean;
};

export type ConsultaFilters = {
  assetIdFrom: string;
  assetIdTo: string;
  dateFrom: string;
  dateTo: string;
  assetTypeId: string;
};
