import { ExtensionContext, window, l10n } from "vscode";
import * as path from "path";
import { AbstractProject } from "./abstract-project";

class CMakeProject extends AbstractProject {
  protected getProjectTypeLabel(): string {
    return "CMake";
  }

  protected async getProjectOptions(): Promise<any | undefined> {
    const extraItems: any[] = [];

    if (process.platform === "win32" || process.platform === "linux") {
      extraItems.push({
        label: "CUDA",
        value: "cuda",
        versions: ["14", "17", "20"],
      });
    }

    const options = await this.promptStandardProjectOptions(
      this.createLanguageItems(extraItems),
    );
    if (!options) {
      return undefined;
    }
    const selectedVersion = options[`${options.langType}Version`];

    // For C++ projects with standard >= C++23 and executable target, ask about modules
    if (
      options.langType === "cpp" &&
      parseInt(selectedVersion, 10) >= 23 &&
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
    const base = path.join(
      this.context.extensionPath,
      "templates",
      "cmake-basic",
    );
    if (options.langType === "cpp" && options.enableModules) {
      return path.join(
        base,
        `${options.langType}-module-${options.targetType}-project`,
      );
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
