import { useState, useMemo } from 'react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Clock, Search, Zap, Edit, Trash2 } from 'lucide-react';

interface ThreshEntry {
  id: string;
  title: string;
  description: string;
  tags: string[];
  intensity: number;
  context?: string;
  sensed_at: string | null;
  created_at: string;
  case_id?: string | null;
}

interface ThreshTimelineProps {
  entries: ThreshEntry[];
  isSubscribed: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

type PeriodFilter = '7' | '30' | '90' | 'all';

export function ThreshTimeline({ entries, isSubscribed, onEdit, onDelete }: ThreshTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [intensityRange, setIntensityRange] = useState<[number, number]>([1, 5]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(e => e.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Period filter
      if (periodFilter !== 'all') {
        const daysAgo = parseInt(periodFilter);
        const cutoff = startOfDay(subDays(new Date(), daysAgo));
        if (!isAfter(new Date(entry.created_at), cutoff)) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!entry.title.toLowerCase().includes(query) && 
            !entry.context?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Tags filter
      if (selectedTags.length > 0) {
        if (!selectedTags.some(tag => entry.tags?.includes(tag))) return false;
      }

      // Intensity filter
      if (entry.intensity) {
        if (entry.intensity < intensityRange[0] || entry.intensity > intensityRange[1]) return false;
      }

      return true;
    });
  }, [entries, periodFilter, searchQuery, selectedTags, intensityRange]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'text-green-400',
      'text-lime-400',
      'text-yellow-400',
      'text-orange-400',
      'text-red-400'
    ];
    return colors[intensity - 1] || 'text-muted-foreground';
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-amber-500/20">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-amber-500/20 flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-500/40" />
        </div>
        <p className="text-muted-foreground font-body">
          Aucune entrée dans la timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4 p-4 bg-card/30 border border-amber-500/20">
        {/* Search + Period */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 bg-card/50 border-amber-500/20"
            />
          </div>
          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
            <SelectTrigger className="w-[140px] bg-card/50 border-amber-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90" disabled={!isSubscribed}>
                90 jours {!isSubscribed && '(Pro)'}
              </SelectItem>
              <SelectItem value="all" disabled={!isSubscribed}>
                Tout {!isSubscribed && '(Pro)'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer text-xs ${
                  selectedTags.includes(tag) 
                    ? 'bg-amber-500 text-black' 
                    : 'border-amber-500/30 text-muted-foreground hover:border-amber-500'
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Intensity filter */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Intensité:</span>
          <Slider
            value={intensityRange}
            onValueChange={(v) => setIntensityRange([v[0], v[1]])}
            min={1}
            max={5}
            step={1}
            className="flex-1 max-w-xs"
          />
          <span className="text-xs text-amber-500">{intensityRange[0]}-{intensityRange[1]}</span>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredEntries.length} entrée{filteredEntries.length !== 1 ? 's' : ''}
      </p>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-amber-500/20" />

        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="relative pl-16">
              {/* Timeline dot */}
              <div className="absolute left-4 w-5 h-5 rounded-full border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-amber-500" />
              </div>

              {/* Content */}
              <div className="p-4 border border-amber-500/20 bg-card/30 hover:bg-card/50 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Date + Intensity */}
                    <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
                      <span>{format(new Date(entry.created_at), 'PPP à HH:mm', { locale: fr })}</span>
                      {entry.intensity && (
                        <span className={`font-medium ${getIntensityColor(entry.intensity)}`}>
                          {'⬤ '.repeat(entry.intensity).trim()} Intensité {entry.intensity}/5
                        </span>
                      )}
                    </div>

                    {/* Phrase */}
                    <h4 className="font-body text-foreground mb-2">{entry.title}</h4>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs border-amber-500/30 text-amber-500">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Context */}
                    {entry.context && (
                      <p className="text-sm text-muted-foreground mt-2">{entry.context}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(entry.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
