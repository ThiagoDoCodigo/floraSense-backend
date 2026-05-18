import { User } from "./models/user.model";
import {
  AdminCreateUserDTO,
  PublicCreateUserDTO,
  UpdateUserSelfDTO,
  UpdateUserAdminDTO,
  ListUsersParams,
  UserResponseDTO,
  PaginatedResponse,
} from "./user.types";

export interface IUsersService {
  create(data: AdminCreateUserDTO | PublicCreateUserDTO): Promise<User>;
  update(
    id: string,
    data: UpdateUserSelfDTO | UpdateUserAdminDTO,
  ): Promise<[number, User[]]>;
  findById(id: string): Promise<User | null>;
  checkExistenceById(id: string): Promise<boolean>;
  checkExistenceByEmail(email: string): Promise<boolean>;
  findAllPaginated(
    params: ListUsersParams,
  ): Promise<{ rows: User[]; count: number }>;
  delete(id: string): Promise<number>;
}

export interface IUsersBusiness {
  createAdminUser(data: AdminCreateUserDTO): Promise<UserResponseDTO>;
  createPublicUser(data: PublicCreateUserDTO): Promise<UserResponseDTO>;
  updateUserByAdmin(
    userId: string,
    id: string,
    data: UpdateUserAdminDTO,
  ): Promise<UserResponseDTO>;
  updateSelf(userId: string, data: UpdateUserSelfDTO): Promise<UserResponseDTO>;
  getUsersPaginated(
    params: ListUsersParams,
  ): Promise<PaginatedResponse<UserResponseDTO>>;
  deleteUserByAdmin(userId: string, id: string): Promise<void>;
}
