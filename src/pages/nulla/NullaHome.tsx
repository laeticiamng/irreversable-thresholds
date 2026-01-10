import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { GlobalNav } from '@/components/GlobalNav';
import { UpgradeModal } from '@/components/UpgradeModal';

export default function NullaHome() {
  const { user } = useAuth();
  const { isPro } = useSubscription(user?.id);

  const useCases = [
    "Je ne comprends pas pourquoi ce projet stagne.",
    "Pourquoi ce plan échoue malgré de bonnes idées ?",
    "Qu'est-ce qui manque réellement (preuve, ressource, accès) ?",
    "Pourquoi cette trajectoire est bloquée ?",
  ];

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20 pt-20">
        {/* Hero */}
        <section className="text-center mb-16 md:mb-24">
          <div className="text-5xl text-nulla/60 mb-6">∅</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-foreground mb-4">
            NULLA
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
            Repère ce qui manque, et ce que ça provoque.
          </p>
        </section>

        {/* Value props - 3 bullets */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '→', title: 'Absence → Effet', desc: 'Relie chaque manque à son effet concret.' },
            { icon: '◎', title: 'Carte des vulnérabilités', desc: 'Visualise les absences critiques par catégorie.' },
            { icon: '↓', title: 'Export en rapport', desc: 'Génère un PDF ou PNG pour documenter.' },
          ].map((item, i) => (
            <div key={i} className="p-6 border border-nulla/20 bg-card/30 text-center">
              <div className="text-2xl text-nulla/60 mb-3">{item.icon}</div>
              <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/nulla/cases" : "/exposition"}>
              <Button className="bg-nulla hover:bg-nulla/90 text-primary-foreground px-8 py-6 text-lg">
                {user ? "Créer un dossier" : "Commencer"}
              </Button>
            </Link>
          </div>
        </section>

        {/* Why pay - visible without scroll */}
        <section className="p-8 border border-nulla/30 bg-nulla/5 mb-16">
          <h2 className="font-display text-xl text-center text-foreground mb-6">
            Pourquoi passer Pro ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl text-nulla mb-2">∞</div>
              <h3 className="font-display text-nulla">Absences illimitées</h3>
              <p className="text-sm text-muted-foreground">Aucune limite sur vos dossiers</p>
            </div>
            <div>
              <div className="text-2xl text-nulla mb-2">📄</div>
              <h3 className="font-display text-nulla">Exports PDF/PNG</h3>
              <p className="text-sm text-muted-foreground">Rapports et visuels exportables</p>
            </div>
            <div>
              <div className="text-2xl text-nulla mb-2">★</div>
              <h3 className="font-display text-nulla">Templates premium</h3>
              <p className="text-sm text-muted-foreground">8 modèles + tri avancé</p>
            </div>
          </div>
          {!isPro && (
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground mb-3">
                Tu paies pour rendre le diagnostic complet et exportable.
              </p>
              <UpgradeModal 
                trigger={
                  <Button variant="ghost" className="text-nulla border border-nulla/30">
                    Débloquer Pro — 9,90€/mois
                  </Button>
                }
              />
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
            { title: 'Individus', desc: 'Projet perso, carrière, choix de vie, finances' },
            { title: 'Équipes', desc: 'Diagnostic de projet, risques, coordination' },
            { title: 'Organisations', desc: 'Audit, stratégie, prévention d\'échec, conformité' },
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
            Définition d'une absence structurante
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Un élément non présent qui 
            <strong className="text-foreground"> limite durablement les options</strong>, 
            crée des contraintes invisibles, 
            augmente le risque d'erreur ou d'impasse, 
            empêche la progression même avec une bonne volonté.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            Outil de lucidité. Pas de promesse. Pas de décision à ta place.
          </p>
        </div>
      </footer>
    </div>
  );
}
