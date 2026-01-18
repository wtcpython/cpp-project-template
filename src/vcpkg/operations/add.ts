import { window, ProgressLocation, QuickPickItem, l10n } from "vscode";
import * as fse from "fs-extra";
import * as path from "path";
import * as Logger from "../../logger";
import { Wrapper } from "../core/wrapper";
import { AddPackageOptions } from "../type";

export async function addPackage(
  wrapper: Wrapper,
  options: AddPackageOptions,
): Promise<void> {
  const { name, projectDir } = options;
  Logger.show();

  try {
    await window.withProgress(
      { location: ProgressLocation.Notification, title: l10n.t("vcpkg.adding", name) },
      async (progress) => {
        progress.report({ message: l10n.t("vcpkg.runningAdd", name) });
        await wrapper.addPort(name, projectDir);
        Logger.log(`Port ${name} added to vcpkg.json.`);

        progress.report({ message: l10n.t("vcpkg.installingDep") });
        const installOut = await wrapper.install(projectDir);
        Logger.log("Dependencies installed.");

        const usage = (await getUsageInfo(projectDir, name)) || installOut;
        await updateCMakeLists(projectDir, usage, name);
      },
    );
    window.showInformationMessage(l10n.t("vcpkg.added", name));
  } catch (err: any) {
    Logger.log(err.message);
    window.showErrorMessage(err.message);
    throw err;
  }
}

async function getUsageInfo(
  projectDir: string,
  pkg: string,
): Promise<string | undefined> {
  const installedDir = path.join(projectDir, "vcpkg_installed");
  if (!(await fse.pathExists(installedDir))) {
    return undefined;
  }

  const entries = await fse.readdir(installedDir, { withFileTypes: true });
  for (const dir of entries.filter((e) => e.isDirectory())) {
    const usagePath = path.join(installedDir, dir.name, "share", pkg, "usage");
    if (await fse.pathExists(usagePath)) {
      return await fse.readFile(usagePath, "utf-8");
    }
  }
  return undefined;
}

function parseUsage(output: string, pkg: string) {
  // Extract find_package
  let findPkg = output
    .match(/find_package\s*\(\s*[^)]+\s*\)/g)
    ?.find(
      (s) =>
        s.toLowerCase().includes(pkg.toLowerCase()) ||
        s.toLowerCase().includes(pkg.replace(/-/g, "_")),
    );
  if (!findPkg && output.length < 2000) {
    findPkg = output.match(/find_package\s*\(\s*[^)]+\s*\)/)?.[0];
  }

  // Extract libraries (Target::Name)
  const libs = new Set<string>();
  for (const match of output.matchAll(/[\w\-:]+::[\w\-:]+/g)) {
    libs.add(match[0]);
  }

  return !findPkg && libs.size === 0
    ? undefined
    : {
        findPkg: findPkg || `# find_package(${pkg} CONFIG REQUIRED)`,
        libs: Array.from(libs),
      };
}

async function updateCMakeLists(dir: string, output: string, pkg: string) {
  const cmakePath = path.join(dir, "CMakeLists.txt");
  if (!(await fse.pathExists(cmakePath))) { return; }

  const info = parseUsage(output, pkg);
  if (!info) {
    Logger.log("No CMake targets detected.");
    return;
  }

  const select = await window.showQuickPick(
    [
        { label: l10n.t("vcpkg.yes"), description: l10n.t("vcpkg.yesDetail", info.findPkg, info.libs.join(", ")) },
        { label: l10n.t("vcpkg.no") }
    ],
    { placeHolder: l10n.t("vcpkg.updateCmake", pkg) }
  );
  if (select?.label !== l10n.t("vcpkg.yes")) { return; }

  let content = await fse.readFile(cmakePath, "utf-8");

  // 1. Insert find_package
  if (!content.includes(info.findPkg)) {
    const lastFindIdx = content.lastIndexOf("find_package");
    const insertIdx = lastFindIdx !== -1 
      ? content.indexOf("\n", lastFindIdx) + 1 
      : (content.indexOf("project(") !== -1 ? content.indexOf("\n", content.indexOf("project(")) + 1 : 0);
    
    content = content.slice(0, insertIdx) + `\n${info.findPkg}\n` + content.slice(insertIdx);
  }

  // 2. Link libraries (Merge or Append)
  const target = content.match(/add_(?:executable|library)\s*\(\s*([^\s)]+)/i)?.[1];
  
  if (target && info.libs.length > 0) {
    const newLibs = info.libs.filter(lib => !content.includes(lib));
    if (newLibs.length > 0) {
      const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const tllRegex = new RegExp(`target_link_libraries\\s*\\(\\s*${escapedTarget}\\s+`, 'g');
      
      let match;
      let lastMatchIndex = -1;
      while ((match = tllRegex.exec(content)) !== null) {
        lastMatchIndex = match.index;
      }

      let merged = false;
      if (lastMatchIndex !== -1) {
        const closeParenIndex = findClosingParen(content, lastMatchIndex);
        if (closeParenIndex !== -1) {
          const commandStr = content.substring(lastMatchIndex, closeParenIndex + 1);
          if (commandStr.includes('\n')) {
            // Multi-line: Insert before closing paren on a new line
             const beforeClose = content.substring(0, closeParenIndex);
             const afterClose = content.substring(closeParenIndex);
             content = beforeClose.trimEnd() + `\n    ${newLibs.join(" ")}\n` + afterClose;
          } else {
            // Single-line: Insert before closing paren
            const beforeClose = content.substring(0, closeParenIndex);
            const afterClose = content.substring(closeParenIndex);
            content = beforeClose + ` ${newLibs.join(" ")}` + afterClose;
          }
          merged = true;
        }
      }

      if (!merged) {
        content += `\ntarget_link_libraries(${target} PRIVATE ${newLibs.join(" ")})\n`;
      }
    }
  }

  await fse.writeFile(cmakePath, content, "utf-8");
  Logger.log("CMakeLists.txt updated.");
}

function findClosingParen(text: string, startIndex: number): number {
  let openCount = 0;
  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === '(') { openCount++; }
    if (text[i] === ')') {
      openCount--;
      if (openCount === 0) { return i; }
    }
  }
  return -1;
}
