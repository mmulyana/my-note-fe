import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { DocumentCard } from "@/components/editor/document-card";
import { IconFileText } from "@tabler/icons-react";
import { useApi } from "@/hooks/use-api";
import type { DocItem, IApi, Notes } from "@/lib/types";
import { buildQuery, toDocItem } from "@/lib/utils";
import { urls } from "@/lib/urls";

export default function FolderPage() {
  const { name } = useParams<{ name: string }>();

  const { data: foldersData } = useApi<IApi<{ id: string; name: string }[]>>(
    {
      url: urls.Folder,
      queryKey: ["folders"],
    },
  );

  const folderId = useMemo(() => {
    if (!name) return undefined;
    const match = (foldersData?.data ?? []).find((c) => c.name === name);
    return match?.id;
  }, [name, foldersData]);

  const { data: notesData } = useApi<IApi<Notes[]>>({
    url: buildQuery(urls.Notes, { folderId }),
    queryKey: ["notes", { folderId }],
    enabled: !!folderId,
  });

  const docs: DocItem[] = (notesData?.data ?? []).map(toDocItem);

  return (
    <>
      {docs.length > 0 ? (
        <div className="masonry grid-view">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-22.5 text-center text-(--ink-3)">
          <div className="grid place-items-center w-19.5 h-19.5 rounded-full bg-(--surface-2) border border-(--line) mb-1.5">
            <IconFileText size={30} />
          </div>
          <div className="text-[17px] font-semibold text-(--ink-2)">
            No documents
          </div>
          <div className="text-sm max-w-75">
            Belum ada catatan di folder "{name}".
          </div>
        </div>
      )}
    </>
  );
}
