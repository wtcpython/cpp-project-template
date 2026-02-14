import * as cp from "child_process";
import * as Logger from "../../logger";

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
