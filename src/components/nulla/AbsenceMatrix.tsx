import { useState } from 'react';
import { Absence, AbsenceEffect, EFFECT_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const CATEGORY_LABELS: Record<string, string> = {
  ressource: 'Ressource',
  preuve: 'Preuve / Document',
  acces: 'Accès',
  competence: 'Compétence',
  protection: 'Protection',
  information: 'Information',
  relation: 'Relation / Soutien',
  stabilite: 'Stabilité',
  autre: 'Autre',
};

const IMPACT_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Faible', color: 'text-green-500' },
  moderate: { label: 'Modéré', color: 'text-amber-500' },
  high: { label: 'Élevé', color: 'text-red-500' },
};

interface AbsenceMatrixProps {
  absences: Absence[];
  onAddEffect: (absenceId: string, type: AbsenceEffect['effect_type'], description: string) => Promise<void>;
}

export function AbsenceMatrix({ absences, onAddEffect }: AbsenceMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'alpha' | 'recent'>('impact');

  // Get top critical absences
  const criticalAbsences = absences
    .filter(a => (a as any).impact_level === 'high')
    .slice(0, 5);

  // Filter and sort absences
  let filteredAbsences = absences.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (a as any).category === categoryFilter;
    const matchesImpact = impactFilter === 'all' || (a as any).impact_level === impactFilter;
    return matchesSearch && matchesCategory && matchesImpact;
  });

  // Sort
  filteredAbsences = [...filteredAbsences].sort((a, b) => {
    if (sortBy === 'impact') {
      const impactOrder = { high: 0, moderate: 1, low: 2 };
      return (impactOrder[(a as any).impact_level || 'moderate'] || 1) - 
             (impactOrder[(b as any).impact_level || 'moderate'] || 1);
    }
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-8">
      {/* Top 5 Critical */}
      {criticalAbsences.length > 0 && (
        <div className="p-6 border border-red-500/20 bg-red-500/5">
          <h3 className="font-display text-lg text-red-500 mb-4">
            Top {criticalAbsences.length} absences critiques
          </h3>
          <div className="space-y-2">
            {criticalAbsences.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-background/50">
                <span className="text-red-500">●</span>
                <div>
                  <span className="font-medium text-foreground">{a.title}</span>
                  {a.effects && a.effects.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      → {a.effects[0].description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-border bg-background text-foreground text-sm"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {Object.entries(IMPACT_LABELS).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setImpactFilter(impactFilter === key ? 'all' : key)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                impactFilter === key 
                  ? 'border-nulla bg-nulla/10 text-nulla' 
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-border bg-background text-foreground text-sm"
        >
          <option value="impact">Tri: Impact</option>
          <option value="alpha">Tri: A-Z</option>
          <option value="recent">Tri: Récent</option>
        </select>
      </div>

      {/* Matrix Table */}
      {filteredAbsences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-nulla/20">
          <p className="text-muted-foreground">Aucune absence ne correspond aux filtres.</p>
        </div>
      ) : (
        <div className="border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-card/50">
                <TableHead className="font-display">Absence</TableHead>
                <TableHead className="font-display">Catégorie</TableHead>
                <TableHead className="font-display">Effet concret</TableHead>
                <TableHead className="font-display text-center">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAbsences.map((absence) => {
                const impact = IMPACT_LABELS[(absence as any).impact_level || 'moderate'];
                const category = CATEGORY_LABELS[(absence as any).category || 'autre'];
                const firstEffect = absence.effects?.[0];
                
                return (
                  <TableRow key={absence.id} className="hover:bg-card/30">
                    <TableCell className="font-medium">{absence.title}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 bg-nulla/10 text-nulla">
                        {category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {firstEffect ? (
                        <Tooltip>
                          <TooltipTrigger className="text-left">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {firstEffect.description}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>{firstEffect.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-display text-sm ${impact.color}`}>
                        {impact.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
