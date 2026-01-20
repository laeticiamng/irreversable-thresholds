import { useState } from 'react';
import { Signal, SignalType, SIGNAL_TYPE_LABELS } from '@/types/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Radio, Eye, Lightbulb, Zap, MapPin, MoreHorizontal, Trash2, Edit2, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SIGNAL_TYPE_ICONS: Record<SignalType, React.ReactNode> = {
  observation: <Eye className="w-4 h-4" />,
  fait: <Radio className="w-4 h-4" />,
  intuition: <Lightbulb className="w-4 h-4" />,
  tension: <Zap className="w-4 h-4" />,
  contexte: <MapPin className="w-4 h-4" />,
};

const SIGNAL_TYPE_COLORS: Record<SignalType, string> = {
  observation: 'border-blue-500/30 text-blue-500 bg-blue-500/10',
  fait: 'border-green-500/30 text-green-500 bg-green-500/10',
  intuition: 'border-purple-500/30 text-purple-500 bg-purple-500/10',
  tension: 'border-red-500/30 text-red-500 bg-red-500/10',
  contexte: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10',
};

interface SignalsListProps {
  signals: Signal[];
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (signal: Signal) => void;
  isLoading?: boolean;
}

export function SignalsList({ signals, onDelete, onEdit, isLoading }: SignalsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getIntensityDisplay = (intensity: number | null) => {
    if (!intensity) return null;
    const bars = Array(5).fill(0).map((_, i) => (
      <div
        key={i}
        className={`w-1 h-3 rounded-full ${i < intensity ? 'bg-amber-500' : 'bg-amber-500/20'}`}
      />
    ));
    return <div className="flex gap-0.5">{bars}</div>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-amber-500/10 bg-card/30 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-amber-500/10 rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-amber-500/10 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-amber-500/20 rounded-lg">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-amber-500/20 flex items-center justify-center">
          <Radio className="w-6 h-6 text-amber-500/40" />
        </div>
        <p className="text-muted-foreground font-body mb-2">
          Aucun signal capturé
        </p>
        <p className="text-xs text-muted-foreground/60">
          Les signaux t'aident à détecter les seuils invisibles.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {signals.map((signal, index) => (
          <Card
            key={signal.id}
            className="border-amber-500/10 bg-card/30 hover:bg-card/50 transition-all animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={SIGNAL_TYPE_COLORS[signal.signal_type]}>
                    {SIGNAL_TYPE_ICONS[signal.signal_type]}
                    <span className="ml-1">{SIGNAL_TYPE_LABELS[signal.signal_type]}</span>
                  </Badge>
                  {signal.intensity && getIntensityDisplay(signal.intensity)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true, locale: fr })}
                  </span>
                  {(onEdit || onDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(signal)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => setDeleteId(signal.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                {signal.content}
              </p>
              {signal.occurred_at && (
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Survenu le {format(new Date(signal.occurred_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-amber-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce signal ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le signal sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
