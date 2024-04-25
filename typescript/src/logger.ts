import { Settings } from "./settings";

export module Logger {

  export function debug(message: string) {
    if (["DEBUG"].includes(Settings.LOG_LEVEL)) {
      console.log(`[debug] ${message}`);
    }
  }

  export function debugObject(name: string, object: any) {
    if (["DEBUG"].includes(Settings.LOG_LEVEL)) {
      console.log(`[debug] ${name}`);
      console.log(object);
    }
  }

  export function info(message: string) {
    if (["DEBUG", "INFO"].includes(Settings.LOG_LEVEL)) {
      console.log(`[info] ${message}`);
    }
  }

  export function warn(message: string) {
    if (["DEBUG", "INFO", "WARN"].includes(Settings.LOG_LEVEL)) {
      console.warn(`[warn] ${message}`);
    }
  }

  export function error(message: string) {
    if (["DEBUG", "INFO", "WARN", "ERROR"].includes(Settings.LOG_LEVEL)) {
      console.error(`[error] ${message}`);
    }
  }
}
