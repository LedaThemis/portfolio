const APIURL = (path: string, parameters?: URLSearchParams) =>
  `${import.meta.env.API_ENDPOINT}${path}?${parameters?.toString()}`;

export default APIURL;
