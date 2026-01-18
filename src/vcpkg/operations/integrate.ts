import { workspace, window, ConfigurationTarget, l10n } from "vscode";
import * as Logger from "../../logger";
import { Wrapper } from "../core/wrapper";
import { IntegratePackageOptions } from "../type";

export async function integratePackage(
  wrapper: Wrapper,
  options: IntegratePackageOptions,
): Promise<void> {
  const { uri } = options;

  Logger.show();
  Logger.log(l10n.t("vcpkg.integrating"));

  if (!uri) {
    const msg = l10n.t("vcpkg.noUri");
    Logger.log(msg);
    window.showErrorMessage(msg);
    throw new Error(msg);
  }

  const workspaceFolder = workspace.getWorkspaceFolder(uri);

  if (!workspaceFolder) {
    const msg = l10n.t("vcpkg.noWorkspace");
    Logger.log(msg);
    window.showErrorMessage(msg);
    throw new Error(msg);
  }

  const toolchainValue = "${env:VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake";
  const config = workspace.getConfiguration("cmake", workspaceFolder.uri);
  let configureSettings = config.get<any>("configureSettings") || {};

  if (configureSettings["CMAKE_TOOLCHAIN_FILE"] === toolchainValue) {
    const msg = l10n.t("vcpkg.alreadyIntegrated");
    Logger.log(msg);
    window.showInformationMessage(msg);
    return;
  }

  try {
    configureSettings["CMAKE_TOOLCHAIN_FILE"] = toolchainValue;
    await config.update(
      "configureSettings",
      configureSettings,
      ConfigurationTarget.WorkspaceFolder,
    );

    const msg = l10n.t("vcpkg.integrated");
    Logger.log(msg);
    window.showInformationMessage(msg);
  } catch (err: any) {
    Logger.log(`Failed to integrate toolchain: ${err.message}`);
    window.showErrorMessage(l10n.t("vcpkg.integrateFailed", err.message));
    throw err;
  }
}
