import { window, commands, Uri, ExtensionContext, l10n } from "vscode";
import * as fse from "fs-extra";
import * as path from "path";
import * as Mustache from "mustache";
import { Utility } from "./utility";

export abstract class AbstractProject {
  constructor(protected context: ExtensionContext) {}

  public async create(): Promise<void> {
    if (!(await this.preCheck())) {
      return;
    }

    const workspaceFolder = Utility.getDefaultWorkspaceFolder();
    const location: Uri[] | undefined = await window.showOpenDialog({
      defaultUri: workspaceFolder && workspaceFolder.uri,
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: l10n.t("project.selectLocation"),
    });

    if (!location || !location.length) {
      return;
    }

    const basePath: string = location[0].fsPath;
    const projectName: string | undefined = await window.showInputBox({
      prompt: l10n.t("project.inputName", this.getProjectTypeLabel()),
      ignoreFocusOut: true,
      validateInput: async (name: string): Promise<string> => {
        if (name && !name.match(/^[^*~\\/]+$/)) {
          return l10n.t("project.invalidName");
        }
        if (name && (await fse.pathExists(path.join(basePath, name)))) {
          return l10n.t("project.nameExists");
        }
        return "";
      },
    });

    if (!projectName) {
      return;
    }

    const options = await this.getProjectOptions();
    if (options === undefined) {
      return; // User cancelled options selection
    }

    const templateDir = this.getTemplateDir(options);
    const targetDir = path.join(basePath, projectName);
    const renderVars = { projectName, ...options };

    try {
      await fse.ensureDir(targetDir);
      await fse.copy(templateDir, targetDir);

      await this.renderTemplates(targetDir, renderVars);

      const open = await window.showInformationMessage(
        l10n.t("project.created", targetDir),
        l10n.t("project.open"),
      );
      if (open === l10n.t("project.open")) {
        commands.executeCommand("vscode.openFolder", Uri.file(targetDir), true);
      }
    } catch (error: any) {
      window.showErrorMessage(
        error.message || l10n.t("project.createFailed", error),
      );
    }
  }

  protected async preCheck(): Promise<boolean> {
    return true;
  }

  protected abstract getProjectTypeLabel(): string;
  protected abstract getProjectOptions(): Promise<any | undefined>;
  protected abstract getTemplateDir(options: any): string;

  protected async renderTemplates(targetDir: string, vars: any): Promise<void> {
    // Default implementation renders CMakeLists.txt if it exists
    const cmakeFile = path.join(targetDir, "CMakeLists.txt");
    if (await fse.pathExists(cmakeFile)) {
      let cmakeContent = await fse.readFile(cmakeFile, "utf-8");
      cmakeContent = Mustache.render(cmakeContent, vars);
      await fse.writeFile(cmakeFile, cmakeContent, "utf-8");
    }
  }
}
