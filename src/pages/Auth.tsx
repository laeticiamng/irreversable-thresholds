import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success('Email envoyé !', {
          description: 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.',
        });
      } else {
        // Validate
        const validation = authSchema.safeParse({ email, password });
        if (!validation.success) {
          setError(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        if (mode === 'signup') {
          const { error } = await signUp(email, password);
          if (error) {
            if (error.message.includes('already registered')) {
              setError('Cet email est déjà utilisé');
            } else {
              setError(error.message);
            }
          } else {
            toast.success('Compte créé !', {
              description: 'Tu es maintenant connecté.',
            });
            navigate('/onboarding');
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
            navigate('/dashboard');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Créer un compte';
      case 'forgot': return 'Mot de passe oublié';
      default: return 'Connexion';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Entre dans l\'espace de l\'irréversible';
      case 'forgot': return 'Reçois un lien pour réinitialiser ton mot de passe';
      default: return 'Accède à tes seuils et absences';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl tracking-wide text-foreground">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            {getSubtitle()}
          </p>
        </div>

        {/* Form */}
        {resetSent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Un email a été envoyé à <strong className="text-foreground">{email}</strong>
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setResetSent(false); setMode('login'); }}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Forgot password link */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 border border-destructive/50 bg-destructive/10 text-destructive text-sm font-body rounded">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Chargement...' : (
                mode === 'signup' ? 'Créer le compte' :
                mode === 'forgot' ? 'Envoyer le lien' : 'Se connecter'
              )}
            </Button>
          </form>
        )}

        {/* Toggle modes */}
        {!resetSent && (
          <div className="text-center space-y-3">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                ← Retour à la connexion
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
              >
                {mode === 'login' 
                  ? 'Pas encore de compte ? S\'inscrire' 
                  : 'Déjà un compte ? Se connecter'
                }
              </button>
            )}
          </div>
        )}

        {/* Back to home */}
        <div className="text-center pt-8">
          <Link
            to="/"
            className="text-xs font-display tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Retour
          </Link>
        </div>
      </div>
    </div>
  );
}
