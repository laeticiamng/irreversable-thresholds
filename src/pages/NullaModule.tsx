import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AbsenceCard } from '@/components/AbsenceCard';
import { CreateAbsenceForm } from '@/components/CreateAbsenceForm';
import { AddEffectForm } from '@/components/AddEffectForm';
import { ViewEffects } from '@/components/ViewEffects';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAbsencesDB } from '@/hooks/useAbsencesDB';
import { Absence } from '@/types/database';

type TabType = 'absences' | 'effects' | 'categories';

export default function NullaModule() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { absences, isLoading, addAbsence, addEffect } = useAbsencesDB(user?.id);
  
  const [activeTab, setActiveTab] = useState<TabType>('absences');
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

  const handleAddEffect = async (absenceId: string, type: 'prevents' | 'enables' | 'forces' | 'preserves', description: string) => {
    await addEffect.mutateAsync({ absenceId, effectType: type, description });
    setAddingEffectTo(null);
  };

  // Count effects by type
  const effectCounts = absences.reduce((acc, a) => {
    (a.effects || []).forEach(e => {
      acc[e.effect_type] = (acc[e.effect_type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalEffects = Object.values(effectCounts).reduce((a, b) => a + b, 0);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-nulla/50 font-display tracking-widest text-sm animate-pulse">
          NULLA
        </span>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'absences', label: 'Absences', count: absences.length },
    { id: 'effects', label: 'Effets', count: totalEffects },
    { id: 'categories', label: 'Catégories' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <nav className="border-b border-nulla/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/nulla" 
            className="font-display text-lg tracking-[0.15em] text-nulla hover:text-nulla/80 transition-colors"
          >
            NULLA
          </Link>
          <div className="flex items-center gap-4">
            <ExportButton 
              module="nulla" 
              data={absences}
              filename="nulla-absences"
            />
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative py-4 text-xs font-display tracking-[0.15em] uppercase transition-colors
                  ${activeTab === tab.id 
                    ? 'text-nulla' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-muted-foreground/60">({tab.count})</span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-nulla" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-3xl tracking-wide text-foreground mb-2">
              {activeTab === 'absences' && 'Les absences'}
              {activeTab === 'effects' && 'Les effets'}
              {activeTab === 'categories' && 'Par catégorie'}
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              {activeTab === 'absences' && 'Ce qui n\'existe pas, et pourtant structure.'}
              {activeTab === 'effects' && 'Ce que les absences empêchent, permettent, forcent ou préservent.'}
              {activeTab === 'categories' && 'Ressources, droits, compétences, protections.'}
            </p>
          </div>
          {activeTab === 'absences' && !isCreating && (
            <Button 
              variant="ghost" 
              onClick={() => setIsCreating(true)}
              className="border border-nulla/30 text-nulla hover:bg-nulla/10"
            >
              Nouvelle absence
            </Button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'categories' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {['ressource', 'droit', 'compétence', 'protection'].map(cat => (
              <div key={cat} className="p-6 border border-nulla/20 bg-card/30">
                <h3 className="font-display text-lg text-nulla capitalize mb-4">{cat}</h3>
                <p className="text-muted-foreground/60 text-sm">
                  {cat === 'ressource' && 'Ce qui manque pour agir.'}
                  {cat === 'droit' && 'Ce qui n\'est pas accordé.'}
                  {cat === 'compétence' && 'Ce qui n\'a pas été transmis.'}
                  {cat === 'protection' && 'Ce qui n\'est pas garanti.'}
                </p>
              </div>
            ))}
          </div>
        ) : activeTab === 'effects' ? (
          <div className="space-y-8">
            {/* Effect type breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'prevents', label: 'Empêche', color: 'text-destructive' },
                { type: 'enables', label: 'Rend possible', color: 'text-green-500' },
                { type: 'forces', label: 'Force', color: 'text-amber-500' },
                { type: 'preserves', label: 'Préserve', color: 'text-blue-500' },
              ].map(({ type, label, color }) => (
                <div key={type} className="p-4 border border-border/50 text-center">
                  <span className={`text-2xl font-display ${color}`}>
                    {effectCounts[type] || 0}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* All effects list */}
            <div className="space-y-3">
              {absences.flatMap(a => 
                (a.effects || []).map(e => (
                  <div key={e.id} className="p-4 border border-border/30 bg-card/20">
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-display uppercase ${
                        e.effect_type === 'prevents' ? 'text-destructive' :
                        e.effect_type === 'enables' ? 'text-green-500' :
                        e.effect_type === 'forces' ? 'text-amber-500' :
                        'text-blue-500'
                      }`}>
                        {e.effect_type === 'prevents' ? 'Empêche' :
                         e.effect_type === 'enables' ? 'Permet' :
                         e.effect_type === 'forces' ? 'Force' : 'Préserve'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground/80">{e.description}</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">
                          Absence : {a.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {totalEffects === 0 && (
                <div className="text-center py-12 border border-dashed border-nulla/20">
                  <p className="text-muted-foreground/60">Aucun effet déclaré.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
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
                <Button 
                  variant="ghost"
                  onClick={() => setIsCreating(true)}
                  className="border border-nulla/30 text-nulla hover:bg-nulla/10"
                >
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-nulla/20 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Territoires
          </Link>
          <span className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/50">
            {absences.length} absence{absences.length !== 1 ? 's' : ''} · {totalEffects} effet{totalEffects !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>

      {/* Modals */}
      {addingEffectTo && (
        <AddEffectForm
          absence={addingEffectTo}
          onSubmit={(type, desc) => handleAddEffect(addingEffectTo.id, type, desc)}
          onCancel={() => setAddingEffectTo(null)}
        />
      )}

      {viewingEffectsOf && (
        <ViewEffects
          absence={viewingEffectsOf}
          onClose={() => setViewingEffectsOf(null)}
        />
      )}
    </div>
  );
}
