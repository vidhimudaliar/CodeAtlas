"use client "

import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { readFile } from "node:fs/promises";

let privateKeyCache: string | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  return value !== undefined ? value : (defaultValue ?? "");
}

async function loadPrivateKey(): Promise<string> {
  if (privateKeyCache) {
    return privateKeyCache;
  }

  const keyPath = requireEnv("GH_PRIVATE_KEY_PATH");
  const key = await readFile(keyPath, "utf-8");
  privateKeyCache = key;
  return key;
}

export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const appId = parseInt(requireEnv("GH_APP_ID"), 10);
  const privateKey = await loadPrivateKey();
  const baseUrl = getEnv("GITHUB_API_BASE_URL", "https://api.github.com");

  const auth = createAppAuth({
    appId,
    privateKey,
  });

  const { token } = await auth({ type: "installation", installationId });

  return new Octokit({ auth: token, baseUrl });
}
