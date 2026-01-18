import { window, QuickPick, QuickPickItem, QuickPickOptions, l10n } from "vscode";
import * as Logger from "../../logger";
import { Wrapper } from "../core/wrapper";
import { Package, SearchPackageOptions } from "../type";

export async function searchPackage(
  wrapper: Wrapper,
  options: SearchPackageOptions,
): Promise<Package[]> {
  const { keyword, projectDir } = options;

  Logger.show();
  Logger.log(`Searching packages for "${keyword}"...`);

  try {
    const packages = await wrapper.search(keyword, projectDir);
    return packages;
  } catch (e: any) {
    Logger.log(`Search failed: ${e.message}`);
    throw e;
  }
}

export async function searchAndSelectPackage(
  wrapper: Wrapper,
  options: SearchPackageOptions,
): Promise<Package | undefined> {
  const { projectDir } = options;

  Logger.show();
  Logger.log("Loading all packages...");

  const packages = await searchPackage(wrapper, { keyword: "", projectDir });

  if (packages.length === 0) {
    window.showInformationMessage(l10n.t("vcpkg.noLibs"));
    return undefined;
  }

  const quickPick = window.createQuickPick<QuickPickItem & { package: Package }>();
  quickPick.title = l10n.t("vcpkg.addDepTitle");
  quickPick.placeholder = l10n.t("vcpkg.packagesAvailable", packages.length);

  const items = packages.map((p) => ({
    label: p.name,
    description: p.version,
    detail: p.description
      ? Array.isArray(p.description)
        ? p.description.join(" ")
        : p.description
      : "",
    package: p,
  }));

  quickPick.items = items;

  const selected = await new Promise<QuickPickItem & { package: Package } | undefined>((resolve) => {
    quickPick.onDidAccept(() => {
      const selection = quickPick.selectedItems[0];
      quickPick.hide();
      resolve(selection);
    });

    quickPick.onDidHide(() => {
      resolve(undefined);
    });

    quickPick.show();
  });

  return selected?.package;
}