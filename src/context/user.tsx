import { createContextId } from "@builder.io/qwik";

export const UserContext = createContextId<{ id: string; name: string } | null>(
  "user-context"
);