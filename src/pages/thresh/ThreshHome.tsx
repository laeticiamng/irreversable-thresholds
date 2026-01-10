import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserCases } from '@/hooks/useUserCases';
import { useInvisibleThresholds } from '@/hooks/useInvisibleThresholds';
import { GlobalNav } from '@/components/GlobalNav';
import { UpgradeModal } from '@/components/UpgradeModal';
import { QuickCaptureModal } from '@/components/thresh/QuickCaptureModal';
import { ThreshTimeline } from '@/components/thresh/ThreshTimeline';
import { ThreshPatterns } from '@/components/thresh/ThreshPatterns';
import { ThreshSynthesis } from '@/components/thresh/ThreshSynthesis';
import { FocusMode } from '@/components/thresh/FocusMode';
import { Zap, Eye, FileText, Clock, BarChart3, Sparkles, Focus } from 'lucide-react';

const FREE_ENTRY_LIMIT = 20;

export default function ThreshHome() {
  const { user, isSubscribed } = useAuth();
  const { cases } = useUserCases(user?.id);
  const { thresholds, addThreshold, deleteThreshold } = useInvisibleThresholds(user?.id);
  const [showCapture, setShowCapture] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  const canAddEntry = isSubscribed || thresholds.length < FREE_ENTRY_LIMIT;
  
  // Filter THRESH cases
  const threshCases = cases.filter(c => {
    const meta = c.metadata as Record<string, unknown> | null;
    return meta?.module === 'thresh';
  });

  const features = [
    { icon: Zap, title: "Capture en 1 minute", description: "Note une bascule ressentie avant qu'elle ne devienne un événement" },
    { icon: Clock, title: "Timeline filtrable", description: "Retrouve et filtre par tags, intensité, période" },
    { icon: BarChart3, title: "Patterns & synthèses", description: "Comprends ce qui revient et les tendances" }
  ];

  const useCasesData = [
    { title: "Individus", examples: ["Changements de cap", "Projets", "Décisions", "Transitions de vie"] },
    { title: "Créateurs", examples: ["Signaux faibles avant pivot", "Élan créatif", "Blocages"] },
    { title: "Teams / B2B", examples: ["Tension équipe", "Saturation", "Flou", "Alertes précoces"] }
  ];

  const handleQuickCapture = async (data: { title: string; description: string; tags: string[]; intensity: number; context?: string; caseId?: string }) => {
    await addThreshold.mutateAsync({
      title: data.title,
      description: data.description || '',
      tags: data.tags,
      intensity: data.intensity,
      context: data.context,
      caseId: data.caseId,
    });
  };

  // If user is logged in and has entries, show the full app
  if (user && thresholds.length > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GlobalNav />
        
        <div className="border-b border-amber-500/20 pt-14">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="font-display text-lg tracking-[0.15em] text-amber-500">THRESH</span>
            <div className="flex items-center gap-4">
              {!isSubscribed && (
                <span className="text-xs text-amber-500/60">Free: {FREE_ENTRY_LIMIT - thresholds.length} entrées restantes</span>
              )}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFocusMode(true)} 
                  className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                >
                  <Focus className="w-4 h-4 mr-2" />Focus
                </Button>
                <Button onClick={() => setShowCapture(true)} disabled={!canAddEntry} className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider">
                  <Zap className="w-4 h-4 mr-2" />Capture rapide
                </Button>
              </div>
              {!isSubscribed && <UpgradeModal trigger={<Button variant="ghost" size="sm" className="text-amber-500">Pro</Button>} />}
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card/50 border border-amber-500/20 mb-8">
              <TabsTrigger value="timeline" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                <Clock className="w-4 h-4 mr-2" />Timeline
              </TabsTrigger>
              <TabsTrigger value="patterns" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                <BarChart3 className="w-4 h-4 mr-2" />Patterns
              </TabsTrigger>
              <TabsTrigger value="synthesis" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                <Sparkles className="w-4 h-4 mr-2" />Synthèse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <ThreshTimeline entries={thresholds as any} isSubscribed={isSubscribed} onDelete={(id) => deleteThreshold.mutate(id)} />
            </TabsContent>
            <TabsContent value="patterns">
              <ThreshPatterns entries={thresholds as any} isSubscribed={isSubscribed} />
            </TabsContent>
            <TabsContent value="synthesis">
              <ThreshSynthesis entries={thresholds as any} isSubscribed={isSubscribed} />
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t border-amber-500/20 py-6">
          <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-xs text-muted-foreground">
            <span>Outil de lucidité. Pas de promesse.</span>
            <Link to="/thresh/cases" className="hover:text-foreground">Mes dossiers ({threshCases.length})</Link>
          </div>
        </footer>

        <QuickCaptureModal open={showCapture} onOpenChange={setShowCapture} cases={threshCases} onAdd={handleQuickCapture} isSubscribed={isSubscribed} />
        <FocusMode 
          open={showFocusMode} 
          onOpenChange={setShowFocusMode} 
        />
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalNav />

      <section className="py-24 px-6 pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide text-amber-500 mb-6">THRESH</h1>
          <p className="text-xl text-muted-foreground font-body mb-4 max-w-2xl mx-auto">Note une bascule ressentie avant qu'elle ne devienne un événement.</p>
          <p className="text-sm text-muted-foreground/60 font-body mb-12 max-w-xl mx-auto">L'intuition des transitions.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => user ? setShowCapture(true) : null} className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider px-8">
              {user ? 'Capture rapide' : <Link to="/exposition">Commencer</Link>}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-amber-500/30 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 border-t border-amber-500/10 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl text-amber-500 mb-6">Pourquoi passer Pro ?</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="p-4"><div className="text-2xl mb-2">∞</div><div className="text-sm text-muted-foreground">Entrées illimitées</div></div>
            <div className="p-4"><div className="text-2xl mb-2">📊</div><div className="text-sm text-muted-foreground">Patterns complets</div></div>
            <div className="p-4"><div className="text-2xl mb-2">✨</div><div className="text-sm text-muted-foreground">Synthèses périodiques</div></div>
            <div className="p-4"><div className="text-2xl mb-2">📄</div><div className="text-sm text-muted-foreground">Exports PDF</div></div>
          </div>
          {!isSubscribed && <UpgradeModal trigger={<Button className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider">Débloquer Pro — 9,90€/mois</Button>} />}
        </div>
      </section>

      <footer className="mt-auto border-t border-amber-500/20 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/60">Outil de lucidité. Pas de promesse. Pas de décision à ta place.</p>
          <div className="flex items-center gap-6">
            <Link to="/manifesto" className="text-xs text-muted-foreground hover:text-foreground">Manifeste</Link>
          </div>
        </div>
      </footer>

      <QuickCaptureModal open={showCapture} onOpenChange={setShowCapture} cases={threshCases} onAdd={handleQuickCapture} isSubscribed={isSubscribed} />
      <FocusMode 
        open={showFocusMode} 
        onOpenChange={setShowFocusMode} 
      />
    </div>
  );
}
