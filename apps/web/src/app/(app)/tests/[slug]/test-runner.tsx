"use client";

import type { Answers, PublicQuestion, PublicTest } from "@psikotest/core";
import { LIKERT_OPTIONS } from "@psikotest/core/likert";
import { Check, ChevronLeft, ChevronRight, CloudOff, LoaderCircle, Send, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveAnswersAction, submitTestAction } from "@/actions/attempts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";
type Option = { value: string; label: string };

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function optionsOf(q: PublicQuestion): Option[] {
  return q.type === "likert" ? [...LIKERT_OPTIONS] : q.options.map((o) => ({ value: o.id, label: o.label }));
}

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TestRunner({
  attemptId,
  test,
  initialAnswers,
  deadline,
  serverNow,
}: {
  attemptId: string;
  test: PublicTest;
  initialAnswers: Answers;
  deadline: number;
  serverNow: number;
}) {
  const questions = test.questions;
  const total = questions.length;

  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [index, setIndex] = useState(() => {
    const firstEmpty = questions.findIndex((q) => !initialAnswers[q.id]);
    return firstEmpty === -1 ? 0 : firstEmpty;
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  // Selisih jam server vs browser, supaya timer tetap akurat walau jam perangkat salah.
  const clockOffset = useRef(serverNow - Date.now());
  const [remaining, setRemaining] = useState(deadline - serverNow);

  const answersRef = useRef(answers);
  const version = useRef(0);
  const savedVersion = useRef(0);
  const submitted = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  /* ----------------------------- Timer ----------------------------- */
  useEffect(() => {
    const tick = () => setRemaining(deadline - (Date.now() + clockOffset.current));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  /* ----------------------------- Submit ----------------------------- */
  /** `timedOut` = dikumpulkan otomatis karena waktu habis (bukan klik peserta). */
  const submit = useCallback(
    (timedOut?: unknown) => {
      if (submitted.current) return;
      submitted.current = true;
      setConfirmOpen(false);
      startSubmit(async () => {
        try {
          // Jika berhasil, server melakukan redirect ke dashboard.
          const res = await submitTestAction(attemptId, answersRef.current, timedOut === true);
          if (res && !res.ok) {
            setError(res.error);
            submitted.current = false;
          }
        } catch {
          setError("Gagal mengumpulkan jawaban. Periksa koneksi internet lalu coba lagi.");
          submitted.current = false;
        }
      });
    },
    [attemptId],
  );

  const timeUp = remaining <= 0;
  useEffect(() => {
    if (timeUp) submit(true);
  }, [timeUp, submit]);

  /* ----------------------------- Autosave ----------------------------- */
  const save = useCallback(async () => {
    if (submitted.current || version.current === savedVersion.current) return;
    const v = version.current;
    setSaveState("saving");
    try {
      const res = await saveAnswersAction(attemptId, answersRef.current);
      if (res.ok) {
        savedVersion.current = Math.max(savedVersion.current, v);
        setSaveState("saved");
      } else if (res.reason === "closed") {
        submit(true);
      } else {
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    }
  }, [attemptId, submit]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `answers` sengaja menjadi pemicu debounce autosave.
  useEffect(() => {
    if (version.current === savedVersion.current) return;
    const id = setTimeout(save, 800);
    return () => clearTimeout(id);
  }, [answers, save]);

  // Simpan segera saat tab disembunyikan; peringatkan jika menutup halaman dengan perubahan belum tersimpan.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void save();
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitted.current && version.current !== savedVersion.current) e.preventDefault();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [save]);

  /* ----------------------------- Navigasi & jawaban ----------------------------- */
  const question = questions[index];
  const options = useMemo(() => (question ? optionsOf(question) : []), [question]);
  const autoAdvance = question?.type === "likert" || (question?.type === "choice" && !!question.compare);
  const answeredCount = questions.reduce((n, q) => n + (answers[q.id] ? 1 : 0), 0);

  const goTo = useCallback(
    (i: number) => {
      clearTimeout(advanceTimer.current);
      setIndex(Math.max(0, Math.min(total - 1, i)));
    },
    [total],
  );

  const choose = useCallback(
    (value: string) => {
      if (!question || submitted.current) return;
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      version.current++;
      if (autoAdvance && index < total - 1) {
        clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => setIndex(index + 1), 200);
      }
    },
    [question, autoAdvance, index, total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirmOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLInputElement | null;
      // Abaikan saat mengetik di input teks; radio jawaban tetap mendukung pintasan.
      if (el?.tagName === "TEXTAREA" || (el?.tagName === "INPUT" && el.type !== "radio")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        // Panah dipakai untuk pindah soal (bukan mengganti pilihan radio).
        e.preventDefault();
        return goTo(index + (e.key === "ArrowRight" ? 1 : -1));
      }
      const n = Number(e.key);
      const byNumber = Number.isInteger(n) && n >= 1 ? options[n - 1] : undefined;
      const byLetter = /^[a-f]$/i.test(e.key) ? options[LETTERS.indexOf(e.key.toUpperCase())] : undefined;
      const picked = byNumber ?? (question?.type === "choice" ? byLetter : undefined);
      if (picked) {
        e.preventDefault();
        choose(picked.value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, goTo, index, options, question, choose]);

  if (!question) return null;
  const selected = answers[question.id];
  const isLast = index === total - 1;
  const lowTime = remaining < 60_000;
  const midTime = remaining < 5 * 60_000;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Bar status */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/90">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{test.title}</p>
            <div className="mt-1.5 flex items-center gap-3">
              <Progress value={(answeredCount / total) * 100} className="h-1.5" label="Soal terjawab" />
              <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                {answeredCount}/{total}
              </span>
            </div>
          </div>
          <SaveIndicator state={saveState} />
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-lg font-bold tabular-nums",
              lowTime
                ? "animate-pulse bg-rose-100 text-rose-700"
                : midTime
                  ? "bg-amber-100 text-amber-800"
                  : "bg-indigo-50 text-indigo-700",
            )}
            role="timer"
            aria-label="Sisa waktu"
          >
            <Timer className="size-4" aria-hidden />
            {formatClock(remaining)}
          </div>
        </div>
      </div>

      {error ? (
        <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}{" "}
          <button type="button" onClick={() => submit(timeUp)} className="font-semibold underline">
            Coba lagi
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <Card className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-indigo-600">
                Soal {index + 1} <span className="font-normal text-slate-400">dari {total}</span>
              </span>
              {question.type === "choice" && question.section ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {question.section}
                </span>
              ) : null}
            </div>

            <p className="mt-4 text-lg leading-relaxed font-medium text-slate-900 sm:text-xl">{question.prompt}</p>

            {question.type === "choice" && question.compare ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {question.compare.map((text, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: dua kolom tetap
                    key={i}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center font-mono text-lg tracking-wide whitespace-pre text-slate-900"
                  >
                    {text}
                  </div>
                ))}
              </div>
            ) : null}

            <fieldset
              className={cn(
                "mt-6 grid gap-2.5",
                question.type === "likert" && "sm:grid-cols-5",
                question.type === "choice" && question.compare && "grid-cols-2",
              )}
            >
              <legend className="sr-only">Pilihan jawaban soal {index + 1}</legend>
              {options.map((opt, i) => {
                const active = selected === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-indigo-500 has-[input:focus-visible]:ring-offset-2",
                      question.type === "likert" && "sm:flex-col sm:justify-center sm:px-2 sm:py-4 sm:text-center",
                      active
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40",
                    )}
                  >
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={opt.value}
                      checked={active}
                      disabled={isSubmitting}
                      onChange={() => choose(opt.value)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold",
                        active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100",
                      )}
                    >
                      {question.type === "likert" ? opt.value : (LETTERS[i] ?? i + 1)}
                    </span>
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </fieldset>
          </Card>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => goTo(index - 1)} disabled={index === 0}>
              <ChevronLeft className="size-4" aria-hidden /> Sebelumnya
            </Button>
            {isLast ? (
              <Button onClick={() => setConfirmOpen(true)} disabled={isSubmitting}>
                <Send className="size-4" aria-hidden /> Kumpulkan
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => goTo(index + 1)}>
                Berikutnya <ChevronRight className="size-4" aria-hidden />
              </Button>
            )}
          </div>
          <p className="mt-4 hidden text-center text-xs text-slate-400 sm:block">
            Pintasan: tekan {question.type === "likert" ? "1-5" : question.compare ? "1-2" : "A-D atau 1-4"} untuk
            menjawab, ← → untuk berpindah soal.
          </p>
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <Card className="p-4">
            <p className="text-sm font-semibold text-slate-900">Navigasi soal</p>
            <div className="mt-3 grid grid-cols-6 gap-1.5 lg:grid-cols-5">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Soal ${i + 1}${answers[q.id] ? " (terjawab)" : ""}`}
                  aria-current={i === index ? "step" : undefined}
                  className={cn(
                    "aspect-square rounded-lg text-xs font-semibold tabular-nums transition-colors",
                    answers[q.id]
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    i === index && "ring-2 ring-indigo-600 ring-offset-2",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={() => setConfirmOpen(true)} disabled={isSubmitting}>
              <Send className="size-4" aria-hidden /> Kumpulkan Tes
            </Button>
          </Card>
        </aside>
      </div>

      {confirmOpen ? (
        <ConfirmDialog
          unanswered={total - answeredCount}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => submit()}
        />
      ) : null}

      {isSubmitting || (timeUp && !error) ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-medium shadow-xl">
            <LoaderCircle className="size-5 animate-spin text-indigo-600" aria-hidden />
            {timeUp ? "Waktu habis. Mengumpulkan jawaban…" : "Mengumpulkan jawaban…"}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:inline-flex" aria-live="polite">
      {state === "saving" ? (
        <>
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> Menyimpan…
        </>
      ) : state === "saved" ? (
        <>
          <Check className="size-3.5 text-emerald-600" aria-hidden /> Tersimpan
        </>
      ) : (
        <>
          <CloudOff className="size-3.5 text-rose-600" aria-hidden /> Gagal menyimpan
        </>
      )}
    </span>
  );
}

function ConfirmDialog({
  unanswered,
  onCancel,
  onConfirm,
}: {
  unanswered: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-lg font-bold text-slate-900">
          Kumpulkan tes sekarang?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {unanswered > 0 ? (
            <>
              Masih ada <strong className="text-rose-600">{unanswered} soal</strong> yang belum dijawab.{" "}
            </>
          ) : (
            "Semua soal sudah dijawab. "
          )}
          Setelah dikumpulkan, jawaban tidak dapat diubah.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Periksa lagi
          </Button>
          <Button ref={confirmRef} onClick={onConfirm}>
            Ya, kumpulkan
          </Button>
        </div>
      </div>
    </div>
  );
}
