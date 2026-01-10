import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useThresholdsDB } from '@/hooks/useThresholdsDB';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { useSilvaSpaces } from '@/hooks/useSilvaSpaces';
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
  Search, Folder, Target, Eye, XCircle, Leaf,
  LayoutDashboard, Settings, User 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cases } = useUserCases(user?.id);
  const { thresholds: irreversaThresholds } = useThresholdsDB(user?.id);
  const { absences } = useAbsencesDB(user?.id);
  const { thresholds: threshThresholds } = useInvisibleThresholds(user?.id);
  const { spaces: silvaSpaces } = useSilvaSpaces(user?.id);

  // Filter results based on search query
  const filteredCases = searchQuery.length >= 2 
    ? cases.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cases;

  const filteredIrreversa = searchQuery.length >= 2
    ? irreversaThresholds.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : irreversaThresholds;

  const filteredAbsences = searchQuery.length >= 2
    ? absences.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : absences;

  const filteredThresh = searchQuery.length >= 2
    ? threshThresholds.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : threshThresholds;

  const filteredSilva = searchQuery.length >= 2
    ? silvaSpaces.filter(s =>
        s.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : silvaSpaces;

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
    { label: 'SILVA', icon: Leaf, path: '/silva/home' },
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

      <CommandDialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setSearchQuery('');
      }}>
        <CommandInput 
          placeholder="Rechercher dossiers, seuils, absences..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
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
          {filteredCases.length > 0 && (
            <CommandGroup heading={`Dossiers${searchQuery ? ` (${filteredCases.length})` : ' récents'}`}>
              {filteredCases.slice(0, searchQuery ? 10 : 5).map((caseItem) => {
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
          {filteredIrreversa.length > 0 && (
            <CommandGroup heading={`Seuils IRREVERSA${searchQuery ? ` (${filteredIrreversa.length})` : ''}`}>
              {filteredIrreversa.slice(0, searchQuery ? 8 : 3).map((threshold) => (
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
          {filteredAbsences.length > 0 && (
            <CommandGroup heading={`Absences NULLA${searchQuery ? ` (${filteredAbsences.length})` : ''}`}>
              {filteredAbsences.slice(0, searchQuery ? 8 : 3).map((absence) => (
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
          {filteredThresh.length > 0 && (
            <CommandGroup heading={`Seuils THRESH${searchQuery ? ` (${filteredThresh.length})` : ''}`}>
              {filteredThresh.slice(0, searchQuery ? 8 : 3).map((threshold) => (
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

          {/* SILVA Spaces */}
          {filteredSilva.length > 0 && (
            <CommandGroup heading={`Espaces SILVA${searchQuery ? ` (${filteredSilva.length})` : ''}`}>
              {filteredSilva.slice(0, searchQuery ? 5 : 2).map((space) => (
                <CommandItem
                  key={space.id}
                  onSelect={() => {
                    if (space.case_id) {
                      handleSelect(`/silva/space?case=${space.case_id}`);
                    } else {
                      handleSelect('/silva/space');
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Leaf className="mr-2 h-4 w-4 text-silva" />
                  <span className="flex-1">
                    {space.case_id ? 'Espace lié' : 'Espace global'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {space.content?.slice(0, 30)}...
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
