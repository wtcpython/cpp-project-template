import { Uri } from "vscode";
import { TemplateType } from "../project-type";

export interface ProjectConfig {
  ports: string[];
  templateName: string;
}

export const configs: Partial<Record<TemplateType, ProjectConfig>> = {
  [TemplateType.SDL]: {
    ports: ["sdl2"],
    templateName: "sdl-project",
  },
  [TemplateType.OpenGL]: {
    ports: ["glfw3", "glad", "glm"],
    templateName: "opengl-project",
  },
};

export interface Package {
  name: string;
  version: string;
  description: string | string[];
}

export interface AddPackageOptions {
  name: string;
  version?: string;
  triplet?: string;
  projectDir: string;
}

export interface InstallPackageOptions {
  projectDir: string;
}

export interface UpgradePackageOptions {
  projectDir: string;
}

export interface SearchPackageOptions {
  keyword: string;
  projectDir: string;
}

export interface IntegratePackageOptions {
  uri?: Uri;
}
