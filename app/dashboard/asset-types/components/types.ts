// types.ts

// ============================================
// Tipos para Asset Types (Tipos de Activo)
// ============================================

export interface AssetType {
  id: number;
  name: string;
  description?: string | null;
  purchaseAccount?: string | null;
  depreciationAccount?: string | null;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetTypeFormState {
  name: string;
  description: string;
  purchaseAccount: string;
  depreciationAccount: string;
  status: boolean;
}

export type AssetTypeStatusFilter = "all" | "active" | "inactive";

export type SortDirection = "asc" | "desc";

export type SortableAssetTypeKey = 
  | "name"
  | "description"
  | "purchaseAccount"
  | "depreciationAccount"
  | "status";

export interface AssetTypeStats {
  total: number;
  active: number;
  inactive: number;
}

export type SetAssetTypeFormField = <K extends keyof AssetTypeFormState>(
  field: K,
  value: AssetTypeFormState[K]
) => void;

// Props para componentes de Asset Types
export interface AssetTypesAlertProps {
  show: boolean;
}

export interface AssetTypesHeaderProps {
  isRefreshing: boolean;
  canCreate: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export interface AssetTypesStatsProps {
  stats: AssetTypeStats;
}

export interface AssetTypesManagementCardProps {
  statusFilter: AssetTypeStatusFilter;
  onStatusFilterChange: (value: AssetTypeStatusFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedRows: Set<number>;
  isSaving: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  paginatedAssetTypes: AssetType[];
  isLoading: boolean;
  onCreate: () => void;
  onSort: (key: SortableAssetTypeKey) => void;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: number) => void;
  onEdit: (assetType: AssetType) => void;
  onView: (assetType: AssetType) => void;
  onDelete: (assetType: AssetType) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalAssetTypes: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
}

export interface AssetTypeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingType: AssetType | null;
  form: AssetTypeFormState;
  isSaving: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFormFieldChange: SetAssetTypeFormField;
  onCancel: () => void;
}

export interface AssetTypeDetailDialogProps {
  assetType: AssetType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
