import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AbsenceCard } from '@/components/AbsenceCard';
import { CreateAbsenceForm } from '@/components/CreateAbsenceForm';
import { AddEffectForm } from '@/components/AddEffectForm';
import { ViewEffects } from '@/components/ViewEffects';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { Absence } from '@/types/database';

export default function Absences() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { absences, isLoading, addAbsence, addEffect } = useAbsencesDB(user?.id);
  const [isCreating, setIsCreating] = useState(false);
  const [addingEffectTo, setAddingEffectTo] = useState<Absence | null>(null);
  const [viewingEffectsOf, setViewingEffectsOf] = useState<Absence | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreate = async (title: string, description: string) => {
    await addAbsence.mutateAsync({ title, description });
    setIsCreating(false);
  };

  const handleAddEffect = async (absenceId: string, type: any, description: string) => {
    await addEffect.mutateAsync({ absenceId, effectType: type, description });
    setAddingEffectTo(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center surface-void">
        <span className="text-nulla/50 font-display tracking-widest text-sm animate-pulse">
          VIDE
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col surface-void">
      {/* Nav */}
      <nav className="border-b border-nulla/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/nulla" className="font-display text-lg tracking-[0.15em] text-nulla hover:text-nulla/80 transition-colors">
            NULLA
          </Link>
          <span className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
            {absences.length} absence{absences.length !== 1 ? 's' : ''}
          </span>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              Les absences
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              Ce qui n'existe pas, et pourtant structure.
            </p>
          </div>
          {!isCreating && (
            <Button variant="void" onClick={() => setIsCreating(true)}>
              Nouvelle absence
            </Button>
          )}
        </div>

        {/* Create form */}
        {isCreating && (
          <div className="mb-12 border border-nulla/20 p-8 bg-card/50">
            <h2 className="font-display text-xl tracking-wide text-nulla mb-6">
              Déclarer une absence
            </h2>
            <CreateAbsenceForm 
              onSubmit={handleCreate} 
              onCancel={() => setIsCreating(false)} 
            />
          </div>
        )}

        {/* Absences list */}
        {absences.length === 0 && !isCreating ? (
          <div className="text-center py-24 border border-dashed border-nulla/20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-nulla/20 flex items-center justify-center">
              <span className="text-2xl text-nulla/40">∅</span>
            </div>
            <p className="text-muted-foreground font-body mb-6">
              Aucune absence déclarée.
            </p>
            <Button variant="void" onClick={() => setIsCreating(true)}>
              Déclarer la première absence
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {absences.map((absence, index) => (
              <div 
                key={absence.id} 
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AbsenceCard 
                  absence={absence} 
                  onAddEffect={() => setAddingEffectTo(absence)}
                  onViewEffects={() => setViewingEffectsOf(absence)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-nulla/20 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Accueil
          </Link>
          <Link 
            to="/pending" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            IRREVERSA →
          </Link>
        </div>
      </footer>

      {/* Add effect modal */}
      {addingEffectTo && (
        <AddEffectForm
          absence={addingEffectTo}
          onSubmit={(type, desc) => handleAddEffect(addingEffectTo.id, type, desc)}
          onCancel={() => setAddingEffectTo(null)}
        />
      )}

      {/* View effects modal */}
      {viewingEffectsOf && (
        <ViewEffects
          absence={viewingEffectsOf}
          onClose={() => setViewingEffectsOf(null)}
        />
      )}
    </div>
  );
}
