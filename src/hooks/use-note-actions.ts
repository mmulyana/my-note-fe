import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import type { CoverStyle } from "@/lib/types";

type NoteFlags = {
  pinned?: boolean;
  archived?: boolean;
  secret?: boolean;
  coverStyle?: CoverStyle;
};

export function useNoteActions() {
  const queryClient = useQueryClient();

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
    [queryClient],
  );

  const setFlags = useCallback(
    async (id: string, flags: NoteFlags) => {
      try {
        await request(urls.NoteFlags(id), { method: "PATCH", body: flags });
      } catch (err) {
        console.error("Failed to update note:", err);
      }
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await request(urls.Note(id), { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete note:", err);
      }
      await refresh();
    },
    [refresh],
  );

  return { setFlags, remove };
}
