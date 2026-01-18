import { ExtensionContext } from "vscode";
import { ProjectController } from "./controllers/project-controller";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(new ProjectController(context));
}

export function deactivate() {}