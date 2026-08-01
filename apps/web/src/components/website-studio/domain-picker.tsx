"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkSubdomainAvailability,
  claimSubdomain,
  connectCustomDomain,
  fetchDomainStatus,
  type DomainInstructions,
} from "@/lib/domains";

const ROOT_DOMAIN = "forgestackx.com";

type DomainPickerProps = {
  apiToken: string;
  projectId: string;
  domainType: string | null;
  domain: string | null;
  domainStatus: string | null;
  domainError: string | null;
  onChange: (next: {
    domainType: string | null;
    domain: string | null;
    domainStatus: string | null;
    domainError: string | null;
  }) => void;
};

export function DomainPicker({
  apiToken,
  projectId,
  domainType,
  domain,
  domainStatus,
  domainError,
  onChange,
}: DomainPickerProps) {
  const [mode, setMode] = useState<"subdomain" | "custom">(
    domainType === "custom" ? "custom" : "subdomain"
  );
  const [subdomainInput, setSubdomainInput] = useState(
    domainType === "subdomain" && domain ? domain.replace(`.${ROOT_DOMAIN}`, "") : ""
  );
  const [availability, setAvailability] = useState<{ available: boolean; reason?: string } | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  const [customDomainInput, setCustomDomainInput] = useState("");
  const [instructions, setInstructions] = useState<DomainInstructions | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const autoCheckedRef = useRef(false);

  const onCheckStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    setCustomError(null);
    try {
      const result = await fetchDomainStatus(apiToken, projectId);
      onChange({
        domainType: "custom",
        domain: result.domain,
        domainStatus: result.domainStatus,
        domainError: result.domainError ?? null,
      });
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : "Failed to check status.");
    } finally {
      setIsCheckingStatus(false);
    }
  }, [apiToken, projectId, onChange]);

  const onSubdomainInputChange = (value: string) => {
    setSubdomainInput(value);
    setAvailability(null);
  };

  useEffect(() => {
    if (mode !== "subdomain") {
      return;
    }
    const value = subdomainInput.trim().toLowerCase();
    if (value.length < 3) {
      return;
    }
    const timer = window.setTimeout(() => {
      setIsCheckingAvailability(true);
      checkSubdomainAvailability(apiToken, projectId, value)
        .then(setAvailability)
        .catch(() => setAvailability(null))
        .finally(() => setIsCheckingAvailability(false));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [subdomainInput, mode, apiToken, projectId]);

  useEffect(() => {
    if (autoCheckedRef.current) {
      return;
    }
    if (domainType === "custom" && domainStatus === "pending") {
      autoCheckedRef.current = true;
      const timer = window.setTimeout(() => {
        void onCheckStatus();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [domainType, domainStatus, onCheckStatus]);

  const onClaimSubdomain = async () => {
    const value = subdomainInput.trim().toLowerCase();
    if (!value) {
      return;
    }
    setIsClaiming(true);
    setSubdomainError(null);
    try {
      const result = await claimSubdomain(apiToken, projectId, value);
      onChange({
        domainType: result.domainType ?? "subdomain",
        domain: result.domain ?? null,
        domainStatus: result.domainStatus ?? "active",
        domainError: result.domainError ?? null,
      });
    } catch (error) {
      setSubdomainError(error instanceof Error ? error.message : "Failed to claim subdomain.");
    } finally {
      setIsClaiming(false);
    }
  };

  const onConnectCustomDomain = async () => {
    const value = customDomainInput.trim().toLowerCase();
    if (!value) {
      return;
    }
    setIsConnecting(true);
    setCustomError(null);
    setUpgradeRequired(false);
    try {
      const result = await connectCustomDomain(apiToken, projectId, value);
      setInstructions(result.instructions);
      onChange({
        domainType: result.domainType ?? "custom",
        domain: result.domain ?? null,
        domainStatus: result.domainStatus ?? "pending",
        domainError: result.domainError ?? null,
      });
    } catch (error) {
      const err = error as Error & { code?: string };
      if (err.code === "upgrade_required") {
        setUpgradeRequired(true);
      } else {
        setCustomError(err.message ?? "Failed to connect domain.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const onCopy = (field: string, value?: string) => {
    if (!value || typeof navigator === "undefined") {
      return;
    }
    void navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1500);
    });
  };

  if (domainStatus === "active" && domain) {
    return (
      <div className="rounded-lg border border-zinc-200 p-3 text-xs dark:border-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">
          Your site is live at{" "}
          <a
            className="font-medium text-emerald-600 underline dark:text-emerald-400"
            href={`https://${domain}`}
            target="_blank"
            rel="noreferrer"
          >
            {domain}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => onChange({ domainType, domain: null, domainStatus: null, domainError: null })}
          className="mt-2 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
        >
          Change domain
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-3 text-xs dark:border-zinc-800">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("subdomain")}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            mode === "subdomain"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          }`}
        >
          Free subdomain
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            mode === "custom"
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          }`}
        >
          Connect domain
        </button>
      </div>

      {mode === "subdomain" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={subdomainInput}
              onChange={(event) => onSubdomainInputChange(event.target.value)}
              placeholder="mycompany"
              className="w-40 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
            <span className="text-zinc-500 dark:text-zinc-400">.{ROOT_DOMAIN}</span>
          </div>
          {isCheckingAvailability ? (
            <p className="text-zinc-500 dark:text-zinc-400">Checking availability...</p>
          ) : availability ? (
            <p className={availability.available ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
              {availability.available ? "Available" : "Not available"}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void onClaimSubdomain()}
            disabled={isClaiming || !availability?.available}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
          >
            {isClaiming ? "Claiming..." : "Claim"}
          </button>
          {subdomainError ? <p className="text-red-600 dark:text-red-400">{subdomainError}</p> : null}
        </div>
      ) : (
        <div className="space-y-2">
          {upgradeRequired ? (
            <p className="text-amber-600 dark:text-amber-400">
              Connecting a custom domain requires a paid plan.{" "}
              <a href="/pricing" className="underline">
                Upgrade
              </a>
              .
            </p>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(event) => setCustomDomainInput(event.target.value)}
                  placeholder="www.mycompany.com"
                  className="w-48 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => void onConnectCustomDomain()}
                  disabled={isConnecting || !customDomainInput.trim()}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </button>
              </div>
              {customError ? <p className="text-red-600 dark:text-red-400">{customError}</p> : null}
            </>
          )}

          {domainType === "custom" && domain ? (
            <div className="space-y-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">
                Add this DNS record for <span className="font-medium">{domain}</span>:
              </p>
              {instructions ? (
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">{instructions.recordType}</span>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">{instructions.host}</span>
                  {(Array.isArray(instructions.value) ? instructions.value : instructions.value ? [instructions.value] : []).map(
                    (value, index) => (
                      <button
                        key={`${value}-${index}`}
                        type="button"
                        onClick={() => onCopy(`value-${index}`, value)}
                        className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800"
                      >
                        {copiedField === `value-${index}` ? "Copied!" : value}
                      </button>
                    )
                  )}
                </div>
              ) : null}
              <p className={domainStatus === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"}>
                Status: {domainStatus ?? "pending"}
              </p>
              {domainError ? <p className="text-amber-600 dark:text-amber-400">{domainError}</p> : null}
              <button
                type="button"
                onClick={() => void onCheckStatus()}
                disabled={isCheckingStatus}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
              >
                {isCheckingStatus ? "Checking..." : "Check status"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
