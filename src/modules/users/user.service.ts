import { Op } from "sequelize";
import { User } from "./models/user.model";
import {
  AdminCreateUserDTO,
  PublicCreateUserDTO,
  UpdateUserSelfDTO,
  UpdateUserAdminDTO,
  ListUsersParams,
} from "./user.types";
import { IUsersService } from "./user.interface";

export class UsersService implements IUsersService {
  public async create(
    data: AdminCreateUserDTO | PublicCreateUserDTO,
  ): Promise<User> {
    return await User.create({ ...data });
  }

  public async checkExistenceByEmail(email: string): Promise<boolean> {
    const count = await User.count({ where: { email } });
    return count > 0;
  }

  public async checkExistenceById(id: string): Promise<boolean> {
    const count = await User.count({ where: { id } });
    return count > 0;
  }

  public async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  public async update(
    id: string,
    data: UpdateUserSelfDTO | UpdateUserAdminDTO,
  ): Promise<[number, User[]]> {
    return await User.update(data, {
      where: { id },
      returning: true,
    });
  }

  public async findAllPaginated(params: ListUsersParams) {
    const offset = (params.page - 1) * params.limit;
    const where: Record<string, unknown> = {};

    if (params.name) {
      where.name = { [Op.iLike]: `%${params.name}%` };
    }

    if (params.role) {
      where.role = params.role;
    }

    return await User.findAndCountAll({
      where,
      limit: params.limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  public async delete(id: string): Promise<number> {
    return await User.destroy({ where: { id } });
  }
}
