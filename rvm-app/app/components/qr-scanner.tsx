"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Keyboard, LoaderCircle, ScanLine } from "lucide-react";
import QrScannerEngine from "qr-scanner";

import { extractVoucherCode } from "@/lib/voucher-code";

function openClaimPage(code: string) {
  const url = new URL(window.location.origin);
  url.searchParams.set("couponcode", code);
  window.location.assign(url.toString());
}

export function QrScanner({ message }: { message?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualValue, setManualValue] = useState("");
  const [scannerError, setScannerError] = useState("");
  const [scanMessage, setScanMessage] = useState("Looking for a Cashcrow QR…");
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let scanner: QrScannerEngine | null = null;

    async function startScanner() {
      if (!window.isSecureContext) {
        setScannerError(
          "Camera scanning requires HTTPS. Reopen this page securely, or enter the printed DRSV code below.",
        );
        setIsStarting(false);
        return;
      }

      try {
        if (!videoRef.current || !(await QrScannerEngine.hasCamera())) {
          throw new Error("No camera available");
        }

        scanner = new QrScannerEngine(
          videoRef.current,
          (result) => {
            const code = extractVoucherCode(result.data);

            if (!code) {
              setScanMessage("That is not a Cashcrow voucher QR. Try another code.");
              return;
            }

            scanner?.stop();
            openClaimPage(code);
          },
          {
            preferredCamera: "environment",
            maxScansPerSecond: 10,
            returnDetailedScanResult: true,
          },
        );

        await scanner.start();

        if (cancelled) {
          scanner.destroy();
          return;
        }
        setIsStarting(false);
      } catch (reason) {
        if (!cancelled) {
          const permissionDenied = reason instanceof DOMException
            && reason.name === "NotAllowedError";
          setScannerError(
            permissionDenied
              ? "Camera permission was denied. Allow camera access, then reload, or enter the printed code below."
              : "No camera was available. Enter the printed DRSV code below.",
          );
          setIsStarting(false);
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      scanner?.destroy();
    };
  }, []);

  function submitManualCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = extractVoucherCode(manualValue);

    if (!code) {
      setScannerError("Enter a valid DRSV voucher code or Cashcrow claim URL.");
      return;
    }

    openClaimPage(code);
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f8fbf6] px-4 py-6 font-sans text-[#0f2e24] sm:px-6">
      <div aria-hidden="true" className="absolute -left-14 top-28 h-44 w-20 -rotate-45 rounded-full bg-[#bdf354]/35" />
      <div aria-hidden="true" className="absolute -right-12 top-[38%] h-48 w-20 rotate-35 rounded-full bg-[#d8c7ff]/35" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex justify-center py-2">
          <Image
            src="/assets/Cashcrow_logo1.png"
            alt="Cashcrow"
            width={100}
            height={100}
            priority
            className="h-auto w-38 sm:w-42"
          />
        </header>

        <section className="mt-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007a52]">
            Find your reward
          </p>
          <h1 className="mt-2 text-[clamp(2rem,9vw,2.8rem)] font-black leading-tight tracking-tight">
            Scan your voucher QR
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-[#527063]">
            Point your camera at the QR code printed on your Cashcrow voucher.
          </p>
        </section>

        {message && (
          <p role="alert" className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">
            {message}
          </p>
        )}

        <section aria-label="QR code scanner" className="relative mt-5 aspect-square w-full overflow-hidden rounded-[2rem] border-2 border-[#003f2b] bg-[#082e21] shadow-[0_6px_0_0_#063324]">
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="Camera preview"
            className="h-full w-full object-cover"
          />

          <div aria-hidden="true" className="pointer-events-none absolute inset-[13%] rounded-3xl border-2 border-[#bdf354] shadow-[0_0_0_999px_rgba(2,44,34,0.38)]">
            <span className="absolute -left-0.5 -top-0.5 h-10 w-10 rounded-tl-3xl border-l-4 border-t-4 border-[#bdf354]" />
            <span className="absolute -right-0.5 -top-0.5 h-10 w-10 rounded-tr-3xl border-r-4 border-t-4 border-[#bdf354]" />
            <span className="absolute -bottom-0.5 -left-0.5 h-10 w-10 rounded-bl-3xl border-b-4 border-l-4 border-[#bdf354]" />
            <span className="absolute -bottom-0.5 -right-0.5 h-10 w-10 rounded-br-3xl border-b-4 border-r-4 border-[#bdf354]" />
            <span className="absolute left-4 right-4 top-1/2 h-0.5 bg-[#bdf354] shadow-[0_0_12px_#bdf354]" />
          </div>

          {isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#082e21] text-white">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#bdf354]" aria-hidden="true" />
              <span className="text-sm font-bold">Starting camera…</span>
            </div>
          )}

          {scannerError && !isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#082e21] px-8 text-center text-white">
              <Camera className="h-10 w-10 text-[#bdf354]" aria-hidden="true" />
              <p className="text-sm font-semibold leading-relaxed">{scannerError}</p>
            </div>
          )}

          {!scannerError && !isStarting && (
            <div className="absolute inset-x-0 bottom-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#082e21]/85 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                <ScanLine className="h-4 w-4 text-[#bdf354]" aria-hidden="true" />
                {scanMessage}
              </span>
            </div>
          )}
        </section>

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#789087]">
          <span className="h-px flex-1 bg-[#d9e4dd]" />
          or enter the printed code
          <span className="h-px flex-1 bg-[#d9e4dd]" />
        </div>

        <form onSubmit={submitManualCode} className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <label htmlFor="manual-voucher" className="text-sm font-extrabold">
            Voucher code or claim URL
          </label>
          <div className="relative mt-2">
            <Keyboard className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#527063]" aria-hidden="true" />
            <input
              id="manual-voucher"
              value={manualValue}
              onChange={(event) => setManualValue(event.target.value)}
              placeholder="DRSV.…"
              autoCapitalize="characters"
              autoComplete="off"
              className="w-full rounded-xl border border-gray-200 bg-[#f8faf6] py-3.5 pl-12 pr-4 font-semibold uppercase tracking-wide outline-none focus:border-[#007a52] focus:ring-1 focus:ring-[#007a52]"
              required
            />
          </div>
          <button type="submit" className="mt-4 min-h-12 w-full rounded-2xl border-2 border-[#003f2b] bg-[#007a52] px-4 py-3 font-black text-white shadow-[0_4px_0_0_#063324] active:translate-y-1 active:shadow-none">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
