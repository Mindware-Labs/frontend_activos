export type PersonType = "Fisica" | "Juridica";

export type Department = {
  id: number;
  name: string;
  status: boolean;
  description?: string;
};

export type Employee = {
  id: number;
  name: string;
  cedula: string;
  personType: PersonType;
  hireDate: string;
  departmentId: number;
  status: boolean;
  department?: Department;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeeFormState = {
  name: string;
  cedula: string;
  personType: PersonType;
  hireDate: string;
  departmentId: string;
  status: boolean;
};

export type EmployeeStatusFilter = "all" | "active" | "inactive";
export type SortDirection = "asc" | "desc";
export type SortableEmployeeKey =
  | "name"
  | "cedula"
  | "personType"
  | "hireDate"
  | "departmentId"
  | "status";

export type EmployeeStats = {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Array<Department & { count: number }>;
};

export type SetEmployeeFormField = <K extends keyof EmployeeFormState>(
  field: K,
  value: EmployeeFormState[K],
) => void;
