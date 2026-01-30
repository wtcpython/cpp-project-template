import * as semver from "semver";
import {
  commands,
  Disposable,
  Extension,
  ExtensionContext,
  extensions,
  Uri,
  window,
  l10n,
} from "vscode";
import { createCMakeProject } from "../cmake-project";
import { createMakefileProject } from "../makefile-project";
import { createWin32Project } from "../win32-project";
import { createMesonProject } from "../meson-project";
import { createProject } from "../vcpkg/project";
import { integrate, install, upgrade, searchAndSelect, add } from "../vcpkg";
import * as path from "path";
import {
  ProjectType,
  ProjectTypeMetadata,
  ProjectTypeQuickPick,
  TemplateType,
} from "../project-type";
import { CppType, newCppFileWithSpecificType } from "../explorerCommands/new";

export class ProjectController implements Disposable {
  private disposable: Disposable;

  public constructor(public readonly context: ExtensionContext) {
    this.disposable = Disposable.from(
      commands.registerCommand(
        "_cpp.project.create.from.fileexplorer.welcome",
        () => this.createProject(),
      ),
      commands.registerCommand("_cpp.project.createClass", (uri?: Uri) =>
        newCppFileWithSpecificType(CppType.CLASS, uri),
      ),
      commands.registerCommand("_cpp.project.createInterface", (uri?: Uri) =>
        newCppFileWithSpecificType(CppType.INTERFACE, uri),
      ),
      commands.registerCommand("_cpp.project.createEnum", (uri?: Uri) =>
        newCppFileWithSpecificType(CppType.ENUM, uri),
      ),
      commands.registerCommand("_cpp.project.createHeader", (uri?: Uri) =>
        newCppFileWithSpecificType(CppType.HEADER, uri),
      ),
      commands.registerCommand("_cpp.project.createSource", (uri?: Uri) =>
        newCppFileWithSpecificType(CppType.SOURCE, uri),
      ),
      commands.registerCommand("_cpp.project.createCHeader", (uri?: Uri) =>
        newCppFileWithSpecificType(CppType.CHEADER, uri),
      ),
      commands.registerCommand("_cpp.project.createCSource", (uri?: Uri) =>
        newCppFileWithSpecificType(CppType.CSOURCE, uri),
      ),
      commands.registerCommand(
        "_cpp.project.integrateVcpkgToolchain",
        async (uri?: Uri) => {
          if (uri) {
            await integrate({ uri });
          }
        },
      ),
      commands.registerCommand(
        "_cpp.project.upgradeDependencies",
        async (uri?: Uri) => {
          if (uri) {
            await upgrade({ projectDir: path.dirname(uri.fsPath) });
          }
        },
      ),
      commands.registerCommand(
        "_cpp.project.refreshDependencies",
        async (uri?: Uri) => {
          if (uri) {
            await install({ projectDir: path.dirname(uri.fsPath) });
          }
        },
      ),
      commands.registerCommand(
        "_cpp.project.addDependency",
        async (uri?: Uri) => {
          if (uri) {
            const projectDir = path.dirname(uri.fsPath);

            try {
              const pkg = await searchAndSelect({ keyword: "", projectDir });
              if (!pkg) {
                return;
              }

              await add({ name: pkg.name, projectDir });
            } catch (err: any) {
              console.error("Failed to add dependency:", err);
              window.showErrorMessage(
                `${l10n.t("controller.addDepFailed")} ${err.message}`,
              );
            }
          }
        },
      ),
      commands.registerCommand(
        "cpp.project.installExtension",
        (extensionId: string) => {
          commands.executeCommand(
            "workbench.extensions.installExtension",
            extensionId,
          );
          commands.executeCommand("extension.open", extensionId);
        },
      ),
    );
  }

  public dispose() {
    this.disposable.dispose();
  }

