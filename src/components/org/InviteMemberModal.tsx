import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mail, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInvitations } from '@/hooks/useInvitations';
import { OrgRole, ORG_ROLE_LABELS } from '@/types/organization';
import { toast } from 'sonner';
import { z } from 'zod';

interface InviteMemberModalProps {
  organizationId: string;
  trigger?: React.ReactNode;
}

const emailSchema = z.string().email('Email invalide');

export function InviteMemberModal({ organizationId, trigger }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>(['']);
  const [role, setRole] = useState<OrgRole>('member');
  const { createInvitation } = useInvitations(organizationId);

  const handleAddEmail = () => {
    if (emails.length < 10) {
      setEmails([...emails, '']);
    }
  };

  const handleRemoveEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = async () => {
    const validEmails = emails.filter(e => e.trim()).map(e => e.trim().toLowerCase());
    
    // Validate all emails
    const invalidEmails = validEmails.filter(e => !emailSchema.safeParse(e).success);
    if (invalidEmails.length > 0) {
      toast.error(`Emails invalides: ${invalidEmails.join(', ')}`);
      return;
    }

    if (validEmails.length === 0) {
      toast.error('Ajoute au moins un email');
      return;
    }

    // Send all invitations
    const results = await Promise.allSettled(
      validEmails.map(email => 
        createInvitation.mutateAsync({ email, role })
      )
    );

    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;

    if (successes > 0) {
      toast.success(`${successes} invitation(s) envoyée(s)`);
    }
    if (failures > 0) {
      toast.error(`${failures} invitation(s) échouée(s)`);
    }

    if (successes > 0) {
      setOpen(false);
      setEmails(['']);
      setRole('member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="font-display tracking-wider">
            <Plus className="w-4 h-4 mr-2" />
            Inviter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Inviter des membres</DialogTitle>
          <DialogDescription>
            Envoie des invitations par email à de nouveaux membres de ton organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Email inputs */}
          <div className="space-y-3">
            <Label className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
              Emails
            </Label>
            <AnimatePresence mode="popLayout">
              {emails.map((email, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {emails.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleRemoveEmail(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {emails.length < 10 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddEmail}
                className="text-muted-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un email
              </Button>
            )}
          </div>

          {/* Role selection */}
          <div className="space-y-2">
            <Label className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground">
              Rôle
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{ORG_ROLE_LABELS.admin}</SelectItem>
                <SelectItem value="member">{ORG_ROLE_LABELS.member}</SelectItem>
                <SelectItem value="viewer">{ORG_ROLE_LABELS.viewer}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground/60">
              {role === 'admin' && 'Peut gérer les membres et les paramètres'}
              {role === 'member' && 'Peut créer et modifier du contenu'}
              {role === 'viewer' && 'Peut uniquement consulter'}
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={createInvitation.isPending}
            className="w-full font-display tracking-wider"
          >
            {createInvitation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer les invitations
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
