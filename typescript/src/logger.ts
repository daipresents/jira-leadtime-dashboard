import { Settings } from './settings';

export module Logger {
  export function debug(message: string) {
    if (Settings.DEBUG) {
      console.log(`[debug] ${message}`);
    }
  }

  export function debugObject(name: string, object: any) {
    if (Settings.DEBUG) {
      console.log(`[debug] ${name}`);
      console.log(object);
    }
  }

  export function info(message: string) {
    console.log(`[info] ${message}`);
  }

  export function warn(message: string) {
    console.warn(`[warn] ${message}`);
  }

  export function error(message: string) {
    console.error(`[error] ${message}`);
  }
}
