export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AuditLogEntry {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityName: string;
  entityId: number;
  details: Record<string, any> | null;
  createdAt: string;
}

export interface ImportStatus {
  state: string;
  progress: number | string | boolean | object;
  result?: {
    total: number;
    inserted: number;
    failed: number;
    errors: string[];
  } | null;
}

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
}
