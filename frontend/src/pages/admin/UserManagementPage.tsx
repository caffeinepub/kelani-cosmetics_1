import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Search, UserPlus, UserMinus, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  useGetAllUserRoles,
  usePromoteToAdmin,
  useDemoteToUser,
} from '../../hooks/useAdminUserManagement';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAdminVerification } from '../../hooks/useAdminVerification';
import AccessDenied from '../../components/admin/AccessDenied';
import { reportErrorWithToast, reportSuccessWithToast } from '../../utils/reportErrorWithToast';

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const { isAdmin } = useAdminVerification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPrincipalId, setNewPrincipalId] = useState('');
  const [principalError, setPrincipalError] = useState('');
  const [copiedPrincipal, setCopiedPrincipal] = useState<string | null>(null);

  // Clear query cache on unmount
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['user-roles'], exact: false });
    };
  }, [queryClient]);

  // Fetch user roles
  const { data: users = [], isLoading } = useGetAllUserRoles();
  const promoteMutation = usePromoteToAdmin();
  const demoteMutation = useDemoteToUser();

  // Show access denied if not admin
  if (!isAdmin) {
    return <AccessDenied />;
  }

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    const principalText = user.principal.toString();
    const query = searchQuery.toLowerCase();
    return principalText.toLowerCase().includes(query) || user.role.toLowerCase().includes(query);
  });

  const handleCopyPrincipal = async (principalText: string) => {
    try {
      await navigator.clipboard.writeText(principalText);
      setCopiedPrincipal(principalText);
      setTimeout(() => setCopiedPrincipal(null), 2000);
      reportSuccessWithToast('Principal ID copiado al portapapeles');
    } catch (error) {
      reportErrorWithToast(error, 'Error al copiar Principal ID');
    }
  };

  const validatePrincipalId = (principalId: string): boolean => {
    if (!principalId.trim()) {
      setPrincipalError('El Principal ID es requerido');
      return false;
    }

    try {
      // Basic validation: Principal IDs are base32-encoded strings with dashes
      const principalRegex = /^[a-z0-9-]+$/;
      if (!principalRegex.test(principalId)) {
        setPrincipalError('Formato de Principal ID inválido');
        return false;
      }

      setPrincipalError('');
      return true;
    } catch (error) {
      setPrincipalError('Principal ID inválido');
      return false;
    }
  };

  const handleAddAdmin = async () => {
    if (!validatePrincipalId(newPrincipalId)) return;

    try {
      await promoteMutation.mutateAsync(newPrincipalId.trim());
      setIsAddModalOpen(false);
      setNewPrincipalId('');
      setPrincipalError('');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handlePromote = async (principalText: string) => {
    try {
      await promoteMutation.mutateAsync(principalText);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDemote = async (principalText: string) => {
    try {
      await demoteMutation.mutateAsync(principalText);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const currentPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">
              Administra los roles de los usuarios
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar Admin
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por Principal ID o rol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Cargando usuarios administradores...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Principal ID</TableHead>
                <TableHead className="w-32">Rol</TableHead>
                <TableHead className="w-32 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const principalText = user.principal.toString();
                const isCurrentUser = principalText === currentPrincipal;
                const isCopied = copiedPrincipal === principalText;

                return (
                  <TableRow key={principalText}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                          {principalText}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyPrincipal(principalText)}
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="sr-only">Copiar Principal ID</span>
                        </Button>
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2">
                            Tú
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isCurrentUser && (
                        <div className="flex justify-end gap-2">
                          {user.role === 'admin' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleDemote(principalText)}
                              disabled={demoteMutation.isPending}
                            >
                              <UserMinus className="h-4 w-4" />
                              Degradar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handlePromote(principalText)}
                              disabled={promoteMutation.isPending}
                            >
                              <UserPlus className="h-4 w-4" />
                              Promover
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Admin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Administrador</DialogTitle>
            <DialogDescription>
              Ingresa el Principal ID del usuario que deseas promover a administrador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="principalId">
                Principal ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="principalId"
                type="text"
                value={newPrincipalId}
                onChange={(e) => {
                  setNewPrincipalId(e.target.value);
                  setPrincipalError('');
                }}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                className={principalError ? 'border-destructive' : ''}
              />
              {principalError && (
                <p className="text-sm text-destructive">{principalError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                El Principal ID es un identificador único del usuario en Internet Identity
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewPrincipalId('');
                setPrincipalError('');
              }}
              disabled={promoteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleAddAdmin}
              disabled={promoteMutation.isPending}
            >
              {promoteMutation.isPending ? 'Agregando...' : 'Agregar Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
