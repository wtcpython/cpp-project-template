import { ExtensionContext, window, l10n } from "vscode";
import * as path from "path";
import { AbstractProject } from "./abstract-project";
import * as fse from "fs-extra";
import * as Mustache from "mustache";

class MakefileProject extends AbstractProject {
  protected getProjectTypeLabel(): string {
    return "Makefile";
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

    const langType = await window.showQuickPick(items, {
      ignoreFocusOut: true,
    });
    if (!langType) {
      return undefined;
    }

    const options: any = { langType: langType.value };

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
    return options;
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
    const makefile = path.join(targetDir, "Makefile");
    if (await fse.pathExists(makefile)) {
      let content = await fse.readFile(makefile, "utf-8");
      content = Mustache.render(content, vars);
      await fse.writeFile(makefile, content, "utf-8");
    }
  }
}

export async function createMakefileProject(
  context: ExtensionContext,
): Promise<void> {
  const project = new MakefileProject(context);
  await project.create();
}
