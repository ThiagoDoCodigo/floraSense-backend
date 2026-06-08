import { UsersBusiness } from '@/modules/users/user.business';
import { UsersService } from '@/modules/users/user.service';
import { User } from '@/modules/users/models/user.model';
import bcrypt from 'bcrypt';

const usersService = Object.create(UsersService.prototype);
const usersBusiness = Object.create(UsersBusiness.prototype);
usersBusiness.usersService = usersService;
usersBusiness.formatResponse = UsersBusiness.prototype['formatResponse'];
usersBusiness.SALT_ROUNDS = 10;

describe('UsersBusiness tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve retornar o proprio usuario', async () => {
    const mockUser = {
      id: '1',
      name: 'Junior',
      email: 'junior@example.com',
      role: 'USER'
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);

    const result = await usersBusiness.getMe('1');

    expect(result.name).toBe('Junior');
  });

  it('deve falhar se usuario nao existir no getMe', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    await expect(usersBusiness.getMe('999')).rejects.toThrow('Usuário não encontrado.');
  });

  it('deve deletar usuario caso seja admin', async () => {
    const mockUser = {
      id: '2',
      role: 'USER'
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);
    jest.spyOn(User, 'destroy').mockResolvedValue(1);

    await usersBusiness.deleteUserByAdmin('1', '2');

    expect(User.destroy).toHaveBeenCalled();
  });

  it('deve falhar se admin tentar deletar outro admin', async () => {
    const mockUser = {
      id: '2',
      role: 'ADMIN'
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);

    await expect(usersBusiness.deleteUserByAdmin('1', '2')).rejects.toThrow('Administradores não podem excluir contas de outros administradores.');
  });

  it('deve alterar a senha com sucesso', async () => {
    const mockUser = {
      id: '1',
      password: 'old_hashed_password'
    };

    jest.spyOn(User, 'unscoped').mockReturnValue({
      findByPk: jest.fn().mockResolvedValue(mockUser)
    } as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'new_hashed_password');
    jest.spyOn(User, 'update').mockResolvedValue([1, []] as any);

    const changeData = { currentPassword: 'old_password', newPassword: 'new_password' };

    await usersBusiness.changePassword('1', changeData);

    expect(User.update).toHaveBeenCalled();
  });

  it('deve atualizar o proprio perfil', async () => {
    const mockUser = {
      id: '1',
      email: 'junior@example.com'
    };

    const mockUpdatedUser = {
      id: '1',
      name: 'Junior Updated'
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);
    jest.spyOn(User, 'count').mockResolvedValue(0); 
    jest.spyOn(User, 'update').mockResolvedValue([1, [mockUpdatedUser]] as any);

    const updateData = { name: 'Junior Updated' };

    const result = await usersBusiness.updateSelf('1', updateData);

    expect(result.name).toBe('Junior Updated');
  });
});
