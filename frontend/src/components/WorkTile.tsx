import { Film } from "lucide-react";
import type { WorkListItem } from "@/types";

interface WorkTileProps {
  work: WorkListItem;
  onClick: () => void;
}

export function WorkTile({ work, onClick }: WorkTileProps) {
  const performers = work.performers.map((p) => p.name).join(", ") || "—";

  return (
    <div
      onClick={onClick}
      className="rounded-lg border bg-card hover:bg-accent/30 cursor-pointer transition-colors overflow-hidden flex flex-col"
    >
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {work.cover_image_url ? (
          <img
            src={work.cover_image_url}
            alt={work.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Film size={32} className="text-muted-foreground/40" />
        )}
      </div>
      <div className="p-2 flex flex-col gap-0.5 min-w-0">
        <p className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]" title={work.title}>
          {work.title}
        </p>
        <p className="text-xs text-muted-foreground truncate" title={performers}>
          {performers}
        </p>
        <p className="text-xs font-mono text-primary text-right mt-0.5">
          {work.total_score}
        </p>
      </div>
    </div>
  );
}
