import config from "../../config";
import type { IProject } from "../interfaces/Project";

const imageAPIURL = (hash: string, ext: string, width: string) => {
  const { baseURL, instanceName } = config.providers.cloudinary;

  const url = `${baseURL}/${instanceName}/image/upload/w_${width},c_scale/${hash}${".webp"}`;

  return url;
};

export const constructImageSrcSet = (
  image: IProject["data"]["attributes"]["cover"]
) => {
  return [
    `${imageAPIURL(
      image.data.attributes.hash,
      image.data.attributes.ext,
      "1440"
    )} 1440w`,
    `${imageAPIURL(
      image.data.attributes.hash,
      image.data.attributes.ext,
      "1080"
    )} 1080w`,
    `${imageAPIURL(
      image.data.attributes.hash,
      image.data.attributes.ext,
      "720"
    )} 720w`,
    `${imageAPIURL(
      image.data.attributes.hash,
      image.data.attributes.ext,
      "500"
    )} 500w`,
    `${imageAPIURL(
      image.data.attributes.hash,
      image.data.attributes.ext,
      "360"
    )} 360w`,
  ].join(", ");
};
