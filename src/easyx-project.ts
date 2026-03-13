import { ExtensionContext, window, l10n } from "vscode";
import * as path from "path";
import { AbstractProject } from "./abstract-project";

class EasyXProject extends AbstractProject {
  protected async preCheck(): Promise<boolean> {
    if (process.platform !== "win32") {
      window.showErrorMessage(l10n.t("easyx.onlyOnWindows"));
      return false;
    }

    return true;
  }

  protected getProjectTypeLabel(): string {
    return "EasyX";
  }

  protected async getProjectOptions(): Promise<any | undefined> {
    return {};
  }

  protected getTemplateDir(_options: any): string {
    return path.join(this.context.extensionPath, "templates", "easyx");
  }
}

export async function createEasyXProject(
  context: ExtensionContext,
): Promise<void> {
  const project = new EasyXProject(context);
  await project.create();
}
