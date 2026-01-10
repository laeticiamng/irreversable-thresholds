import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function IrreversaHome() {
  const { user } = useAuth();
  const { isPro } = useSubscription(user?.id);

  const useCases = [
    "Je signe un contrat / une dette",
    "Je démissionne / je change de pays",
    "Je publie / j'expose publiquement",
    "Je coupe une relation / je romps un accord",
    "Je lance / j'arrête un projet",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Territoires
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-primary">IRREVERSA</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Hero */}
        <section className="text-center mb-16 md:mb-24">
          <div className="text-5xl text-primary/60 mb-6">◼</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-foreground mb-4">
            IRREVERSA
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
            Repère les points où une trajectoire bascule.
          </p>
        </section>

        {/* Value props - 3 bullets */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '⟵ ⟶', title: 'Avant / Après', desc: 'Visualise clairement ce qui change après un seuil.' },
            { icon: '◉', title: 'Conséquences claires', desc: 'Liste ce qui devient impossible, coûteux ou différent.' },
            { icon: '↓', title: 'Export en rapport', desc: 'Génère un PDF ou PNG pour garder une trace.' },
          ].map((item, i) => (
            <div key={i} className="p-6 border border-primary/20 bg-card/30 text-center">
              <div className="text-2xl text-primary/60 mb-3">{item.icon}</div>
              <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/irreversa/cases" : "/exposition"}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                {user ? "Créer un dossier" : "Commencer"}
              </Button>
            </Link>
            <Link to="/irreversa/demo">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-6 text-lg">
                Voir un exemple
              </Button>
            </Link>
          </div>
        </section>

        {/* Why pay - visible without scroll */}
        <section className="p-8 border border-primary/30 bg-primary/5 mb-16">
          <h2 className="font-display text-xl text-center text-foreground mb-6">
            Pourquoi passer Pro ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl text-primary mb-2">📄</div>
              <h3 className="font-display text-primary">Exports PDF</h3>
              <p className="text-sm text-muted-foreground">Rapport professionnel exportable</p>
            </div>
            <div>
              <div className="text-2xl text-primary mb-2">∞</div>
              <h3 className="font-display text-primary">Seuils illimités</h3>
              <p className="text-sm text-muted-foreground">Aucune limite sur vos dossiers</p>
            </div>
            <div>
              <div className="text-2xl text-primary mb-2">★</div>
              <h3 className="font-display text-primary">Templates premium</h3>
              <p className="text-sm text-muted-foreground">8 modèles prêts à l'emploi</p>
            </div>
          </div>
          {!isPro && (
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground mb-3">
                Tu paies pour garder l'historique complet + exporter un rapport clair.
              </p>
              <Button variant="ghost" className="text-primary border border-primary/30">
                Débloquer Pro
              </Button>
            </div>
          )}
        </section>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-xs font-display tracking-[0.3em] text-center text-muted-foreground uppercase mb-8">
            Cas d'usage
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((uc, i) => (
              <span 
                key={i} 
                className="px-4 py-2 text-sm border border-border/50 text-muted-foreground bg-card/20"
              >
                {uc}
              </span>
            ))}
          </div>
        </section>

        {/* Targets */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { title: 'Individus', desc: 'Choix de vie, finances, carrière, relations, projets' },
            { title: 'Équipes', desc: 'Décisions produit, stratégie, risques' },
            { title: 'Organisations', desc: 'Comités de direction, audits décisionnels, pilotage' },
          ].map((target, i) => (
            <div key={i} className="p-6 border border-border/30">
              <h3 className="font-display text-foreground mb-2">{target.title}</h3>
              <p className="text-sm text-muted-foreground">{target.desc}</p>
            </div>
          ))}
        </section>

        {/* Definition */}
        <section className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase mb-4">
            Définition d'un seuil irréversible
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Un événement ou une décision pour lequel le retour à l'état précédent est 
            <strong className="text-foreground"> impossible ou extrêmement coûteux</strong>. 
            Il existe un avant et un après nettement différent. 
            La trajectoire change de manière durable.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            Outil de structuration. Pas de promesse. Pas de décision à ta place.
          </p>
        </div>
      </footer>
    </div>
  );
}
