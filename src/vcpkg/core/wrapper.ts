import * as path from "path";
import * as Logger from "../../logger";
import { Package } from "../type";
import { ensureRoot, execute } from "./setup";

export { ensureRoot };

export class Wrapper {
  private readonly executable: string;
  readonly root: string;

  constructor(root?: string) {
    if (root) {
      this.root = root;
    } else {
      this.root = "";
    }
    if (this.root) {
      this.executable =
        process.platform === "win32"
          ? path.join(this.root, "vcpkg.exe")
          : path.join(this.root, "vcpkg");
    } else {
      this.executable = "";
    }
  }

  private async exec(args: string[], cwd: string): Promise<string> {
    const cmd = `"${this.executable}" ${args.join(" ")}`;
    return execute(cmd, cwd);
  }

  async search(keyword: string, cwd: string): Promise<Package[]> {
    try {
      const result = await this.exec(["search", "--x-full-desc", keyword], cwd);

      const lines = result.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('['));

      const packages: Package[] = [];
      for (const line of lines) {
        const parts = line.trim().split(/\s{2,}/).filter(p => p.trim());
        if (parts.length >= 3) {
          packages.push({
            name: parts[0].trim(),
            version: parts[1].trim(),
            description: parts[2].trim()
          });
        }
      }

      return packages;
    } catch (error) {
      Logger.log(`Search error: ${error}`);
      throw error;
    }
  }

  install(cwd: string) {
    return this.exec(["install"], cwd);
  }

  updateBaseline(cwd: string) {
    return this.exec(["x-update-baseline"], cwd);
  }

  addPort(port: string, cwd: string) {
    return this.exec(["add", "port", port], cwd);
  }

  newProject(name: string, cwd: string, application: boolean = true) {
    const args = ["new", "--name", name];
    if (application) {
      args.push("--application");
    }
    return this.exec(args, cwd);
  }

  updateSelf() {
    return this.exec(["update"], this.root);
  }
}
