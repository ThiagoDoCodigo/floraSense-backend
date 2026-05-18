import { User } from "../users/models/user.model";
import { IAuthService } from "./auth.interface";

export class AuthService implements IAuthService {
  public async findUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  public async findUserById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }
}
