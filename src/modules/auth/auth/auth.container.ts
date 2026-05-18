import { AuthService } from "./auth.service";
import { AuthBusiness } from "./auth.business";
import { AuthController } from "./auth.controller";

const authService = new AuthService();
const authBusiness = new AuthBusiness(authService);
export const authController = new AuthController(authBusiness);
