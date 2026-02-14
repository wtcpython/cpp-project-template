import { window, commands, Uri, ExtensionContext, l10n } from "vscode";
import * as fse from "fs-extra";
import * as path from "path";
import * as Mustache from "mustache";
import { Utility } from "./utility";

export interface ProjectLanguageItem {
  label: string;
  value: string;
  versions: string[];
}

export interface StandardProjectOptions {
  langType: string;
  targetType: "exe" | "lib";
  [key: string]: any;
}

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

  protected createLanguageItems(
    extraItems: ProjectLanguageItem[] = [],
  ): ProjectLanguageItem[] {
    return [
      {
        label: "C++",
        value: "cpp",
        versions: ["11", "14", "17", "20", "23", "26"],
      },
      {
        label: "C",
        value: "c",
        versions: ["90", "99", "11", "23"],
      },
      ...extraItems,
    ];
  }

  protected async promptStandardProjectOptions(
    items: ProjectLanguageItem[],
  ): Promise<StandardProjectOptions | undefined> {
    const langType = await window.showQuickPick(
      items.map((item) => ({
        label: item.label,
        value: item.value,
        versions: item.versions,
        description: l10n.t("project.createProject", item.label),
      })),
      {
        ignoreFocusOut: true,
      },
    );
    if (!langType) {
      return undefined;
    }

    const options: StandardProjectOptions = {
      langType: langType.value,
      targetType: "exe",
    };

    const version = await window.showQuickPick(langType.versions, {
      placeHolder: l10n.t("project.selectStandard"),
      ignoreFocusOut: true,
    });
    if (!version) {
      return undefined;
    }
    options[`${langType.value}Version`] = version;

    const targetType = await window.showQuickPick(
      [
        {
          label: l10n.t("project.executable"),
          value: "exe",
          description: l10n.t("project.createExe"),
        },
        {
          label: l10n.t("project.library"),
          value: "lib",
          description: l10n.t("project.createLib"),
        },
      ],
      {
        ignoreFocusOut: true,
        placeHolder: l10n.t("project.selectTarget"),
      },
    );
    if (!targetType) {
      return undefined;
    }

    options.targetType = targetType.value as "exe" | "lib";
    return options;
  }

  protected async renderExistingTemplates(
    targetDir: string,
    relativePaths: string[],
    vars: any,
  ): Promise<void> {
    for (const relativePath of relativePaths) {
      const fullPath = path.join(targetDir, ...relativePath.split("/"));
      if (await fse.pathExists(fullPath)) {
        let content = await fse.readFile(fullPath, "utf-8");
        content = Mustache.render(content, vars);
        await fse.writeFile(fullPath, content, "utf-8");
      }
    }
  }

  protected async renderTemplates(targetDir: string, vars: any): Promise<void> {
    // Default implementation renders CMakeLists.txt if it exists
    await this.renderExistingTemplates(targetDir, ["CMakeLists.txt"], vars);
  }
}
