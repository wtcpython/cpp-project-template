import {
  window,
  commands,
  Uri,
  ExtensionContext,
  ProgressLocation,
  Progress,
  l10n,
} from "vscode";
import * as fse from "fs-extra";
import * as path from "path";
import * as Mustache from "mustache";
import { Utility } from "../utility";
import { TemplateType } from "../project-type";
import * as Logger from "../logger";
import { PackageManagerFactory } from "./manager-factory";
import { IPackageManager } from "./interface";
import { configs as vcpkgConfigs } from "../vcpkg/type";
import { configs as conanConfigs } from "../conan/type";

export async function createManagedProject(
  context: ExtensionContext,
  type: TemplateType,
): Promise<void> {
  Logger.show();
  Logger.log(`Starting creation of ${type} project...`);

  // 1. Select Package Manager
  const managers = PackageManagerFactory.getManagers();
  const managerChoice = await window.showQuickPick(
    managers.map(m => m.name),
    {
      placeHolder: l10n.t("pkgmgr.select"),
      ignoreFocusOut: true
    }
  );

  if (!managerChoice) {
     Logger.log("Package manager selection cancelled.");
     return;
  }

  const packageManager = PackageManagerFactory.getManager(managerChoice)!;

  // 2. Get Config
  let config: any;
  let dependencies: string[] = [];
  
  if (packageManager.name === "vcpkg") {
      config = vcpkgConfigs[type];
      dependencies = config?.ports || [];
  } else if (packageManager.name === "conan") {
      config = conanConfigs[type];
      dependencies = config?.requires || [];
  }

  if (!config) {
    const msg = l10n.t("pkgmgr.noConfig", type, packageManager.name);
    Logger.log(msg);
    window.showErrorMessage(msg);
    return;
  }

  // 3. Get Project Info (Name, Location)
  const projectInfo = await getProjectInfo(type);
  if (!projectInfo) {
    Logger.log("Project information collection cancelled.");
    return;
  }
  const { projectName, targetDir } = projectInfo;

  Logger.log(`Creating project "${projectName}" at ${targetDir}`);
  await fse.ensureDir(targetDir);

  try {
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: l10n.t("project.creating"),
        cancellable: false,
      },
      async (progress) => {
        // 4. Init Package Manager
        await packageManager.init({
            targetDir,
            projectName,
            dependencies,
            progress
        });

        // 5. Generate Project Files
        await generateProjectFiles(
          context,
          targetDir,
          config.templateName,
          projectName,
          progress,
        );
      },
    );

    Logger.log("Project created successfully.");
    await openProject(targetDir);
  } catch (err: any) {
    Logger.log(`Error creating project: ${err.message}`);
    window.showErrorMessage(l10n.t("project.createFailed", err.message));
  }
}

async function getProjectInfo(
  type: TemplateType,
): Promise<{ projectName: string; targetDir: string } | undefined> {
  const workspaceFolder = Utility.getDefaultWorkspaceFolder();
  const location: Uri[] | undefined = await window.showOpenDialog({
    defaultUri: workspaceFolder && workspaceFolder.uri,
    canSelectFiles: false,
    canSelectFolders: true,
  });
  if (!location || !location.length) {
    return undefined;
  }

  const basePath: string = location[0].fsPath;
  const projectName: string | undefined = await window.showInputBox({
    prompt: l10n.t("project.inputName", type),
    ignoreFocusOut: true,
    validateInput: async (name: string): Promise<string> => {
      if (name && !name.match(/^[a-z0-9-]+$/)) {
        return l10n.t("project.invalidName");
      }
      if (name && (await fse.pathExists(path.join(basePath, name)))) {
        return l10n.t("project.nameExists");
      }
      return "";
    },
  });

  if (!projectName) {
    return undefined;
  }

  return {
    projectName,
    targetDir: path.join(basePath, projectName),
  };
}

async function generateProjectFiles(
  context: ExtensionContext,
  targetDir: string,
  templateName: string,
  projectName: string,
  progress: Progress<{ message?: string }>,
) {
  Logger.log(`Generating project files from template: ${templateName}`);
  progress.report({ message: l10n.t("project.genFiles") });
  const templateDir = path.join(
    context.extensionPath,
    "templates",
    templateName,
  );
  await fse.copy(templateDir, targetDir, { overwrite: true });

  const cmakeVars = { projectName };

  await renderTemplate(path.join(targetDir, "CMakeLists.txt"), cmakeVars);
  await renderTemplate(path.join(targetDir, "src", "main.cpp"), cmakeVars);
}

async function renderTemplate(filePath: string, view: any) {
  if (await fse.pathExists(filePath)) {
    let content = await fse.readFile(filePath, "utf-8");
    content = Mustache.render(content, view);
    await fse.writeFile(filePath, content, "utf-8");
  }
}

async function openProject(targetDir: string) {
  const open = await window.showInformationMessage(
    l10n.t("project.created", targetDir),
    l10n.t("project.open"),
  );
  if (open === l10n.t("project.open")) {
    commands.executeCommand("vscode.openFolder", Uri.file(targetDir), true);
  }
}
