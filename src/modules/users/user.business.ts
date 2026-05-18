import bcrypt from "bcrypt";
import { UsersService } from "./user.service";
import { IUsersBusiness } from "./user.interface";
import {
  AdminCreateUserDTO,
  PublicCreateUserDTO,
  PaginatedResponse,
  UpdateUserSelfDTO,
  UpdateUserAdminDTO,
  UserResponseDTO,
  ListUsersParams,
  UserRole,
} from "./user.types";
import { User } from "./models/user.model";
import { handleSequelizeError } from "../../utils/errors/handleSequelizeError";
import { CustomError } from "../../utils/errors/CustomError";

export class UsersBusiness implements IUsersBusiness {
  private readonly usersService: UsersService;
  private readonly SALT_ROUNDS = 10;

  constructor(usersService: UsersService) {
    this.usersService = usersService;
  }

  private formatResponse(user: User): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  public async createAdminUser(
    data: AdminCreateUserDTO,
  ): Promise<UserResponseDTO> {
    try {
      const emailExists = await this.usersService.checkExistenceByEmail(
        data.email,
      );
      if (emailExists) {
        throw new CustomError("Este e-mail já está em uso.", 409);
      }

      if (!data.password) {
        throw new CustomError("A senha é obrigatória.", 400);
      }

      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);
      const user = await this.usersService.create({
        ...data,
        password: hashedPassword,
      });

      return this.formatResponse(user);
    } catch (err) {
      handleSequelizeError(err, "Criação de Usuário Administrador");
    }
  }

  public async createPublicUser(
    data: PublicCreateUserDTO,
  ): Promise<UserResponseDTO> {
    try {
      const emailExists = await this.usersService.checkExistenceByEmail(
        data.email,
      );
      if (emailExists) {
        throw new CustomError("Este e-mail já está em uso.", 409);
      }

      if (!data.password) {
        throw new CustomError("A senha é obrigatória.", 400);
      }

      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);
      const user = await this.usersService.create({
        ...data,
        password: hashedPassword,
        role: UserRole.USER,
      });

      return this.formatResponse(user);
    } catch (err) {
      handleSequelizeError(err, "Criação de Usuário Público");
    }
  }

  public async updateUserByAdmin(
    userId: string,
    id: string,
    data: UpdateUserAdminDTO,
  ): Promise<UserResponseDTO> {
    try {
      const targetUser = await this.usersService.findById(id);
      if (!targetUser) {
        throw new CustomError("Usuário não encontrado.", 404);
      }

      if (targetUser.role === UserRole.ADMIN && userId !== id) {
        throw new CustomError(
          "Administradores não podem modificar contas de outros administradores.",
          403,
        );
      }

      if (data.email && data.email !== targetUser.email) {
        const emailExists = await this.usersService.checkExistenceByEmail(
          data.email,
        );
        if (emailExists) {
          throw new CustomError(
            "Este e-mail já está em uso por outro usuário.",
            409,
          );
        }
      }

      const updateData = { ...data };
      if (updateData.password) {
        updateData.password = await bcrypt.hash(
          updateData.password,
          this.SALT_ROUNDS,
        );
      }

      const [affectedCount, [updatedUser]] = await this.usersService.update(
        id,
        updateData,
      );

      if (affectedCount === 0) {
        throw new CustomError("Falha ao atualizar o usuário.", 500);
      }

      return this.formatResponse(updatedUser);
    } catch (err) {
      handleSequelizeError(err, "Atualização de Usuário pelo Admin");
    }
  }

  public async updateSelf(
    userId: string,
    data: UpdateUserSelfDTO,
  ): Promise<UserResponseDTO> {
    try {
      const targetUser = await this.usersService.findById(userId);
      if (!targetUser) {
        throw new CustomError("Sua conta não foi encontrada.", 404);
      }

      if (data.email && data.email !== targetUser.email) {
        const emailExists = await this.usersService.checkExistenceByEmail(
          data.email,
        );
        if (emailExists) {
          throw new CustomError("Este e-mail já está em uso.", 409);
        }
      }

      const updateData = { ...data };

      const [affectedCount, [updatedUser]] = await this.usersService.update(
        userId,
        updateData,
      );

      if (affectedCount === 0) {
        throw new CustomError("Falha ao atualizar sua conta.", 500);
      }

      return this.formatResponse(updatedUser);
    } catch (err) {
      handleSequelizeError(err, "Atualização de Conta Pessoal");
    }
  }

  public async getUsersPaginated(
    params: ListUsersParams,
  ): Promise<PaginatedResponse<UserResponseDTO>> {
    try {
      const { rows, count } = await this.usersService.findAllPaginated(params);

      const totalPages = Math.ceil(count / params.limit);

      return {
        data: rows.map((user) => this.formatResponse(user)),
        limit: params.limit,
        page: params.page,
        totalPages,
        total: count,
      };
    } catch (err) {
      handleSequelizeError(err, "Listagem de Usuários");
    }
  }

  public async deleteUserByAdmin(userId: string, id: string): Promise<void> {
    try {
      const targetUser = await this.usersService.findById(id);
      if (!targetUser) {
        throw new CustomError("Usuário não encontrado.", 404);
      }

      if (userId === id) {
        throw new CustomError("Não é possivel excluir a sua conta.", 403);
      }

      if (targetUser.role === UserRole.ADMIN) {
        throw new CustomError(
          "Administradores não podem excluir contas de outros administradores.",
          403,
        );
      }

      await this.usersService.delete(id);
    } catch (err) {
      handleSequelizeError(err, "Exclusão de Usuário");
    }
  }

  public async getMe(userId: string): Promise<UserResponseDTO> {
    try {
      const user = await this.usersService.findById(userId);

      if (!user) {
        throw new CustomError("Usuário não encontrado.", 404);
      }

      return this.formatResponse(user);
    } catch (err) {
      handleSequelizeError(err, "Busca de Perfil");
    }
  }
}
