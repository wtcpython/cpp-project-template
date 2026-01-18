import { Wrapper, ensureRoot } from "./core/wrapper";
import { addPackage } from "./operations/add";
import { installPackage } from "./operations/install";
import { upgradePackage } from "./operations/upgrade";
import { searchPackage, searchAndSelectPackage } from "./operations/search";
import { integratePackage } from "./operations/integrate";
import {
  Package,
  AddPackageOptions,
  InstallPackageOptions,
  UpgradePackageOptions,
  SearchPackageOptions,
  IntegratePackageOptions,
} from "./type";

class PackageManager {
  private wrapper: Wrapper | null = null;

  private async ensureWrapper(): Promise<Wrapper> {
    if (!this.wrapper) {
      const root = await ensureRoot();
      if (!root) {
        throw new Error("vcpkg not found");
      }
      this.wrapper = new Wrapper(root);
    }
    return this.wrapper;
  }

  async add(options: AddPackageOptions): Promise<void> {
    const wrapper = await this.ensureWrapper();
    return addPackage(wrapper, options);
  }

  async install(options: InstallPackageOptions): Promise<void> {
    const wrapper = await this.ensureWrapper();
    return installPackage(wrapper, options);
  }

  async upgrade(options: UpgradePackageOptions): Promise<void> {
    const wrapper = await this.ensureWrapper();
    return upgradePackage(wrapper, options);
  }

  async search(options: SearchPackageOptions): Promise<Package[]> {
    const wrapper = await this.ensureWrapper();
    return searchPackage(wrapper, options);
  }

  async searchAndSelect(
    options: SearchPackageOptions,
  ): Promise<Package | undefined> {
    const wrapper = await this.ensureWrapper();
    return searchAndSelectPackage(wrapper, options);
  }

  async integrate(options: IntegratePackageOptions): Promise<void> {
    const wrapper = await this.ensureWrapper();
    return integratePackage(wrapper, options);
  }
}

const packageManager = new PackageManager();

export const add = (options: AddPackageOptions) => packageManager.add(options);
export const install = (options: InstallPackageOptions) =>
  packageManager.install(options);
export const upgrade = (options: UpgradePackageOptions) =>
  packageManager.upgrade(options);
export const search = (options: SearchPackageOptions) =>
  packageManager.search(options);
export const searchAndSelect = (options: SearchPackageOptions) =>
  packageManager.searchAndSelect(options);
export const integrate = (options: IntegratePackageOptions) =>
  packageManager.integrate(options);

export { Wrapper };
export type { Package };
export type {
  AddPackageOptions,
  InstallPackageOptions,
  UpgradePackageOptions,
  SearchPackageOptions,
  IntegratePackageOptions,
};
