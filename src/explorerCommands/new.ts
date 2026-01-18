import * as fse from "fs-extra";
import * as path from "path";
import * as mustache from "mustache";
import {
  extensions,
  Uri,
  window,
  workspace,
  WorkspaceEdit,
  Position,
  l10n,
} from "vscode";
import { checkCppQualifiedName } from "./utility";

export class CppType {
  public static readonly CLASS: CppType = new CppType(
    "Class",
    "class",
    "cpp/class",
    true,
  );
  public static readonly INTERFACE: CppType = new CppType(
    "Interface",
    "interface",
    "cpp/interface",
    true,
  );
  public static readonly ENUM: CppType = new CppType(
    "Enum",
    "enum",
    "cpp/enum",
    true,
  );
  public static readonly HEADER: CppType = new CppType(
    "Header",
    "header",
    "cpp/header",
    true,
  );
  public static readonly SOURCE: CppType = new CppType(
    "Source",
    "source",
    "cpp/source",
    false,
  );
  public static readonly CHEADER: CppType = new CppType(
    "C Header",
    "header",
    "c/header",
    true,
  );
  public static readonly CSOURCE: CppType = new CppType(
    "C Source",
    "source",
    "c/source",
    false,
  );

  private constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly templatePrefix: string,
    public readonly isHeaderBased: boolean,
  ) {}
}

export async function newCppFileWithSpecificType(
  cppType: CppType,
  uri?: Uri,
): Promise<void> {
  const folderPath = await getFolderFsPath(uri);
  if (!folderPath) {
    return;
  }

  await newCppFile(folderPath, cppType);
}

async function newCppFile(folderPath: string, cppType: CppType) {
  const name: string | undefined = await window.showInputBox({
    placeHolder: l10n.t("new.inputName", cppType.label.toLowerCase()),
    ignoreFocusOut: true,
    validateInput: async (value: string): Promise<string> => {
      const checkMessage = checkCppQualifiedName(value);
      if (checkMessage) {
        return checkMessage;
      }

      if (await checkFileExists(folderPath, value, cppType)) {
        return l10n.t("new.exists", cppType.label);
      }

      return "";
    },
  });

  if (!name) {
    return;
  }

  await newCppFileWithContents(folderPath, name, cppType);
}

async function newCppFileWithContents(
  folderPath: string,
  name: string,
  type: CppType,
) {
  // Retrieve extension path dynamically
  const extension = extensions.getExtension("wtc.cpp-project-template");
  if (!extension) {
    window.showErrorMessage(l10n.t("new.extNotFound"));
    return;
  }
  const templatesDir = path.join(extension.extensionPath, "templates", "files");

  const view = {
    name: name,
    headerGuard: `${name.toUpperCase()}_H`,
  };

  const filesToGenerate = getFilesToGenerate(type, name);
  let createdFile = "";

  for (const file of filesToGenerate) {
    const templatePath = path.join(templatesDir, file.template);
    const destPath = path.join(folderPath, file.output);

    try {
      const templateContent = await fse.readFile(templatePath, "utf8");
      const rendered = mustache.render(templateContent, view);
      await fse.writeFile(destPath, rendered);
      if (!createdFile) {
        createdFile = destPath;
      }
    } catch (err) {
      window.showErrorMessage(
        l10n.t("new.createError", file.output, String(err)),
      );
    }
  }

  if (createdFile) {
    const doc = await workspace.openTextDocument(createdFile);
    await window.showTextDocument(doc);
  }
}

async function getFolderFsPath(uri?: Uri): Promise<string | undefined> {
  if (uri) {
    const stat = await fse.stat(uri.fsPath);
    return stat.isDirectory() ? uri.fsPath : path.dirname(uri.fsPath);
  } else {
    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return workspaceFolders[0].uri.fsPath;
    }
  }
  window.showErrorMessage(l10n.t("new.noWorkspace"));
  return undefined;
}

async function checkFileExists(
  folderPath: string,
  name: string,
  type: CppType,
): Promise<boolean> {
  const files = getFilesToGenerate(type, name);
  for (const file of files) {
    if (await fse.pathExists(path.join(folderPath, file.output))) {
      return true;
    }
  }
  return false;
}

function getFilesToGenerate(
  type: CppType,
  name: string,
): { template: string; output: string }[] {
  const files: { template: string; output: string }[] = [];
  if (type === CppType.CLASS) {
    files.push({ template: `${type.templatePrefix}.h`, output: `${name}.h` });
    files.push({
      template: `${type.templatePrefix}.cpp`,
      output: `${name}.cpp`,
    });
  } else if (
    type === CppType.INTERFACE ||
    type === CppType.ENUM ||
    type === CppType.HEADER
  ) {
    files.push({ template: `${type.templatePrefix}.h`, output: `${name}.h` });
  } else if (type === CppType.SOURCE) {
    files.push({
      template: `${type.templatePrefix}.cpp`,
      output: `${name}.cpp`,
    });
  } else if (type === CppType.CHEADER) {
    files.push({ template: `${type.templatePrefix}.h`, output: `${name}.h` });
  } else if (type === CppType.CSOURCE) {
    files.push({ template: `${type.templatePrefix}.c`, output: `${name}.c` });
  }
  return files;
}
