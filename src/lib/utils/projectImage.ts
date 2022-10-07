import type { IProject } from '../interfaces/Project';
import APIURL from './APIURL';

export const defaultImageParams = {
  format: 'webp',
  quality: '100',
};

const imageAPIURL = (url: string, width: string, defaultParams: Record<string, string> = defaultImageParams) =>
  APIURL(
    url,
    new URLSearchParams({
      width,
      ...defaultParams,
    })
  );

export const constructImageSrcSet = (image: IProject['data']['attributes']['cover']) => {
  return [
    `${imageAPIURL(image.data.attributes.url, '2160')} 2160w`,
    `${imageAPIURL(image.data.attributes.url, '1440')} 1440w`,
    `${imageAPIURL(image.data.attributes.url, '1080')} 1080w`,
    `${imageAPIURL(image.data.attributes.url, '720')} 720w`,
    `${imageAPIURL(image.data.attributes.url, '480')} 480w`,
    `${imageAPIURL(image.data.attributes.url, '360')} 360w`,
  ].join(', ');
};
