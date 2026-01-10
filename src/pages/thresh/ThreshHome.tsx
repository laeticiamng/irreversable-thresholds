import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Zap, Eye, FileText, Layers, Clock, Target, Shield } from 'lucide-react';

export default function ThreshHome() {
  const { user, isSubscribed } = useAuth();

  const features = [
    { icon: Zap, title: "Seuil → Ressenti", description: "Identifie le moment exact où quelque chose bascule" },
    { icon: Eye, title: "Types de seuils", description: "Trop, pas assez, rupture, évidence, saturation..." },
    { icon: FileText, title: "Export rapport", description: "PDF structuré pour la trace ou la collaboration" }
  ];

  const useCases = [
    { title: "Individus", examples: ["Limites personnelles", "Charge mentale", "Décisions de vie"] },
    { title: "Teams", examples: ["Saturation équipe", "Points de rupture", "Seuils de tolérance"] },
    { title: "B2B", examples: ["Risques projet", "Limites acceptabilité", "Alertes précoces"] }
  ];

  const threshTypes = [
    { name: "Trop", description: "Quand c'est trop", icon: Target },
    { name: "Pas assez", description: "Quand ce n'est pas assez", icon: Layers },
    { name: "Rupture", description: "Quand ça casse", icon: Zap },
    { name: "Évidence", description: "Quand c'est soudain évident", icon: Eye },
    { name: "Saturation", description: "Quand on ne peut plus absorber", icon: Clock },
    { name: "Tolérance", description: "Quand on ne tolère plus", icon: Shield }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/thresh" className="font-display text-lg tracking-[0.15em] text-amber-500 hover:text-amber-400 transition-colors">
            THRESH
          </Link>
          <div className="flex items-center gap-4">
            {!isSubscribed && (
              <UpgradeModal 
                trigger={
                  <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                    Débloquer Pro
                  </Button>
                }
              />
            )}
            {user && (
              <Link to="/thresh/cases">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Mes dossiers
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide text-amber-500 mb-6">THRESH</h1>
          <p className="text-xl text-muted-foreground font-body mb-4 max-w-2xl mx-auto">
            Repère les seuils invisibles avant qu'ils ne soient franchis.
          </p>
          <p className="text-sm text-muted-foreground/60 font-body mb-12 max-w-xl mx-auto">
            Ce qui n'a pas encore basculé. Ce qu'on sent venir. Ce qu'on ignore parfois jusqu'à ce que ce soit trop tard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/thresh/cases/new" : "/exposition"}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider px-8">
                Créer un dossier
              </Button>
            </Link>
            <Link to="/thresh/space">
              <Button variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-display tracking-wider">
                Voir un exemple
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-amber-500/30 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thresh Types Grid */}
      <section className="py-16 px-6 border-t border-amber-500/10 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-center text-amber-500 mb-4">Types de seuils invisibles</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Chaque seuil a sa nature propre. THRESH t'aide à les identifier et les nommer.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {threshTypes.map((type, index) => (
              <div key={index} className="p-6 border border-amber-500/20 bg-card/50 hover:bg-card/80 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <type.icon className="w-4 h-4 text-amber-500" />
                  <h3 className="font-display text-amber-500">{type.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 border-t border-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-center text-amber-500 mb-12">Cas d'usage</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-6 border border-amber-500/20 bg-card/30">
                <h3 className="font-display text-lg text-foreground mb-4">{useCase.title}</h3>
                <ul className="space-y-2">
                  {useCase.examples.map((example, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 bg-amber-500/60 rounded-full" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Pay */}
      <section className="py-16 px-6 border-t border-amber-500/10 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl text-amber-500 mb-6">Pourquoi passer Pro ?</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="p-4">
              <div className="text-2xl mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Seuils illimités</div>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm text-muted-foreground">Exports PDF/PNG</div>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm text-muted-foreground">Templates premium</div>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm text-muted-foreground">Vues avancées</div>
            </div>
          </div>
          {!isSubscribed && (
            <UpgradeModal 
              trigger={
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-display tracking-wider">
                  Débloquer Pro — 9,90€/mois
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-500/20 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground/60 text-center md:text-left">
              Outil de lucidité. Pas de promesse. Pas de décision à ta place.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Territoires</Link>
              <Link to="/manifesto" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Manifeste</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
