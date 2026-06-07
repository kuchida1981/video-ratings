import { User } from "lucide-react";
import type { Performer } from "@/types";

interface PerformerTileProps {
  performer: Performer;
  onClick: () => void;
}

export function PerformerTile({ performer, onClick }: PerformerTileProps) {
  return (
    <div
      onClick={onClick}
      className="rounded-lg border bg-card hover:bg-accent/30 cursor-pointer transition-colors overflow-hidden flex flex-col"
    >
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {performer.cover_image_url ? (
          <img
            src={performer.cover_image_url}
            alt={performer.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={32} className="text-muted-foreground/40" />
        )}
      </div>
      <div className="p-2 flex flex-col gap-0.5 min-w-0">
        <p className="font-medium text-sm leading-snug truncate" title={performer.name}>
          {performer.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{performer.work_count}作品</span>
          <span className="text-xs font-mono text-primary">{performer.total_score}</span>
        </div>
      </div>
    </div>
  );
}
