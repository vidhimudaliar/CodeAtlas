"use client "

import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { readFile } from "node:fs/promises";
import { getEnv, requireEnv } from "@/lib/env";

let privateKeyCache: string | undefined;

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

const STATE_STORAGE_KEY = "codeatlas-gh-app-state";

export function connectGitHub(options: { redirect?: boolean } = {}): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const appSlug = process.env.NEXT_PUBLIC_GH_APP_SLUG;
  if (!appSlug) {
    console.warn("connectGitHub called without NEXT_PUBLIC_GH_APP_SLUG configured");
    return null;
  }

  let state = window.sessionStorage.getItem(STATE_STORAGE_KEY);
  if (!state) {
    state = window.crypto.randomUUID();
    window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
  }

  const target = new URL(`https://github.com/apps/${appSlug}/installations/new`);
  target.searchParams.set("state", state);
  const url = target.toString();

  if (options.redirect !== false) {
    window.location.href = url;
  }

  return url;
}