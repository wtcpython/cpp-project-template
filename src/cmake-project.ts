import { ExtensionContext, window, l10n } from "vscode";
import * as path from "path";
import { AbstractProject } from "./abstract-project";

class CMakeProject extends AbstractProject {
  protected getProjectTypeLabel(): string {
    return "CMake";
  }

  protected async getProjectOptions(): Promise<any | undefined> {
    const items: any[] = [
      {
        label: "C++",
        value: "cpp",
        description: l10n.t("cmake.createProject", "C++"),
        versions: ["11", "14", "17", "20", "23", "26"],
      },
      {
        label: "C",
        value: "c",
        description: l10n.t("cmake.createProject", "C"),
        versions: ["90", "99", "11", "23"],
      },
    ];

    if (process.platform === "win32" || process.platform === "linux") {
      items.push({
        label: "CUDA",
        value: "cuda",
        description: l10n.t("cmake.createProject", "CUDA"),
        versions: ["14", "17", "20"],
      });
    }

    // Select language type
    const langType = await window.showQuickPick(items, {
      ignoreFocusOut: true,
    });
    if (!langType) {
      return undefined;
    }

    let options: any = { langType: langType.value };

    const version = await window.showQuickPick(langType.versions, {
      placeHolder: l10n.t("cmake.selectStandard"),
      ignoreFocusOut: true,
    });
    if (!version) {
      return undefined;
    }
    options[`${langType.value}Version`] = version;

    const targetType = await window.showQuickPick(
      [
        {
          label: l10n.t("cmake.executable"),
          value: "exe",
          description: l10n.t("cmake.createExe"),
        },
        {
          label: l10n.t("cmake.library"),
          value: "lib",
          description: l10n.t("cmake.createLib"),
        },
      ],
      {
        ignoreFocusOut: true,
        placeHolder: l10n.t("cmake.selectTarget"),
      },
    );

    if (!targetType) {
      return undefined;
    }
    options.targetType = targetType.value;

    // For C++ projects with standard >= C++23 and executable target, ask about modules
    if (
      langType.value === "cpp" &&
      parseInt(version, 10) >= 23 &&
      options.targetType === "exe"
    ) {
      const moduleChoice = await window.showQuickPick(
        [
          { label: l10n.t("cmake.enableModulesYes"), value: "yes" },
          { label: l10n.t("cmake.enableModulesNo"), value: "no" },
        ],
        {
          placeHolder: l10n.t("cmake.enableModulesQuestion"),
          ignoreFocusOut: true,
        },
      );
      if (!moduleChoice) {
        return undefined;
      }
      options.enableModules = moduleChoice.value === "yes";
    }
    return options;
  }

  protected getTemplateDir(options: any): string {
    const base = path.join(this.context.extensionPath, "templates", "cmake-basic");
    if (options.langType === "cpp" && options.enableModules) {
      return path.join(base, `${options.langType}-module-${options.targetType}-project`);
    }
    return path.join(base, `${options.langType}-${options.targetType}-project`);
  }
}

export async function createCMakeProject(
  context: ExtensionContext,
): Promise<void> {
  const project = new CMakeProject(context);
  await project.create();
}