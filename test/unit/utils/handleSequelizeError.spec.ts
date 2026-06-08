import { handleSequelizeError } from '@/utils/errors/handleSequelizeError';
import { UniqueConstraintError, ValidationError } from 'sequelize';

describe('handleSequelizeError tests', () => {
  it('deve tratar erro de unicidade', () => {
    const error = new UniqueConstraintError({ errors: [{ path: 'email' } as any] });
    expect(() => handleSequelizeError(error, 'User')).toThrow('Já existe um(a) user com o mesmo valor em: email.');
  });

  it('deve tratar erro de validacao', () => {
    const error = new ValidationError('Validation error', [{ message: 'invalid field' } as any]);
    expect(() => handleSequelizeError(error, 'Plant')).toThrow('Os dados fornecidos para plant são inválidos: invalid field.');
  });
});
