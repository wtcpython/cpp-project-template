import { TemplateType } from "../project-type";

export interface ProjectConfig {
  requires: string[];
  templateName: string;
}

// Map dependencies to Conan Center names/versions
// Using reasonable defaults for now.
export const configs: Partial<Record<TemplateType, ProjectConfig>> = {
  [TemplateType.SDL]: {
    requires: ["sdl/2.28.5"],
    templateName: "sdl-project",
  },
  [TemplateType.SDL3]: {
    requires: ["sdl/3.2.0"],
    templateName: "sdl3-project",
  },
  [TemplateType.OpenGL]: {
    requires: ["glfw/3.4", "glad/0.1.36", "glm/0.9.9.8"],
    templateName: "opengl-project",
  },
};
