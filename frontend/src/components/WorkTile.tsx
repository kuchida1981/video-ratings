import { Film, Files } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { WorkListItem } from "@/types";

interface WorkTileProps {
  work: WorkListItem;
  onClick?: () => void;
  variant?: "compact" | "default";
}

export function WorkTile({ work, onClick, variant = "compact" }: WorkTileProps) {
  const performers = work.performers.map((p) => p.name).join(", ") || "—";
  const meta = [work.maker, work.series].filter(Boolean).join(" / ");

  return (
    <Link
      to={`/works/${work.id}`}
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
        {variant === "default" && (
          <p className="text-xs text-muted-foreground truncate min-h-[1rem]">{meta}</p>
        )}
        {variant === "default" && (
          <div className="flex gap-1 overflow-hidden mt-0.5 min-h-[1.25rem]">
            {work.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px] px-1 py-0 whitespace-nowrap shrink-0">
                {tag.name}{tag.score != null ? ` +${tag.score}` : ""}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-0.5">
          {work.file_count > 0 ? (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Files size={11} />
              {work.file_count}
            </span>
          ) : (
            <span />
          )}
          <p className="text-xs font-mono text-primary">{work.total_score}</p>
        </div>
      </div>
    </Link>
  );
}
