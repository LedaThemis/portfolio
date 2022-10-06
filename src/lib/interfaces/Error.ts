export interface ErrorResponse {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: {};
  };
}

export interface SuccessResponse {
  data: {};
  meta: {};
}
