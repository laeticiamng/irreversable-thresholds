import { Link } from 'react-router-dom';

interface TerritoryPageProps {
  territory: 'IRREVERSA' | 'NULLA' | 'THRESH' | 'SILVA';
  manifesto: string;
  definition: string;
  notThis: string[];
  digitalObject: {
    title: string;
    description: string;
  };
  example: {
    title: string;
    description: string;
  };
  symbol?: string;
  accentClass?: string;
  operationalLink?: {
    path: string;
    label: string;
  };
}

const territoryColors: Record<string, { text: string; border: string; bg: string }> = {
  IRREVERSA: { text: 'text-primary', border: 'border-primary/20', bg: 'hover:bg-primary/5' },
  NULLA: { text: 'text-nulla', border: 'border-nulla/20', bg: 'hover:bg-nulla/5' },
  THRESH: { text: 'text-amber-500', border: 'border-amber-500/20', bg: 'hover:bg-amber-500/5' },
  SILVA: { text: 'text-silva', border: 'border-silva/20', bg: 'hover:bg-silva/5' },
};

export default function TerritoryPage({
  territory,
  manifesto,
  definition,
  notThis,
  digitalObject,
  example,
  symbol = '◆',
  operationalLink,
}: TerritoryPageProps) {
  const colors = territoryColors[territory];
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link 
            to="/"
            className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </Link>
          <span className={`font-display text-lg tracking-[0.15em] ${colors.text}`}>
            {territory}
          </span>
          <div className="w-16" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Symbol & Manifesto */}
          <section className="text-center space-y-8 animate-fade-up">
            <div className={`text-5xl sm:text-6xl ${colors.text} opacity-60`}>
              {symbol}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wide text-foreground">
              {territory}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-body italic max-w-lg mx-auto leading-relaxed">
              "{manifesto}"
            </p>
          </section>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <span className="w-12 sm:w-16 h-px bg-border" />
            <span className="text-muted-foreground/50 text-xs font-display tracking-[0.3em]">DÉFINITION</span>
            <span className="w-12 sm:w-16 h-px bg-border" />
          </div>

          {/* Definition */}
          <section className="space-y-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <p className="text-foreground font-body text-base sm:text-lg leading-relaxed text-center">
              {definition}
            </p>
          </section>

          {/* What this is NOT */}
          <section className="space-y-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-xs font-display tracking-[0.3em] uppercase text-muted-foreground/60 text-center">
              Ce que ce territoire n'est pas
            </h2>
            <div className="space-y-3">
              {notThis.map((item, index) => (
                <div 
                  key={index}
                  className={`p-4 border ${colors.border} ${colors.bg} transition-colors duration-500`}
                >
                  <p className="text-muted-foreground font-body text-sm flex items-start gap-3">
                    <span className="text-destructive/60 font-display">✗</span>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Digital Object */}
          <section className="space-y-6 animate-fade-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-center gap-4">
              <span className="w-8 h-px bg-border" />
              <span className="text-muted-foreground/50 text-xs font-display tracking-[0.3em]">OBJET NUMÉRIQUE</span>
              <span className="w-8 h-px bg-border" />
            </div>
            <div className={`p-6 sm:p-8 border ${colors.border} bg-card/30`}>
              <h3 className={`font-display text-lg tracking-wide ${colors.text} mb-4`}>
                {digitalObject.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {digitalObject.description}
              </p>
            </div>
          </section>

          {/* Example */}
          <section className="space-y-6 animate-fade-up" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-center gap-4">
              <span className="w-8 h-px bg-border" />
              <span className="text-muted-foreground/50 text-xs font-display tracking-[0.3em]">EXEMPLE</span>
              <span className="w-8 h-px bg-border" />
            </div>
            <div className="p-6 sm:p-8 border border-border/30 bg-muted/10">
              <p className="text-muted-foreground/80 font-body text-sm italic leading-relaxed">
                <span className="font-display not-italic text-foreground/70">{example.title}</span>
                <br /><br />
                {example.description}
              </p>
            </div>
          </section>

          {/* Silent footer */}
          <section className="pt-8 text-center space-y-6">
            <p className="text-muted-foreground/40 font-body text-xs">
              Ce territoire existe. C'est tout ce qu'il promet.
            </p>
            
            {/* Discrete operational link - only for exposed users */}
            {operationalLink && (
              <Link
                to={operationalLink.path}
                className="inline-block text-xs font-body text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors border-b border-transparent hover:border-muted-foreground/30"
              >
                {operationalLink.label}
              </Link>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link 
            to="/manifesto"
            className="text-xs font-body text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Manifeste
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            {['IRREVERSA', 'NULLA', 'THRESH', 'SILVA'].filter(t => t !== territory).map(t => (
              <Link
                key={t}
                to={`/${t.toLowerCase()}`}
                className="text-xs font-display tracking-wider text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                {t}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
