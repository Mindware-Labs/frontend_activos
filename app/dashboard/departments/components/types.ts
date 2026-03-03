export type Department = {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentFormState = {
  name: string;
  description: string;
  status: boolean;
};

export type DepartmentStatusFilter = "all" | "active" | "inactive";
export type SortDirection = "asc" | "desc";
export type SortableDepartmentKey =
  | "name"
  | "description"
  | "status";

export type DepartmentStats = {
  total: number;
  active: number;
  inactive: number;
};

export type SetDepartmentFormField = <K extends keyof DepartmentFormState>(
  field: K,
  value: DepartmentFormState[K],
) => void;
