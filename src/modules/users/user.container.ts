import { UsersService } from "./user.service";
import { UsersBusiness } from "./user.business";
import { UsersController } from "./user.controller";

const usersService = new UsersService();
const usersBusiness = new UsersBusiness(usersService);
export const usersController = new UsersController(usersBusiness);
