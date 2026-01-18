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
import { configs, ProjectConfig } from "./type";
import { Wrapper, ensureRoot } from "./core/wrapper";

export async function createProject(
  context: ExtensionContext,
  type: TemplateType,
): Promise<void> {
  Logger.show();
  Logger.log(`Starting creation of ${type} project...`);

  const config = configs[type];
  if (!config) {
    const msg = l10n.t("vcpkg.noConfig", type);
    Logger.log(msg);
    window.showErrorMessage(msg);
    return;
  }

  const root = await ensureRoot();
  if (!root) {
    Logger.log("Root not found or installation cancelled.");
    return;
  }
  const wrapper = new Wrapper(root);

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
        title: l10n.t("vcpkg.init"),
        cancellable: false,
      },
      async (progress) => {
        await initManifest(
          wrapper,
          targetDir,
          projectName,
          config.ports,
          progress,
        );
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

async function initManifest(
  wrapper: Wrapper,
  targetDir: string,
  projectName: string,
  ports: string[],
  progress: Progress<{ message?: string }>,
) {
  Logger.log("Initializing manifest...");
  progress.report({ message: l10n.t("vcpkg.new") });
  await wrapper.newProject(projectName, targetDir, true);

  Logger.log("Adding dependencies: " + ports.join(", "));
  progress.report({ message: l10n.t("vcpkg.addDep") });
  for (const port of ports) {
    await wrapper.addPort(port, targetDir);
  }
}

async function generateProjectFiles(
  context: ExtensionContext,
  targetDir: string,
  templateName: string,
  projectName: string,
  progress: Progress<{ message?: string }>,
) {
  Logger.log(`Generating project files from template: ${templateName}`);
  progress.report({ message: l10n.t("vcpkg.gen") });
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
