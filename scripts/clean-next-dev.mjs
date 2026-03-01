import { rm } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const TARGETS = [
  path.join(PROJECT_ROOT, ".next", "dev"),
  path.join(PROJECT_ROOT, ".next", "cache", "turbopack"),
];
const MAX_ATTEMPTS = 5;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  try {
    for (const target of TARGETS) {
      await rm(target, { recursive: true, force: true });
    }
    process.exit(0);
  } catch (error) {
    const lockError = error && (error.code === "EPERM" || error.code === "EBUSY");
    if (!lockError || attempt === MAX_ATTEMPTS) {
      throw new Error(
        `Unable to clean Next.js cache folders. Close any running Next.js process, pause OneDrive sync, and try again.`,
        { cause: error }
      );
    }

    await wait(attempt * 300);
  }
}
