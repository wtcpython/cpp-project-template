import { ExtensionContext } from "vscode";
import * as path from "path";
import { AbstractProject } from "./abstract-project";

class MesonProject extends AbstractProject {
  protected getProjectTypeLabel(): string {
    return "Meson";
  }

  protected async getProjectOptions(): Promise<any | undefined> {
    return this.promptStandardProjectOptions(this.createLanguageItems());
  }

  protected getTemplateDir(options: any): string {
    return path.join(
      this.context.extensionPath,
      "templates",
      "meson",
      `${options.langType}-${options.targetType}-project`,
    );
  }

  protected async renderTemplates(targetDir: string, vars: any): Promise<void> {
    await this.renderExistingTemplates(
      targetDir,
      [
        "meson.build",
        "src/meson.build",
        "src/main.cpp",
        "src/main.c",
        "src/lib.cpp",
        "src/lib.c",
      ],
      vars,
    );
  }
}

export async function createMesonProject(
  context: ExtensionContext,
): Promise<void> {
  const project = new MesonProject(context);
  await project.create();
}
