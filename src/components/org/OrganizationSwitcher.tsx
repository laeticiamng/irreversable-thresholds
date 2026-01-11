import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Check, ChevronDown, Plus, User } from 'lucide-react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { ORG_PLAN_COLORS } from '@/types/organization';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function OrganizationSwitcher() {
  const navigate = useNavigate();
  const {
    currentOrganization,
    organizations,
    isPersonalMode,
    switchOrganization,
    isLoading,
  } = useOrganizationContext();

  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Building2 className="h-4 w-4" />
        <span className="hidden sm:inline">Chargement...</span>
      </Button>
    );
  }

  const handleSwitchToPersonal = () => {
    switchOrganization(null);
    setOpen(false);
  };

  const handleSwitchToOrg = (orgId: string) => {
    switchOrganization(orgId);
    setOpen(false);
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      navigate(`/org/${org.slug}`);
    }
  };

  const handleCreateOrg = () => {
    setOpen(false);
    navigate('/org/new');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 max-w-[200px]">
          {isPersonalMode ? (
            <>
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate hidden sm:inline">Personnel</span>
            </>
          ) : (
            <>
              <Avatar className="h-5 w-5">
                {currentOrganization?.logo_url && (
                  <AvatarImage src={currentOrganization.logo_url} />
                )}
                <AvatarFallback className="text-xs bg-primary/20">
                  {currentOrganization?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate hidden sm:inline">{currentOrganization?.name}</span>
              {currentOrganization && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-[10px] px-1 py-0 hidden md:inline-flex',
                    ORG_PLAN_COLORS[currentOrganization.plan]
                  )}
                >
                  {currentOrganization.plan}
                </Badge>
              )}
            </>
          )}
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {/* Personal mode option */}
        <DropdownMenuItem
          onClick={handleSwitchToPersonal}
          className="gap-2 cursor-pointer"
        >
          <User className="h-4 w-4" />
          <span className="flex-1">Personnel</span>
          {isPersonalMode && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        {organizations.length > 0 && <DropdownMenuSeparator />}

        {/* Organization list */}
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchToOrg(org.id)}
            className="gap-2 cursor-pointer"
          >
            <Avatar className="h-5 w-5">
              {org.logo_url && <AvatarImage src={org.logo_url} />}
              <AvatarFallback className="text-xs bg-primary/20">
                {org.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{org.name}</span>
            <Badge 
              variant="outline" 
              className={cn('text-[10px] px-1 py-0', ORG_PLAN_COLORS[org.plan])}
            >
              {org.plan}
            </Badge>
            {currentOrganization?.id === org.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Create new organization */}
        <DropdownMenuItem
          onClick={handleCreateOrg}
          className="gap-2 cursor-pointer text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
          <span>Créer une organisation</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
