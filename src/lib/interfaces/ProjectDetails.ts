import type { MarkdownLayoutProps } from "astro";

export type ProjectDetailsMDXProps = {
  projectName: string;
  projectSummary: string;
  projectCover: string;
  projectDescription: string;
  projectTechnologies: string;
  projectSource: string;
  projectDemo: string;
};

export type ProjectDetailsProps = MarkdownLayoutProps<ProjectDetailsMDXProps>;
