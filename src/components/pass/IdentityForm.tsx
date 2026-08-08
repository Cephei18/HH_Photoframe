"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type IdentityFormProps = {
  onSubmit: (values: { name: string; stack: string }) => void;
  submitting?: boolean;
};

/**
 * The only form in the product — two fields, on the same screen as the
 * photo, per the approved mobile-first flow. Stack is optional: leaving it
 * blank still produces a complete (generic-flavored) archetype rather than
 * blocking on a field nobody's required to fill in.
 */
export function IdentityForm({ onSubmit, submitting }: IdentityFormProps) {
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), stack: stack.trim() });
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
