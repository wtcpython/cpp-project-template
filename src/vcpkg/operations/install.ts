import { window, ProgressLocation, l10n } from "vscode";
import * as Logger from "../../logger";
import { Wrapper } from "../core/wrapper";
import { InstallPackageOptions } from "../type";

export async function installPackage(
  wrapper: Wrapper,
  options: InstallPackageOptions,
): Promise<void> {
  const { projectDir } = options;

  Logger.show();
  Logger.log("Installing dependencies...");

  try {
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: l10n.t("vcpkg.installingDep"),
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: l10n.t("vcpkg.runningInstall") });
        const output = await wrapper.install(projectDir);
        Logger.log(output);
      },
    );

    window.showInformationMessage(l10n.t("vcpkg.installedDep"));
  } catch (err: any) {
    Logger.log(`Failed to install dependencies: ${err.message}`);
    window.showErrorMessage(l10n.t("vcpkg.installDepFailed", err.message));
    throw err;
  }
}