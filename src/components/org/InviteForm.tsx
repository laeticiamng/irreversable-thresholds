import { useState } from 'react';
import { Mail, Send, X, Clock, Copy, Check } from 'lucide-react';
import { Invitation, OrgRole, ORG_ROLE_LABELS } from '@/types/organization';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InviteFormProps {
  invitations: Invitation[];
  onInvite: (email: string, role: OrgRole) => Promise<void>;
  onCancel: (invitationId: string) => void;
  onResend: (invitationId: string) => void;
  isLoading?: boolean;
}

export function InviteForm({ invitations, onInvite, onCancel, onResend, isLoading }: InviteFormProps) {
  const { currentOrganization, canManageMembers } = useOrganizationContext();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('member');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await onInvite(email.trim(), role);
      setEmail('');
      setRole('member');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const copyInviteLink = (invitation: Invitation) => {
    const link = `${window.location.origin}/invite/${invitation.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(invitation.id);
    toast.success('Lien copié');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (!canManageMembers) return null;

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label htmlFor="email" className="sr-only">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
          <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{ORG_ROLE_LABELS.admin}</SelectItem>
              <SelectItem value="member">{ORG_ROLE_LABELS.member}</SelectItem>
              <SelectItem value="viewer">{ORG_ROLE_LABELS.viewer}</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isLoading || !email.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Inviter
          </Button>
        </div>
      </form>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Invitations en attente ({invitations.length})
          </h4>
          <div className="space-y-2">
            {invitations.map((invitation) => {
              const expired = isExpired(invitation.expires_at);
              
              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="font-medium">{invitation.email}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {expired ? (
                          <span className="text-destructive">Expirée</span>
                        ) : (
                          <span>
                            Expire {formatDistanceToNow(new Date(invitation.expires_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {ORG_ROLE_LABELS[invitation.role]}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyInviteLink(invitation)}
                    >
                      {copiedId === invitation.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>

                    {expired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResend(invitation.id)}
                        disabled={isLoading}
                      >
                        Renvoyer
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onCancel(invitation.id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
