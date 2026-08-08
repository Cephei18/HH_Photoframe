"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHAIN_STAMPS, type ChainStampId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChainStampIcon } from "./ChainStampIcon";

type IdentityFormProps = {
  onSubmit: (values: { name: string; stack: string; chainStamp: ChainStampId }) => void;
  submitting?: boolean;
};

/**
 * The only form in the product — two fields plus a stamp-flavor picker, on
 * the same screen as the photo, per the approved mobile-first flow. Stack
 * is optional; the chain stamp defaults to Ethereum so a one-tap Generate
 * still works for anyone in a hurry — it's a fun customization, not a
 * gate.
 */
export function IdentityForm({ onSubmit, submitting }: IdentityFormProps) {
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [chainStamp, setChainStamp] = useState<ChainStampId>("ethereum");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), stack: stack.trim(), chainStamp });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="builder-name"
          className="text-ink-soft font-mono text-xs tracking-wide uppercase"
        >
          Name
        </Label>
        <Input
          id="builder-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kay"
          maxLength={40}
          required
          autoComplete="name"
          className="h-11 font-mono"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="builder-stack"
          className="text-ink-soft font-mono text-xs tracking-wide uppercase"
        >
          Stack <span className="text-ink-faint">(optional)</span>
        </Label>
        <Input
          id="builder-stack"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
          placeholder="React, Solidity"
          maxLength={60}
          className="h-11 font-mono"
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-ink-soft font-mono text-xs tracking-wide uppercase">
          Visa stamp
        </legend>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Visa stamp flavor">
          {CHAIN_STAMPS.map((stampOption) => {
            const selected = chainStamp === stampOption.id;
            return (
              <button
                key={stampOption.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setChainStamp(stampOption.id)}
                className={cn(
                  "flex flex-col items-center gap-1 border py-2.5 font-mono text-[10px] uppercase transition-colors",
                  selected
                    ? "border-ink bg-gold text-ink"
                    : "border-line-strong bg-paper-raised text-ink-soft hover:border-ink",
                )}
              >
                <ChainStampIcon id={stampOption.id} size={18} />
                {stampOption.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Button
        type="submit"
        size="lg"
        disabled={!name.trim() || submitting}
        className="h-12 font-mono text-sm tracking-wide uppercase"
      >
        {submitting ? "Authorizing…" : "Generate My Pass"}
      </Button>
    </form>
  );
}
