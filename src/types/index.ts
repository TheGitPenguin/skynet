/**
 * Base types for the application
 */

export interface CommandOptions {
  name: string;
  description: string;
  execute: () => Promise<void>;
}

export interface ModuleOptions {
  name: string;
  init: () => Promise<void>;
}