  private async createProject() {
    const items: ProjectTypeQuickPick[] = projectTypes
      .filter((type) => {
        if (type.metadata.type === TemplateType.Win32) {
          return process.platform === "win32";
        }
        return true;
      })
      .map((type: ProjectType) => {
        let detail = type.detail;
        if (
          type.metadata.type === TemplateType.CMake ||
          type.metadata.type === TemplateType.Makefile ||
          type.metadata.type === TemplateType.Win32 ||
          type.metadata.type === TemplateType.SDL ||
          type.metadata.type === TemplateType.OpenGL ||
          type.metadata.type === TemplateType.Meson
        ) {
          detail = l10n.t("controller.detail", type.metadata.type);
        }

        return {
          label: type.displayName,
          description: type.description,
          detail: type.metadata.extensionName
            ? l10n.t("controller.providedBy", type.metadata.extensionName)
            : detail,
          metadata: type.metadata,
        };
      });

    const choice = await window.showQuickPick(items, {
      ignoreFocusOut: true,
      placeHolder: l10n.t("controller.selectType"),
    });

    if (!choice) {
      return;
    }

    if (!(await this.ensureExtension(choice.label, choice.metadata))) {
      return;
    }

    if (choice.metadata.type === TemplateType.CMake) {
      await createCMakeProject(this.context);
    } else if (choice.metadata.type === TemplateType.Makefile) {
      await createMakefileProject(this.context);
    } else if (choice.metadata.type === TemplateType.Win32) {
      await createWin32Project(this.context);
    } else if (choice.metadata.type === TemplateType.Meson) {
      await createMesonProject(this.context);
    } else if (
      choice.metadata.type === TemplateType.SDL ||
      choice.metadata.type === TemplateType.OpenGL
    ) {
      await createProject(this.context, choice.metadata.type);
    } else if (choice.metadata.createCommandId) {
      if (choice.metadata.createCommandArgs) {
        await commands.executeCommand(
          choice.metadata.createCommandId,
          ...choice.metadata.createCommandArgs,
        );
      } else {
        await commands.executeCommand(choice.metadata.createCommandId);
      }
    } else {
      window.showInformationMessage(
        l10n.t("controller.selected", choice.label),
      );
    }
  }

  private async ensureExtension(
    typeName: string,
    metaData: ProjectTypeMetadata,
  ): Promise<boolean> {
    if (!metaData.extensionId) {
      return true;
    }

    const extension: Extension<any> | undefined = extensions.getExtension(
      metaData.extensionId,
    );
    if (extension === undefined) {
      await this.promptInstallExtension(typeName, metaData);
      return false;
    }

    if (
      metaData.leastExtensionVersion &&
      semver.lt(extension.packageJSON.version, metaData.leastExtensionVersion)
    ) {
      await this.promptUpdateExtension(typeName, metaData);
      return false;
    }

    if (!extension.isActive) {
      await extension.activate();
    }
    return true;
  }

  private async promptInstallExtension(
    projectType: string,
    metaData: ProjectTypeMetadata,
  ): Promise<void> {
    const choice = await window.showInformationMessage(
      l10n.t("controller.installReq", metaData.extensionName, projectType),
      l10n.t("controller.install"),
    );
    if (choice === l10n.t("controller.install")) {
      commands.executeCommand(
        "cpp.project.installExtension",
        metaData.extensionId,
      );
    }
  }

  private async promptUpdateExtension(
    projectType: string,
    metaData: ProjectTypeMetadata,
  ): Promise<void> {
    const choice = await window.showInformationMessage(
      l10n.t("controller.updateReq", metaData.extensionName, projectType),
      l10n.t("controller.update"),
    );
    if (choice === l10n.t("controller.update")) {
      commands.executeCommand(
        "cpp.project.installExtension",
        metaData.extensionId,
      );
    }
  }
}

const projectTypes: ProjectType[] = [
  {
    displayName: "CMake Project",
    detail: "Create a basic CMake-based project",
    metadata: {
      type: TemplateType.CMake,
      extensionId: "",
      extensionName: "",
    },
  },
  {
    displayName: "Makefile Project",
    detail: "Create a basic Makefile-based project",
    metadata: {
      type: TemplateType.Makefile,
      extensionId: "",
      extensionName: "",
    },
  },
  {
    displayName: "Win32 Project",
    detail: "Create a Win32 GUI project",
    metadata: {
      type: TemplateType.Win32,
      extensionId: "",
      extensionName: "",
    },
  },
  {
    displayName: "SDL Project",
    detail: "Create an SDL2 project",
    metadata: {
      type: TemplateType.SDL,
      extensionId: "",
      extensionName: "",
    },
  },
  {
    displayName: "OpenGL Project",
    detail: "Create an OpenGL project",
    metadata: {
      type: TemplateType.OpenGL,
      extensionId: "",
      extensionName: "",
    },
  },
  {
    displayName: "Meson Project",
    metadata: {
      type: TemplateType.Meson,
      extensionId: "",
      extensionName: "",
    },
  },
  {
    displayName: "Qt Project",
    metadata: {
      type: TemplateType.Qt,
      extensionId: "theqtcompany.qt-core",
      extensionName: "Qt Core",
      createCommandId: "qt-core.createNewItem",
    },
  },
];
