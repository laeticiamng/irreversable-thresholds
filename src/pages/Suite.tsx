import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Suite() {
  const modules = [
    {
      id: 'irreversa',
      name: 'IRREVERSA',
      symbol: '◼',
      tagline: 'Points de non-retour',
      description: 'Rend visibles les seuils irréversibles. Ce qui est fait ne peut être défait.',
      color: 'text-primary',
      border: 'border-primary/30',
    },
    {
      id: 'nulla',
      name: 'NULLA',
      symbol: '∅',
      tagline: 'Absences structurantes',
      description: 'Révèle ce qui manque et structure. Le vide comme force organisatrice.',
      color: 'text-nulla',
      border: 'border-nulla/30',
    },
    {
      id: 'thresh',
      name: 'THRESH',
      symbol: '≈',
      tagline: 'Seuils ressentis',
      description: 'Capte l\'avant-mesure. Quand le corps sait avant les chiffres.',
      color: 'text-amber-500',
      border: 'border-amber-500/30',
    },
    {
      id: 'silva',
      name: 'SILVA',
      symbol: '◯',
      tagline: 'Espace neutre',
      description: 'Le milieu qui ne fait rien. Présence structurante sans intervention.',
      color: 'text-silva',
      border: 'border-silva/30',
    },
  ];

  const offers = [
    { name: 'Free', price: '0€', features: ['1 workspace', 'Fonctionnalités limitées', 'Pas d\'export'] },
    { name: 'Pro', price: '19€/mois', features: ['Historique complet', 'Exports PDF/JSON', 'Templates premium'], highlight: true },
    { name: 'Team', price: '49€/mois', features: ['Workspaces partagés', 'Rôles & permissions', 'Collaboration'] },
    { name: 'Enterprise', price: 'Sur devis', features: ['Multi-tenant', 'API access', 'SLA & conformité'] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-[0.15em] text-foreground">
            IRREVERSA SUITE
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-foreground">
            Decision Literacy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rendre lisibles les seuils, les absences et les transitions avant qu'ils ne deviennent irréversibles.
          </p>
        </section>

        {/* Modules */}
        <section className="space-y-8">
          <h2 className="text-xs font-display tracking-[0.3em] text-center text-muted-foreground uppercase">
            Quatre modules complémentaires
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map(m => (
              <Link 
                key={m.id}
                to={`/${m.id}`}
                className={`p-8 border ${m.border} hover:bg-card/50 transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <span className={`text-3xl ${m.color}`}>{m.symbol}</span>
                  <div>
                    <h3 className={`font-display text-xl ${m.color}`}>{m.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{m.tagline}</p>
                    <p className="text-sm text-muted-foreground/60 mt-3">{m.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* What it's not */}
        <section className="text-center space-y-6">
          <h2 className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
            Ce que ce n'est pas
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground/60">
            <span>✗ Coaching</span>
            <span>✗ IA prescriptive</span>
            <span>✗ Outil médical</span>
            <span>✗ Promesse de résultat</span>
          </div>
          <p className="text-muted-foreground">
            C'est un outil de <strong className="text-foreground">lucidité structurée</strong>.
          </p>
        </section>

        {/* Pricing */}
        <section className="space-y-8">
          <h2 className="text-xs font-display tracking-[0.3em] text-center text-muted-foreground uppercase">
            Offres
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {offers.map(o => (
              <div 
                key={o.name}
                className={`p-6 border ${o.highlight ? 'border-primary bg-primary/5' : 'border-border/50'}`}
              >
                <h3 className="font-display text-lg">{o.name}</h3>
                <p className={`text-2xl mt-2 ${o.highlight ? 'text-primary' : ''}`}>{o.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {o.features.map(f => <li key={f}>• {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/30 py-8 text-center text-xs text-muted-foreground/50">
        Outil de structuration. Aucune promesse de résultat.
      </footer>
    </div>
  );
}
