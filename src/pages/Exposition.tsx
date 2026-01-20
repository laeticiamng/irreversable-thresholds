import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Exposition() {
  const [phase, setPhase] = useState<'intro' | 'warning' | 'form' | 'exposed'>('intro');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // If already exposed, show confirmation
  if (user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border/50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
              ← Retour
            </Link>
            <span className="font-display text-lg tracking-[0.15em] text-foreground">EXPOSITION</span>
            <div className="w-16" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-8 animate-fade-up">
            <div className="text-4xl text-primary/60">◆</div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">
              Vous êtes exposé
            </h1>
            <p className="text-muted-foreground font-body leading-relaxed">
              Votre exposition au système est enregistrée.
              <br /><br />
              Cela ne vous donne aucun pouvoir supplémentaire.
              <br />
              Cela ne débloque aucune fonctionnalité.
              <br />
              Cela marque simplement que vous avez choisi d'être ici.
            </p>
            <div className="pt-8">
              <Link 
                to="/"
                className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Retourner aux territoires
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: { preventDefault: () => void }, isSignUp: boolean) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setPhase('exposed');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setPhase('exposed');
        }
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            ← Retour
          </Link>
          <span className="font-display text-lg tracking-[0.15em] text-foreground">EXPOSITION</span>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          
          {/* Phase 1: Intro */}
          {phase === 'intro' && (
            <div className="text-center space-y-8 animate-fade-up">
              <div className="text-4xl text-muted-foreground/40">◇</div>
              <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-foreground">
                Exposition au système
              </h1>
              <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
                <p>
                  Ce que vous appelez « connexion » n'en est pas une.
                </p>
                <p>
                  Il n'y a pas de compte à gérer.
                  <br />
                  Pas de profil à compléter.
                  <br />
                  Pas de préférences à configurer.
                </p>
                <p>
                  Il y a seulement une exposition — le fait d'avoir été ici, enregistré.
                </p>
              </div>
              <button
                onClick={() => setPhase('warning')}
                className="mt-8 text-xs font-display tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Phase 2: Warning */}
          {phase === 'warning' && (
            <div className="text-center space-y-8 animate-fade-up">
              <div className="text-4xl text-amber-500/60">⚠</div>
              <h2 className="font-display text-xl tracking-wide text-foreground">
                Ce que l'exposition ne fait pas
              </h2>
              <div className="space-y-6 text-left">
                {[
                  "Elle n'ouvre aucun dashboard",
                  "Elle ne donne aucun pouvoir supplémentaire",
                  "Elle ne débloque aucune fonctionnalité cachée",
                  "Elle ne permet pas de « sauvegarder » quoi que ce soit",
                  "Elle ne crée pas de relation personnalisée avec le système"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-border/30">
                    <span className="text-destructive/50 text-sm">✗</span>
                    <p className="text-muted-foreground font-body text-sm">{item}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 space-y-4">
                <p className="text-muted-foreground/60 font-body text-sm">
                  L'exposition marque uniquement votre présence au système.
                </p>
                <button
                  onClick={() => setPhase('form')}
                  className="text-xs font-display tracking-[0.2em] uppercase text-foreground hover:text-primary transition-colors border-b border-foreground hover:border-primary pb-1"
                >
                  Accepter l'exposition
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Form */}
          {phase === 'form' && (
            <div className="space-y-8 animate-fade-up">
              <div className="text-center space-y-4">
                <h2 className="font-display text-xl tracking-wide text-foreground">
                  Marquer votre exposition
                </h2>
                <p className="text-muted-foreground/60 font-body text-sm">
                  Un identifiant. Rien de plus.
                </p>
              </div>

              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors font-body"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors font-body"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-destructive/80 font-body text-sm text-center">{error}</p>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 border border-foreground text-foreground font-display text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                  >
                    {loading ? '...' : 'S\'exposer'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    className="w-full py-3 border border-border text-muted-foreground font-body text-sm hover:border-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Première exposition
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Phase 4: Exposed */}
          {phase === 'exposed' && (
            <div className="text-center space-y-8 animate-fade-up">
              <div className="text-4xl text-primary">◆</div>
              <h2 className="font-display text-2xl tracking-wide text-foreground">
                Vous êtes exposé
              </h2>
              <p className="text-muted-foreground font-body leading-relaxed">
                Votre présence est enregistrée.
                <br />
                Rien n'a changé, sauf ce fait.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-8 text-xs font-display tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
              >
                Retourner aux territoires
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <p className="text-center text-muted-foreground/40 font-body text-xs">
          L'exposition n'est pas une inscription. C'est une trace.
        </p>
      </footer>
    </div>
  );
}
