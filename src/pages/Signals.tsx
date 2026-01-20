import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSignals } from '@/hooks/useSignals';
import { useCases } from '@/hooks/useCases';
import { Signal, SignalType, SIGNAL_TYPE_LABELS } from '@/types/database';
import { SignalCaptureModal } from '@/components/thresh/SignalCaptureModal';
import { SignalsList } from '@/components/thresh/SignalsList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Radio, Eye, Lightbulb, Zap, MapPin, TrendingUp } from 'lucide-react';

const SIGNAL_TYPE_ICONS: Record<SignalType, React.ReactNode> = {
  observation: <Eye className="w-4 h-4" />,
  fait: <Radio className="w-4 h-4" />,
  intuition: <Lightbulb className="w-4 h-4" />,
  tension: <Zap className="w-4 h-4" />,
  contexte: <MapPin className="w-4 h-4" />,
};

export default function Signals() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { signals, isLoading, addSignal, deleteSignal, getSignalsByType, getHighIntensitySignals } = useSignals(user?.id);
  const { cases } = useCases(user?.id);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | SignalType>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAddSignal = async (data: {
    content: string;
    signalType: SignalType;
    intensity?: number;
    occurredAt?: string;
    caseId?: string;
  }) => {
    await addSignal.mutateAsync(data);
  };

  const handleDeleteSignal = async (id: string) => {
    await deleteSignal.mutateAsync(id);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-amber-500/50 font-display tracking-widest text-sm animate-pulse">
          SIGNAUX
        </span>
      </div>
    );
  }

  const displayedSignals = activeTab === 'all' ? signals : getSignalsByType(activeTab);
  const highIntensitySignals = getHighIntensitySignals(4);

  // Calculate stats
  const stats = {
    total: signals.length,
    observations: getSignalsByType('observation').length,
    faits: getSignalsByType('fait').length,
    intuitions: getSignalsByType('intuition').length,
    tensions: getSignalsByType('tension').length,
    contextes: getSignalsByType('contexte').length,
    highIntensity: highIntensitySignals.length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <nav className="border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/thresh/home">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                THRESH
              </Button>
            </Link>
            <span className="font-display text-lg tracking-[0.15em] text-amber-500">
              SIGNAUX
            </span>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider"
          >
            <Plus className="w-4 h-4 mr-2" />
            Capturer
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-amber-500/20 bg-card/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display tracking-wide text-amber-500 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-display text-lg text-foreground">{stats.total}</span>
                </div>
                <div className="border-t border-amber-500/10 pt-3 space-y-2">
                  {(Object.entries(SIGNAL_TYPE_LABELS) as [SignalType, string][]).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => setActiveTab(type)}
                      className={`w-full flex justify-between items-center px-2 py-1.5 rounded transition-colors ${
                        activeTab === type
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'hover:bg-card/50 text-muted-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm">
                        {SIGNAL_TYPE_ICONS[type]}
                        {label}
                      </span>
                      <span className="text-sm">{stats[type === 'observation' ? 'observations' : type === 'fait' ? 'faits' : type === 'intuition' ? 'intuitions' : type === 'tension' ? 'tensions' : 'contextes']}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-amber-500/10 pt-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Haute intensité</span>
                    <span className="text-amber-500 font-medium">{stats.highIntensity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info card */}
            <Card className="border-amber-500/10 bg-amber-500/5">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Les signaux sont les briques de base de ta perception.
                  Ils nourrissent l'analyse des seuils invisibles.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | SignalType)}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="all" className="text-xs">
                    Tous ({signals.length})
                  </TabsTrigger>
                </TabsList>
                <p className="text-sm text-muted-foreground">
                  {displayedSignals.length} signal{displayedSignals.length !== 1 ? 'x' : ''}
                </p>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                <SignalsList
                  signals={displayedSignals}
                  onDelete={handleDeleteSignal}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link
            to="/thresh/home"
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour à THRESH
          </Link>
          <span className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground/50">
            {signals.length} signal{signals.length !== 1 ? 'x' : ''} capturé{signals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </footer>

      {/* Create modal */}
      <SignalCaptureModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        cases={cases}
        onAdd={handleAddSignal}
      />
    </div>
  );
}
