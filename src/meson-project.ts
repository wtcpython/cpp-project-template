import { ExtensionContext, window, l10n } from "vscode";
import * as path from "path";
import * as fse from "fs-extra";
import * as Mustache from "mustache";
import { AbstractProject } from "./abstract-project";

class MesonProject extends AbstractProject {
  protected getProjectTypeLabel(): string {
    return "Meson";
  }

  protected async getProjectOptions(): Promise<any | undefined> {
    const versions = ["11", "14", "17", "20", "23", "26"];
    const cppVersion = await window.showQuickPick(versions, {
      placeHolder: l10n.t("cmake.selectStandard"), // Reuse existing key
      ignoreFocusOut: true,
    });
    
    if (!cppVersion) {
      return undefined;
    }

    return { cppVersion };
  }

  protected getTemplateDir(options: any): string {
    return path.join(
      this.context.extensionPath,
      "templates",
      "meson",
      "cpp-exe-project",
    );
  }

  protected async renderTemplates(targetDir: string, vars: any): Promise<void> {
      // Render meson.build
      const mesonFile = path.join(targetDir, "meson.build");
      if (await fse.pathExists(mesonFile)) {
        let content = await fse.readFile(mesonFile, "utf-8");
        content = Mustache.render(content, vars);
        await fse.writeFile(mesonFile, content, "utf-8");
      }

      // Render src/meson.build
      const srcMesonFile = path.join(targetDir, "src", "meson.build");
      if (await fse.pathExists(srcMesonFile)) {
        let content = await fse.readFile(srcMesonFile, "utf-8");
        content = Mustache.render(content, vars);
        await fse.writeFile(srcMesonFile, content, "utf-8");
      }

      // Render main.cpp
      const mainFile = path.join(targetDir, "src", "main.cpp");
      if (await fse.pathExists(mainFile)) {
        let content = await fse.readFile(mainFile, "utf-8");
        content = Mustache.render(content, vars);
        await fse.writeFile(mainFile, content, "utf-8");
      }
  }
}

export async function createMesonProject(
  context: ExtensionContext,
): Promise<void> {
  const project = new MesonProject(context);
  await project.create();
}
