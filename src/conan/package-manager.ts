import { InitOptions, IPackageManager } from "../pkgmgr/interface";
import * as fse from "fs-extra";
import * as path from "path";
import { l10n } from "vscode";
import { execute } from "./core/setup";

export class ConanPackageManager implements IPackageManager {
    name = "conan";

    async init(options: InitOptions): Promise<void> {
        options.progress.report({ message: l10n.t("conan.init") });
        
        // Generate conanfile.txt
        const conanfileContent = [
            "[requires]",
            ...options.dependencies,
            "",
            "[generators]",
            "CMakeDeps",
            "CMakeToolchain"
        ].join("\n");

        const conanfilePath = path.join(options.targetDir, "conanfile.txt");
        await fse.writeFile(conanfilePath, conanfileContent, "utf-8");
    }

    async install(projectDir: string): Promise<void> {
        // Run conan install . --build=missing
        await execute("conan install . --build=missing", projectDir);
    }

    async add(projectDir: string, packageName: string): Promise<void> {
        // Parsing and editing conanfile.txt is harder than JSON.
        // For now, simple append if [requires] exists, or use conan command if available.
        // But since we are focusing on Init for now, I'll leave this simple or throw not implemented.
        // Or better, read, append, write.
        
        const conanfilePath = path.join(projectDir, "conanfile.txt");
        if (await fse.pathExists(conanfilePath)) {
            let content = await fse.readFile(conanfilePath, "utf-8");
            if (content.includes("[requires]")) {
                content = content.replace("[requires]", `[requires]\n${packageName}`);
                await fse.writeFile(conanfilePath, content, "utf-8");
            }
        }
    }
}
