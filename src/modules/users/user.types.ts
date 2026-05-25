export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type PaginatedResponse<T> = {
  data: T[];
  limit: number;
  page: number;
  totalPages: number;
  total: number;
};

export type AdminCreateUserDTO = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type PublicCreateUserDTO = Omit<AdminCreateUserDTO, "role">;

export type UpdateUserAdminDTO = Partial<Omit<AdminCreateUserDTO, "role">>;

export type UpdateUserSelfDTO = Partial<
  Omit<AdminCreateUserDTO, "role" | "password">
>;

export type UserResponseDTO = Omit<AdminCreateUserDTO, "password"> & {
  id: string;
  created_at: Date;
  updated_at: Date;
};

export type ListUsersParams = {
  page: number;
  limit: number;
  name?: string;
  role?: string;
};

export type ChangePasswordDTO = {
  currentPassword: string;
  newPassword: string;
};
