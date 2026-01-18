import * as path from "path";
import * as cp from "child_process";
import * as fse from "fs-extra";
import * as os from "os";
import { window, ProgressLocation, l10n } from "vscode";
import * as Logger from "../../logger";

function getDefaultPath(): string {
  const defaultWin = "C:\\vcpkg";
  const defaultUnix = path.join(os.homedir(), "vcpkg");
  return process.platform === "win32" ? defaultWin : defaultUnix;
}

export async function findRoot(): Promise<string | undefined> {
  if (
    process.env.VCPKG_ROOT &&
    (await fse.pathExists(process.env.VCPKG_ROOT))
  ) {
    Logger.log(`Found at VCPKG_ROOT: ${process.env.VCPKG_ROOT}`);
    return process.env.VCPKG_ROOT;
  }

  const defaultPath = getDefaultPath();
  if (await fse.pathExists(defaultPath)) {
    Logger.log(`Found at default location: ${defaultPath}`);
    return defaultPath;
  }

  return undefined;
}

export async function ensureRoot(): Promise<string | undefined> {
  const root = await findRoot();
  if (root) {
    return root;
  }

  const install = await window.showInformationMessage(
    l10n.t("vcpkg.notFound"),
    l10n.t("vcpkg.install"),
    l10n.t("vcpkg.cancel")
  );

  if (install === l10n.t("vcpkg.install")) {
    const defaultPath = getDefaultPath();

    try {
      Logger.show();
      Logger.log("Installing vcpkg...");
      await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: l10n.t("vcpkg.installing"),
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: l10n.t("vcpkg.cloning") });
          const parentDir = path.dirname(defaultPath);
          await fse.ensureDir(parentDir);

          Logger.log(`Cloning to ${defaultPath}...`);
          await execute(
            `git clone https://github.com/microsoft/vcpkg.git ${path.basename(defaultPath)}`,
            parentDir,
          );

          progress.report({ message: l10n.t("vcpkg.bootstrapping") });
          const bootstrapScript =
            process.platform === "win32"
              ? "bootstrap-vcpkg.bat"
              : "./bootstrap-vcpkg.sh";
          Logger.log("Bootstrapping...");
          await execute(bootstrapScript, defaultPath);
        },
      );
      Logger.log("Installed successfully.");
      return defaultPath;
    } catch (err: any) {
      Logger.log(`Failed to install: ${err.message}`);
      window.showErrorMessage(l10n.t("vcpkg.installFailed", err.message));
      return undefined;
    }
  }

  return undefined;
}

export async function updateSelf(root: string): Promise<void> {
  try {
    Logger.log("Updating vcpkg itself...");
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: l10n.t("vcpkg.updatingSelf"),
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: "Updating vcpkg..." });
        const output = await execute("git pull", root);
        Logger.log(output);
      },
    );
    Logger.log("vcpkg updated successfully.");
  } catch (err: any) {
    Logger.log(`Failed to update vcpkg: ${err.message}`);
    window.showWarningMessage(
      l10n.t("vcpkg.updateSelfFailed", err.message)
    );
  }
}

export async function execute(cmd: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = cp.exec(cmd, { cwd }, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });

    process.stdout?.on("data", (data) => {
      Logger.log(data.toString().trim());
    });
    process.stderr?.on("data", (data) => {
      Logger.log(`${data.toString().trim()}`);
    });
  });
}
