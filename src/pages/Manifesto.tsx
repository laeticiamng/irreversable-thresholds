import { Link } from 'react-router-dom';

export default function Manifesto() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-foreground">
            MANIFESTE
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-20">
          
          {/* Opening */}
          <section className="text-center space-y-8 animate-fade-up">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wide text-foreground">
              Quatre Territoires
            </h1>
            <p className="text-muted-foreground font-body text-lg italic">
              Pour ceux qui acceptent la réalité telle qu'elle est.
            </p>
          </section>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <span className="w-16 h-px bg-border" />
            <span className="w-2 h-2 border border-border rotate-45" />
            <span className="w-16 h-px bg-border" />
          </div>

          {/* What it is NOT */}
          <section className="space-y-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="space-y-4">
              <p className="text-foreground font-body leading-relaxed">
                Ceci n'est pas une application de productivité.
              </p>
              <p className="text-foreground font-body leading-relaxed">
                Ceci n'est pas un outil d'optimisation.
              </p>
              <p className="text-foreground font-body leading-relaxed">
                Ceci n'est pas un système de suivi.
              </p>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed">
              C'est un espace de confrontation au réel — structuré autour de quatre territoires 
              qui ne promettent rien, ne conseillent rien, ne corrigent rien.
            </p>
          </section>

          {/* The Four Territories */}
          <section className="space-y-12 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground/60 text-center">
              Les quatre territoires
            </h2>

            <div className="space-y-8">
              {/* IRREVERSA */}
              <div className="p-6 border border-primary/20 hover:bg-primary/5 transition-colors duration-500">
                <h3 className="font-display text-lg tracking-wide text-primary mb-3">IRREVERSA</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Les seuils que l'on franchit. Ce qui est fait ne peut être défait. 
                  Aucune suppression, aucun retour arrière. L'irréversible comme structure.
                </p>
              </div>

              {/* NULLA */}
              <div className="p-6 border border-nulla/20 hover:bg-nulla/5 transition-colors duration-500">
                <h3 className="font-display text-lg tracking-wide text-nulla mb-3">NULLA</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Ce qui n'existe pas. Les absences qui structurent. 
                  On ne crée pas ce qui manque — on observe ses effets.
                </p>
              </div>

              {/* THRESH */}
              <div className="p-6 border border-amber-500/20 hover:bg-amber-500/5 transition-colors duration-500">
                <h3 className="font-display text-lg tracking-wide text-amber-500 mb-3">THRESH</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Les seuils invisibles. Ressentis, pas mesurés. Sans déclencheur, sans quantification. 
                  Le moment où "c'est trop" sans pouvoir dire pourquoi.
                </p>
              </div>

              {/* SILVA */}
              <div className="p-6 border border-silva/20 hover:bg-silva/5 transition-colors duration-500">
                <h3 className="font-display text-lg tracking-wide text-silva mb-3">SILVA</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Le milieu. Un espace qui ne fait rien. Pas de fonctionnalité, pas de résultat. 
                  Il modifie les comportements uniquement par sa présence structurelle.
                </p>
              </div>
            </div>
          </section>

          {/* What this project is NOT */}
          <section className="space-y-8 animate-fade-up" style={{ animationDelay: '600ms' }}>
            <h2 className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground/60 text-center">
              Ce que ce projet n'est PAS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                'Un SaaS',
                'Un système de gamification',
                'Un outil de bien-être',
                'Une plateforme de productivité',
                'Un produit optimisé pour la croissance',
                'Une IA'
              ].map((item, index) => (
                <div key={index} className="p-3 border border-destructive/20 text-center">
                  <p className="text-muted-foreground/70 font-body text-xs flex items-center justify-center gap-2">
                    <span className="text-destructive/50">✗</span>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Philosophy */}
          <section className="space-y-8 animate-fade-up" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-border" />
              <span className="text-muted-foreground/50 text-xs font-display tracking-[0.3em]">INTENTION</span>
              <span className="w-12 h-px bg-border" />
            </div>
            <div className="space-y-6 text-center">
              <p className="text-muted-foreground font-body leading-relaxed">
                L'absence de fonctionnalités est une décision de design, pas un manque.
              </p>
              <p className="text-muted-foreground font-body leading-relaxed">
                La lenteur, le silence et la retenue sont des <em>features</em> conceptuelles.
              </p>
              <p className="text-muted-foreground font-body leading-relaxed">
                Le succès du projet n'est pas mesuré par l'usage,
                <br />mais par la justesse de l'expérience.
              </p>
            </div>
          </section>

          {/* Closing */}
          <section className="pt-8 text-center animate-fade-up" style={{ animationDelay: '1000ms' }}>
            <p className="text-muted-foreground/40 font-body text-sm">
              Ce projet existe. C'est tout ce qu'il promet.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-8">
            {['IRREVERSA', 'NULLA', 'THRESH', 'SILVA'].map(territory => (
              <Link
                key={territory}
                to={`/${territory.toLowerCase()}`}
                className="text-xs font-display tracking-wider text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                {territory}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
