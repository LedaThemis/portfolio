interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

interface IProjectCover {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string;
      caption: string;
      width: number;
      height: number;
      formats: {
        thumbnail: ImageFormat;
      };
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      provider: string;
    };
  };
}

export interface IProject {
  data: {
    id: number;
    attributes: {
      name: string;
      summary: string;
      description: string;
      technologies: string;
      demo: string;
      cover: IProjectCover;
      content: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  };
  meta: {};
}
