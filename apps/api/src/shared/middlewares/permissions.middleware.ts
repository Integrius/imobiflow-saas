/**
 * Middleware de permissões baseado em roles
 *
 * Verifica se o usuário autenticado tem permissão para acessar determinado recurso
 * baseado em seu tipo (ADMIN, GESTOR, CORRETOR)
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

type UserType = 'ADMIN' | 'GESTOR' | 'CORRETOR';

/**
 * Hierarquia de permissões:
 *
 * ADMIN (nível 3):
 * - Gerenciar tudo no tenant (usuários, configurações, planos, etc)
 * - Criar, editar e excluir ADMINS, GESTORES e CORRETORES
 * - Acesso total a todos os recursos
 * - Ver métricas e relatórios gerenciais
 *
 * GESTOR (nível 2):
 * - Gerenciar leads, imóveis, negociações
 * - Criar e editar CORRETORES
 * - Ver relatórios e dashboard
 * - Não pode gerenciar ADMINS ou GESTORES
 * - Não pode alterar configurações críticas do tenant
 *
 * CORRETOR (nível 1):
 * - Ver e editar apenas seus próprios leads
 * - Ver imóveis disponíveis
 * - Gerenciar suas próprias negociações
 * - Não pode criar ou editar outros usuários
 * - Dashboard pessoal
 */

const roleHierarchy: Record<UserType, number> = {
  ADMIN: 3,
  GESTOR: 2,
  CORRETOR: 1
};

/**
 * Verifica se o usuário tem permissão mínima necessária
 *
 * @example
 * // Apenas ADMIN pode acessar
 * server.get('/admin-only', {
 *   preHandler: [authMiddleware, requireRole(['ADMIN'])]
 * }, handler)
 *
 * @example
 * // ADMIN e GESTOR podem acessar
 * server.get('/managers', {
 *   preHandler: [authMiddleware, requireRole(['ADMIN', 'GESTOR'])]
 * }, handler)
 */
export function requireRole(allowedRoles: UserType[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user) {
      return reply.status(401).send({
        error: 'Não autenticado',
        message: 'Você precisa estar autenticado para acessar este recurso'
      });
    }

    const userType = user.tipo as UserType;

    if (!allowedRoles.includes(userType)) {
      return reply.status(403).send({
        error: 'Permissão negada',
        message: `Este recurso requer permissão de: ${allowedRoles.join(' ou ')}`
      });
    }
  };
}

/**
 * Verifica se o usuário tem nível de permissão mínimo
 *
 * @example
 * // Apenas ADMIN (nível 3) pode acessar
 * server.delete('/users/:id', {
 *   preHandler: [authMiddleware, requireMinRole('ADMIN')]
 * }, handler)
 *
 * @example
 * // ADMIN e GESTOR podem acessar (nível >= 2)
 * server.get('/reports', {
 *   preHandler: [authMiddleware, requireMinRole('GESTOR')]
 * }, handler)
 */
export function requireMinRole(minRole: UserType) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user) {
      return reply.status(401).send({
        error: 'Não autenticado',
        message: 'Você precisa estar autenticado para acessar este recurso'
      });
    }

    const userType = user.tipo as UserType;
    const userLevel = roleHierarchy[userType];
    const requiredLevel = roleHierarchy[minRole];

    if (userLevel < requiredLevel) {
      return reply.status(403).send({
        error: 'Permissão negada',
        message: `Este recurso requer permissão mínima de: ${minRole}`
      });
    }
  };
}

/**
 * Verifica se o usuário é ADMIN
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Verifica se o usuário é ADMIN ou GESTOR
 */
export const requireManager = requireRole(['ADMIN', 'GESTOR']);

/**
 * Verifica se o usuário pode gerenciar outros usuários
 *
 * - ADMIN pode gerenciar qualquer tipo de usuário
 * - GESTOR pode criar/editar apenas CORRETORES
 * - CORRETOR não pode gerenciar ninguém
 */
export function canManageUser(managerType: UserType, targetType: UserType): boolean {
  const managerLevel = roleHierarchy[managerType];
  const targetLevel = roleHierarchy[targetType];

  // ADMIN pode gerenciar qualquer um
  if (managerType === 'ADMIN') {
    return true;
  }

  // GESTOR pode gerenciar apenas CORRETORES
  if (managerType === 'GESTOR' && targetType === 'CORRETOR') {
    return true;
  }

  // CORRETOR não pode gerenciar ninguém
  return false;
}

/**
 * Verifica se o usuário pode acessar recurso de outro usuário
 *
 * - ADMIN e GESTOR podem acessar recursos de qualquer usuário
 * - CORRETOR só pode acessar seus próprios recursos
 */
export function canAccessUserResource(
  currentUserId: string,
  resourceUserId: string,
  userType: UserType
): boolean {
  // ADMIN e GESTOR podem acessar qualquer recurso
  if (userType === 'ADMIN' || userType === 'GESTOR') {
    return true;
  }

  // CORRETOR só pode acessar seus próprios recursos
  return currentUserId === resourceUserId;
}

/**
 * Middleware que verifica se o usuário pode acessar recurso específico
 *
 * @example
 * // Verificar se pode editar lead de outro corretor
 * server.patch('/leads/:id', {
 *   preHandler: [
 *     authMiddleware,
 *     requireResourceOwnership('lead_id', 'corretor_id')
 *   ]
 * }, handler)
 */
export function requireResourceOwnership(resourceIdParam: string, ownerField: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!user) {
      return reply.status(401).send({
        error: 'Não autenticado'
      });
    }

    const userType = user.tipo as UserType;

    // ADMIN e GESTOR sempre têm acesso
    if (userType === 'ADMIN' || userType === 'GESTOR') {
      return;
    }

    // CORRETOR precisa ser o dono do recurso
    const params = request.params as any;
    const resourceId = params[resourceIdParam];

    if (!resourceId) {
      return reply.status(400).send({
        error: 'ID do recurso não fornecido'
      });
    }

    // Buscar o recurso e verificar ownership
    // Nota: Isso deve ser implementado no handler específico
    // Este middleware apenas sinaliza que a verificação é necessária
    (request as any).requiresOwnershipCheck = {
      resourceId,
      ownerField,
      userId: user.id
    };
  };
}

/**
 * Helper para verificar permissões em tempo de execução
 */
export const Permissions = {
  requireRole,
  requireMinRole,
  requireAdmin,
  requireManager,
  canManageUser,
  canAccessUserResource,
  requireResourceOwnership,

  /**
   * Verifica se usuário pode criar usuários
   */
  canCreateUser(userType: UserType, newUserType: UserType): boolean {
    return canManageUser(userType, newUserType);
  },

  /**
   * Verifica se usuário pode editar usuários
   */
  canEditUser(userType: UserType, targetUserType: UserType): boolean {
    return canManageUser(userType, targetUserType);
  },

  /**
   * Verifica se usuário pode deletar usuários
   */
  canDeleteUser(userType: UserType, targetUserType: UserType): boolean {
    // Apenas ADMIN pode deletar usuários
    return userType === 'ADMIN';
  },

  /**
   * Verifica se usuário pode ver dashboard geral
   */
  canViewDashboard(userType: UserType): boolean {
    return userType === 'ADMIN' || userType === 'GESTOR';
  },

  /**
   * Verifica se usuário pode alterar configurações do tenant
   */
  canEditTenantSettings(userType: UserType): boolean {
    return userType === 'ADMIN';
  }
};
