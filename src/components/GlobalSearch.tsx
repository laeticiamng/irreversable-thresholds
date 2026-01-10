import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { 
  Search, Folder, Target, Eye, XCircle, 
  LayoutDashboard, Settings, User 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cases } = useUserCases(user?.id);
  const { thresholds: irreversaThresholds } = useThresholdsDB(user?.id);
  const { absences } = useAbsencesDB(user?.id);
  const { thresholds: threshThresholds } = useInvisibleThresholds(user?.id);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const quickActions = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Nouveau dossier', icon: Folder, path: '/cases/new' },
    { label: 'IRREVERSA', icon: Target, path: '/irreversa/home' },
    { label: 'THRESH', icon: Eye, path: '/thresh/home' },
    { label: 'NULLA', icon: XCircle, path: '/nulla/home' },
    { label: 'Paramètres', icon: Settings, path: '/settings' },
    { label: 'Mon compte', icon: User, path: '/account' },
  ];

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Rechercher...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher dossiers, seuils, absences..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Actions rapides">
            {quickActions.map((action) => (
              <CommandItem
                key={action.path}
                onSelect={() => handleSelect(action.path)}
                className="cursor-pointer"
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Cases */}
          {cases.length > 0 && (
            <CommandGroup heading="Dossiers récents">
              {cases.slice(0, 5).map((caseItem) => {
                const meta = caseItem.metadata as Record<string, unknown> | null;
                const module = meta?.module as string || 'irreversa';
                const path = `/${module}/cases/${caseItem.id}`;
                
                return (
                  <CommandItem
                    key={caseItem.id}
                    onSelect={() => handleSelect(path)}
                    className="cursor-pointer"
                  >
                    <Folder className="mr-2 h-4 w-4 text-primary" />
                    <span className="flex-1">{caseItem.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Thresholds */}
          {irreversaThresholds.length > 0 && (
            <CommandGroup heading="Seuils IRREVERSA">
              {irreversaThresholds.slice(0, 3).map((threshold) => (
                <CommandItem
                  key={threshold.id}
                  onSelect={() => {
                    if (threshold.case_id) {
                      handleSelect(`/irreversa/cases/${threshold.case_id}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Target className="mr-2 h-4 w-4 text-primary" />
                  <span className="flex-1">{threshold.title}</span>
                  {threshold.is_crossed && (
                    <span className="text-xs text-primary">Franchi</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Absences */}
          {absences.length > 0 && (
            <CommandGroup heading="Absences NULLA">
              {absences.slice(0, 3).map((absence) => (
                <CommandItem
                  key={absence.id}
                  onSelect={() => {
                    if (absence.case_id) {
                      handleSelect(`/nulla/cases/${absence.case_id}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <XCircle className="mr-2 h-4 w-4 text-nulla" />
                  <span>{absence.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Invisible Thresholds */}
          {threshThresholds.length > 0 && (
            <CommandGroup heading="Seuils THRESH">
              {threshThresholds.slice(0, 3).map((threshold) => (
                <CommandItem
                  key={threshold.id}
                  onSelect={() => {
                    if (threshold.case_id) {
                      handleSelect(`/thresh/cases/${threshold.case_id}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4 text-amber-500" />
                  <span className="flex-1">{threshold.title}</span>
                  {threshold.sensed_at && (
                    <span className="text-xs text-amber-500">Ressenti</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
