import { ExtensionContext } from "vscode";
import * as path from "path";
import { AbstractProject } from "./abstract-project";

class MakefileProject extends AbstractProject {
  protected getProjectTypeLabel(): string {
    return "Makefile";
  }

  protected async getProjectOptions(): Promise<any | undefined> {
    return this.promptStandardProjectOptions(this.createLanguageItems());
  }

  protected getTemplateDir(options: any): string {
    return path.join(
      this.context.extensionPath,
      "templates",
      "makefile-basic",
      `${options.langType}-${options.targetType}-project`,
    );
  }

  protected async renderTemplates(targetDir: string, vars: any): Promise<void> {
    await this.renderExistingTemplates(targetDir, ["Makefile"], vars);
  }
}

export async function createMakefileProject(
  context: ExtensionContext,
): Promise<void> {
  const project = new MakefileProject(context);
  await project.create();
}
