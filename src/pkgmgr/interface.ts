import { Progress, ExtensionContext } from "vscode";

export interface PackageManagerOptions {
    name: string;
    version?: string;
}

export interface InitOptions {
    targetDir: string;
    projectName: string;
    dependencies: string[];
    progress: Progress<{ message?: string }>;
}

export interface IPackageManager {
    name: string;
    init(options: InitOptions): Promise<void>;
    install(projectDir: string): Promise<void>;
    add(projectDir: string, packageName: string): Promise<void>;
}
