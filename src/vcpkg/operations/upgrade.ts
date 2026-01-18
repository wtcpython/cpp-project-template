import { window, ProgressLocation, l10n } from "vscode";
import * as Logger from "../../logger";
import { Wrapper } from "../core/wrapper";
import { updateSelf } from "../core/setup";
import { UpgradePackageOptions } from "../type";

export async function upgradePackage(
  wrapper: Wrapper,
  options: UpgradePackageOptions,
): Promise<void> {
  const { projectDir } = options;

  Logger.show();

  await updateSelf(wrapper.root);

  Logger.log("Updating baseline...");

  try {
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: l10n.t("vcpkg.updatingBase"),
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: l10n.t("vcpkg.runningUpdateBase") });
        const output = await wrapper.updateBaseline(projectDir);
        Logger.log(output);
      },
    );
  } catch (err: any) {
    Logger.log(`Failed to update baseline: ${err.message}`);
    window.showWarningMessage(l10n.t("vcpkg.updateBaseFailed", err.message));
  }

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

    window.showInformationMessage(l10n.t("vcpkg.upgraded"));
  } catch (err: any) {
    Logger.log(`Failed to install dependencies: ${err.message}`);
    window.showErrorMessage(l10n.t("vcpkg.installDepFailed", err.message));
    throw err;
  }
}