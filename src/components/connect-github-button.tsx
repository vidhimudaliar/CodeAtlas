"use client";

import { useCallback, useEffect, useState } from "react";

const STATE_STORAGE_KEY = "codeatlas-gh-app-state";

function buildInstallUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const appSlug = process.env.NEXT_PUBLIC_GH_APP_SLUG;
  if (!appSlug) {
    return null;
  }

  let state = window.sessionStorage.getItem(STATE_STORAGE_KEY);
  if (!state) {
    state = window.crypto.randomUUID();
    window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
  }

  const target = new URL(`https://github.com/apps/${appSlug}/installations/new`);
  target.searchParams.set("state", state);
  return target.toString();
}

export function connectGitHub(options: { redirect?: boolean } = {}): string | null {
  const url = buildInstallUrl();
  if (!url) {
    return null;
  }

  if (options.redirect !== false && typeof window !== "undefined") {
    window.location.href = url;
  }

  return url;
}

interface ConnectGitHubButtonProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  redirect?: boolean;
  onError?: (message: string) => void;
  onUrlReady?: (url: string | null) => void;
}

export function ConnectGitHubButton({
  children = "Install GitHub App",
  className,
  disabled,
  redirect = true,
  onError,
  onUrlReady,
}: ConnectGitHubButtonProps) {
  const [installUrl, setInstallUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const url = buildInstallUrl();
    setInstallUrl(url);
    onUrlReady?.(url);
  }, [onUrlReady]);

  const handleClick = useCallback(() => {
    if (!installUrl) {
      onError?.("Unable to build GitHub installation URL. Check configuration.");
      return;
    }

    setPending(true);
    try {
      const url = connectGitHub({ redirect });
      if (!redirect) {
        onUrlReady?.(url);
      }
    } finally {
      setPending(false);
    }
  }, [installUrl, onError, onUrlReady, redirect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      disabled={disabled || pending || !installUrl}
    >
      {children}
    </button>
  );
}
