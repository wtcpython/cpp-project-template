import { IPackageManager } from "./interface";
import { VcpkgPackageManager } from "../vcpkg/package-manager";
import { ConanPackageManager } from "../conan/package-manager";

export class PackageManagerFactory {
    static getManagers(): IPackageManager[] {
        return [
            new VcpkgPackageManager(),
            new ConanPackageManager()
        ];
    }

    static getManager(name: string): IPackageManager | undefined {
        return this.getManagers().find(m => m.name === name);
    }
}
