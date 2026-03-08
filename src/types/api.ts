// ========================
// Generic API Response Types
// ========================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction: string;
    };
  };
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}
