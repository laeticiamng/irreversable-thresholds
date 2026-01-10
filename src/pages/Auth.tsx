import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Cet email est déjà utilisé');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Email ou mot de passe incorrect');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl tracking-wide text-foreground">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            {isSignUp 
              ? 'Entrez dans l\'espace de l\'irréversible' 
              : 'Accédez à vos seuils et absences'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-body"
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
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-border py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-body"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 border border-destructive/50 bg-destructive/10 text-destructive text-sm font-body">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button 
            type="submit" 
            variant="monument" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Chargement...' : (isSignUp ? 'Créer le compte' : 'Entrer')}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            {isSignUp 
              ? 'Déjà un compte ? Se connecter' 
              : 'Pas encore de compte ? S\'inscrire'
            }
          </button>
        </div>

        {/* Back to home */}
        <div className="text-center pt-8">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
}
