import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const About = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </Link>
          <span className="font-display text-sm tracking-[0.2em] text-muted-foreground">
            À PROPOS
          </span>
          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <article className="space-y-16">
          {/* Title */}
          <header className="space-y-6">
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-foreground">
              Irreversible Thresholds
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              Un espace numérique de confrontation au réel.
            </p>
          </header>

          {/* Intention */}
          <section className="space-y-4">
            <h2 className="font-display text-xs tracking-[0.3em] uppercase text-primary">
              Intention
            </h2>
            <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
              <p>
                Ce projet n'est pas une application. Il ne résout rien. 
                Il n'optimise rien. Il ne conseille rien.
              </p>
              <p>
                C'est un espace pour reconnaître ce qui structure l'existence 
                sans jamais apparaître à l'écran : les seuils franchis, 
                les absences qui organisent, les limites ressenties, 
                le temps qui passe sans rien produire.
              </p>
              <p>
                Quatre territoires. Aucune promesse. Aucun retour.
              </p>
            </div>
          </section>

          {/* Ce que ce n'est pas */}
          <section className="space-y-4">
            <h2 className="font-display text-xs tracking-[0.3em] uppercase text-primary">
              Ce que ce n'est pas
            </h2>
            <ul className="space-y-2 text-muted-foreground font-body">
              <li className="flex items-start gap-3">
                <span className="text-primary/40">—</span>
                <span>Un outil d'aide à la décision</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary/40">—</span>
                <span>Un système d'optimisation personnelle</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary/40">—</span>
                <span>Une application de productivité</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary/40">—</span>
                <span>Une intelligence artificielle</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary/40">—</span>
                <span>Un produit à vendre</span>
              </li>
            </ul>
          </section>

          {/* Principes */}
          <section className="space-y-4">
            <h2 className="font-display text-xs tracking-[0.3em] uppercase text-primary">
              Principes
            </h2>
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="font-display text-sm text-foreground">Irréversibilité</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Ce qui est inscrit reste inscrit. Le système refuse la plasticité 
                  du numérique qui permet tout d'effacer.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-sm text-foreground">Silence</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Pas de notifications, pas de rappels, pas d'incitations. 
                  L'espace existe, c'est à l'utilisateur de décider d'y entrer.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-sm text-foreground">Lenteur</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  Certaines actions imposent des délais. Le temps n'est pas 
                  une ressource à optimiser mais une dimension à habiter.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-sm text-foreground">Non-utilité</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  L'absence de fonctionnalités est une décision de design. 
                  Le succès n'est pas mesuré par l'usage mais par la justesse.
                </p>
              </div>
            </div>
          </section>

          {/* Territoires */}
          <section className="space-y-4">
            <h2 className="font-display text-xs tracking-[0.3em] uppercase text-primary">
              Les Quatre Territoires
            </h2>
            <div className="grid gap-4">
              <Link 
                to="/irreversa" 
                className="block p-4 border border-border hover:border-primary/30 transition-colors group"
              >
                <span className="font-display text-sm text-foreground group-hover:text-primary transition-colors">
                  IRREVERSA
                </span>
                <span className="text-muted-foreground font-body text-sm ml-3">
                  — Les seuils que l'on franchit
                </span>
              </Link>
              <Link 
                to="/nulla" 
                className="block p-4 border border-border hover:border-primary/30 transition-colors group"
              >
                <span className="font-display text-sm text-foreground group-hover:text-primary transition-colors">
                  NULLA
                </span>
                <span className="text-muted-foreground font-body text-sm ml-3">
                  — Les absences qui structurent
                </span>
              </Link>
              <Link 
                to="/thresh" 
                className="block p-4 border border-border hover:border-primary/30 transition-colors group"
              >
                <span className="font-display text-sm text-foreground group-hover:text-primary transition-colors">
                  THRESH
                </span>
                <span className="text-muted-foreground font-body text-sm ml-3">
                  — Les seuils ressentis, non mesurés
                </span>
              </Link>
              <Link 
                to="/silva" 
                className="block p-4 border border-border hover:border-primary/30 transition-colors group"
              >
                <span className="font-display text-sm text-foreground group-hover:text-primary transition-colors">
                  SILVA
                </span>
                <span className="text-muted-foreground font-body text-sm ml-3">
                  — Le milieu, l'espace qui ne fait rien
                </span>
              </Link>
            </div>
          </section>

          {/* Footer note */}
          <footer className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground/60 font-body text-center">
              Pour ceux qui acceptent que certaines choses ne se corrigent pas.
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
});

About.displayName = 'About';

export default About;
