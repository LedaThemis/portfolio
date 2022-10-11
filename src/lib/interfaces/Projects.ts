import type { IProject } from "./Project";

export interface IProjects {
  data: IProject["data"][];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
