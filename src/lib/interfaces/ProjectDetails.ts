import type { MarkdownLayoutProps } from "astro";

export type ProjectDetailsMDXProps = {
  projectName: string;
  projectSummary: string;
  projectCover: {
    name: string;
    width: number | `${number}`;
    height: number | `${number}`;
    alt: string;
  };
  projectDescription: string;
  projectTechnologies: string;
  projectSource: string;
  projectDemo: string;
  draft: boolean;
  featured: boolean;
  order: number;
};

export type ProjectDetailsProps = MarkdownLayoutProps<ProjectDetailsMDXProps>;
