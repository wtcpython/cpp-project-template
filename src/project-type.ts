import { QuickPickItem } from "vscode";

export interface ProjectType {
  displayName: string;
  description?: string;
  detail?: string;
  metadata: ProjectTypeMetadata;
}

export interface ProjectTypeMetadata {
  type: TemplateType;
  extensionId: string;
  extensionName: string;
  leastExtensionVersion?: string;
  createCommandId?: string;
  createCommandArgs?: any[];
}

export interface ProjectTypeQuickPick extends QuickPickItem {
  metadata: ProjectTypeMetadata;
}

export enum TemplateType {
  CMake = "CMake",
  Makefile = "Makefile",
  Win32 = "Win32",
  SDL = "SDL",
  OpenGL = "OpenGL",
  Meson = "Meson",
  Qt = "Qt",
}
