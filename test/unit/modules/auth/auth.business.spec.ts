import { AuthBusiness } from '@/modules/auth/auth.business';
import { AuthService } from '@/modules/auth/auth.service';
import { User } from '@/modules/users/models/user.model';
import bcrypt from 'bcrypt';

const authService = Object.create(AuthService.prototype);
const authBusiness = Object.create(AuthBusiness.prototype);
authBusiness.authService = authService;
authBusiness.generateTokens = AuthBusiness.prototype['generateTokens'];

describe('AuthBusiness tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve fazer login com sucesso', async () => {
    const mockUser = {
      id: '1',
      name: 'Junior',
      email: 'junior@example.com',
      password: 'hash',
      role: 'USER'
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

    const dummyFastify = {
      jwt: {
        sign: () => 'dummy_token'
      }
    } as any;

    const loginData = { email: 'junior@example.com', password: 'password123' };

    const result = await authBusiness.login(dummyFastify, loginData);

    expect(result.user.email).toBe('junior@example.com');
  });

  it('deve falhar login com email inexistente', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const dummyFastify = {} as any;
    const loginData = { email: 'wrong@example.com', password: 'password123' };

    await expect(authBusiness.login(dummyFastify, loginData)).rejects.toThrow('Usuário não encontrado.');
  });

  it('deve atualizar token (refresh token)', async () => {
    const mockUser = {
      id: '1',
      name: 'Junior',
      email: 'junior@example.com',
      role: 'USER'
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);

    const dummyFastify = {
      jwt: {
        verify: () => ({ id_user: '1', role: 'USER' }),
        sign: () => 'new_dummy_token'
      }
    } as any;

    const refreshData = { refreshToken: 'old_token' };

    const result = await authBusiness.refreshToken(dummyFastify, refreshData);

    expect(result.user.id).toBe('1');
  });
});
