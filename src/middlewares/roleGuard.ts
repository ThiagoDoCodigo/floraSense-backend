import { FastifyRequest, FastifyReply } from "fastify";
import { UserRole } from "../modules/users/user.types";

const roleTranslations: Record<UserRole, string> = {
  [UserRole.ADMIN]: "administradores",
  [UserRole.USER]: "usuários",
};

function formatList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

export function requireRole(
  allowedRoles: UserRole[],
  actionDescription: string,
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.authUser;

    if (!user || !allowedRoles.includes(user.role as UserRole)) {
      const translatedRoles = allowedRoles.map(
        (role) => roleTranslations[role] ?? role,
      );
      const rolesString = formatList(translatedRoles);
      const message = `Apenas ${rolesString} têm permissão para ${actionDescription}.`;

      return reply.status(403).send({ message });
    }
  };
}
