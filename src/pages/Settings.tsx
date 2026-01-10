import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GlobalNav } from '@/components/GlobalNav';
import { ExportBackup } from '@/components/exports/ExportBackup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Palette,
  Layout,
  Bell,
  User,
  Monitor,
  Moon,
  Sun,
  Zap,
  Volume2,
  Mail,
  Compass,
  Database
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, updateProfile } = useProfile(user?.id);
  const { preferences, isLoading: prefsLoading, ensurePreferences, updatePreferences } = useUserPreferences(user?.id);
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Local state for preferences
  const [displayDensity, setDisplayDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [showAnimations, setShowAnimations] = useState(true);
  const [defaultModule, setDefaultModule] = useState<'irreversa' | 'nulla' | 'thresh' | 'silva'>('irreversa');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/exposition');
    }
  }, [user, authLoading, navigate]);

  // Ensure preferences exist
  useEffect(() => {
    if (user && !prefsLoading && !preferences) {
      ensurePreferences.mutate();
    }
  }, [user, prefsLoading, preferences]);

  // Sync local state with preferences
  useEffect(() => {
    if (preferences) {
      setDisplayDensity(preferences.display_density as any);
      setShowAnimations(preferences.show_animations);
      setDefaultModule(preferences.default_module as any);
      setNotificationsEnabled(preferences.notifications_enabled);
      setEmailNotifications(preferences.email_notifications);
      setSoundEnabled(preferences.sound_enabled);
    }
  }, [preferences]);

  // Set display name from profile
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({ display_name: displayName.trim() });
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value });
      toast.success('Préférence mise à jour');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (authLoading || prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary/50 font-display tracking-widest text-sm animate-pulse">
          PARAMÈTRES
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      {/* Header */}
      <header className="border-b border-border/50 pt-16">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link to="/dashboard" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Retour au dashboard
          </Link>
          <h1 className="font-display text-2xl tracking-wide text-foreground">
            Paramètres
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personnalise ton expérience
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        
        {/* Profile Section */}
        <section className="p-6 border border-border/50 bg-card/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg tracking-wide">Profil</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm text-muted-foreground">
                Nom d'affichage
              </Label>
              <Input 
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton nom"
                className="border-border/30"
              />
            </div>

            <Button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="p-6 border border-border/50 bg-card/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
              <Palette className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg tracking-wide">Apparence</h2>
          </div>

          <div className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm">Thème</Label>
                <p className="text-xs text-muted-foreground">Choisis le mode d'affichage</p>
              </div>
              <div className="flex gap-1 p-1 border border-border/50 rounded-md">
                <Button
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Density */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Densité d'affichage
                </Label>
                <p className="text-xs text-muted-foreground">Espacement des éléments</p>
              </div>
              <Select
                value={displayDensity}
                onValueChange={(value: 'compact' | 'comfortable' | 'spacious') => {
                  setDisplayDensity(value);
                  handlePreferenceChange('display_density', value);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Confortable</SelectItem>
                  <SelectItem value="spacious">Spacieux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Animations
                </Label>
                <p className="text-xs text-muted-foreground">Activer les transitions animées</p>
              </div>
              <Switch
                checked={showAnimations}
                onCheckedChange={(checked) => {
                  setShowAnimations(checked);
                  handlePreferenceChange('show_animations', checked);
                }}
              />
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="p-6 border border-border/50 bg-card/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg tracking-wide">Notifications</h2>
          </div>

          <div className="space-y-6">
            {/* Push notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm">Notifications dans l'app</Label>
                <p className="text-xs text-muted-foreground">Recevoir des alertes dans l'application</p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(checked) => {
                  setNotificationsEnabled(checked);
                  handlePreferenceChange('notifications_enabled', checked);
                }}
              />
            </div>

            {/* Email notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Notifications par email
                </Label>
                <p className="text-xs text-muted-foreground">Recevoir des résumés par email</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked);
                  handlePreferenceChange('email_notifications', checked);
                }}
              />
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Sons
                </Label>
                <p className="text-xs text-muted-foreground">Jouer un son pour les notifications</p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={(checked) => {
                  setSoundEnabled(checked);
                  handlePreferenceChange('sound_enabled', checked);
                }}
              />
            </div>
          </div>
        </section>

        {/* Default Module Section */}
        <section className="p-6 border border-border/50 bg-card/20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
              <Compass className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg tracking-wide">Navigation</h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Module par défaut</Label>
              <p className="text-xs text-muted-foreground">Module ouvert à la connexion</p>
            </div>
            <Select
              value={defaultModule}
              onValueChange={(value: 'irreversa' | 'nulla' | 'thresh' | 'silva') => {
                setDefaultModule(value);
                handlePreferenceChange('default_module', value);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="irreversa">IRREVERSA</SelectItem>
                <SelectItem value="nulla">NULLA</SelectItem>
                <SelectItem value="thresh">THRESH</SelectItem>
                <SelectItem value="silva">SILVA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Data Backup Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
              <Database className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg tracking-wide">Données</h2>
          </div>
          <ExportBackup />
        </section>

        {/* Account Link */}
        <section className="p-6 border border-border/50 bg-card/20">
          <Link 
            to="/account" 
            className="flex items-center justify-between hover:text-primary transition-colors"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">Gérer le compte</p>
              <p className="text-xs text-muted-foreground">Abonnement, paiements, déconnexion</p>
            </div>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8">
          <p className="text-xs text-muted-foreground/50">
            Suite de lucidité. Aucune promesse. Aucune décision à ta place.
          </p>
        </footer>
      </main>
    </div>
  );
}
