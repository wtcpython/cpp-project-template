import { ExtensionContext, window, l10n } from "vscode";
import * as path from "path";
import * as fse from "fs-extra";
import * as Mustache from "mustache";
import { AbstractProject } from "./abstract-project";

class Win32Project extends AbstractProject {
  protected async preCheck(): Promise<boolean> {
    if (process.platform !== "win32") {
      window.showErrorMessage(l10n.t("win32.onlyOnWindows"));
      return false;
    }
    return true;
  }

  protected getProjectTypeLabel(): string {
    return "Win32";
  }

  protected async getProjectOptions(): Promise<any | undefined> {
    return {};
  }

  protected getTemplateDir(options: any): string {
    return path.join(this.context.extensionPath, "templates", "win32-project");
  }

  protected async renderTemplates(targetDir: string, vars: any): Promise<void> {
    await super.renderTemplates(targetDir, vars);

    // Render main.cpp
    const mainFile = path.join(targetDir, "src", "main.cpp");
    if (await fse.pathExists(mainFile)) {
      let mainContent = await fse.readFile(mainFile, "utf-8");
      mainContent = Mustache.render(mainContent, vars);
      await fse.writeFile(mainFile, mainContent, "utf-8");
    }
  }
}

export async function createWin32Project(
  context: ExtensionContext,
): Promise<void> {
  const project = new Win32Project(context);
  await project.create();
}
