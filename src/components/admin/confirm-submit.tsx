"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type ConfirmSubmitProps = Readonly<{ confirmMessage?: string } & ComponentProps<typeof Button>>;

/** Submit button with an optional native confirm() — enough for destructive admin actions. */
export function ConfirmSubmit({ confirmMessage, children, ...props }: ConfirmSubmitProps): ReactNode {
  const { pending } = useFormStatus();

  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
  };

  return (
    <Button type="submit" disabled={pending} onClick={onClick} {...props}>
      {children}
    </Button>
  );
}
