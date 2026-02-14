import { InitOptions, IPackageManager } from "../pkgmgr/interface";
import { Wrapper, ensureRoot } from "./core/wrapper";
import { l10n } from "vscode";

export class VcpkgPackageManager implements IPackageManager {
    name = "vcpkg";

    async init(options: InitOptions): Promise<void> {
        const root = await ensureRoot();
        if (!root) {
            throw new Error("vcpkg root not found");
        }
        const wrapper = new Wrapper(root);

        options.progress.report({ message: l10n.t("vcpkg.new") });
        await wrapper.newProject(options.projectName, options.targetDir, true);

        options.progress.report({ message: l10n.t("vcpkg.addDep") });
        for (const dep of options.dependencies) {
            await wrapper.addPort(dep, options.targetDir);
        }
    }

    async install(projectDir: string): Promise<void> {
        const root = await ensureRoot();
        if (!root) {
             throw new Error("vcpkg root not found");
        }
        const wrapper = new Wrapper(root);
        await wrapper.install(projectDir);
    }

    async add(projectDir: string, packageName: string): Promise<void> {
        const root = await ensureRoot();
         if (!root) {
             throw new Error("vcpkg root not found");
        }
        const wrapper = new Wrapper(root);
        await wrapper.addPort(packageName, projectDir);
    }
}
