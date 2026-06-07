import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "@/api/client";
import type { Performer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PerformerTile } from "@/components/PerformerTile";
import { useTileMaxColumns } from "@/hooks/useTileMaxColumns";
import { useTileGridStyle } from "@/hooks/useTileGridStyle";

export default function PerformersPage() {
  const navigate = useNavigate();
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [furigana, setFurigana] = useState("");

  const { maxCols } = useTileMaxColumns();
  const gridStyle = useTileGridStyle(maxCols);

  useEffect(() => {
    api.performers.list().then(setPerformers);
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    const p = await api.performers.create({ name, furigana: furigana || undefined });
    setOpen(false);
    setName("");
    setFurigana("");
    navigate(`/performers/${p.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">出演者一覧</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus size={16} />新規登録</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>出演者を登録</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>名前 *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" /></div>
              <div><Label>ふりがな</Label><Input value={furigana} onChange={(e) => setFurigana(e.target.value)} placeholder="ふりがな" /></div>
              <Button onClick={create} disabled={!name.trim()} className="w-full">登録する</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {performers.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">出演者が登録されていません</p>
      ) : (
        <div className="grid gap-3" style={gridStyle}>
          {performers.map((p) => (
            <PerformerTile key={p.id} performer={p} onClick={() => navigate(`/performers/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
