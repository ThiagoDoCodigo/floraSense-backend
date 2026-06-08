import { CustomError } from '@/utils/errors/CustomError';

describe('CustomError tests', () => {
  it('deve testar o lancamento de erro customizado', () => {
    const callError = () => {
      throw new CustomError('Erro de teste', 400);
    };

    expect(callError).toThrow('Erro de teste');
  });

  it('deve testar os detalhes do erro', () => {
    const error = new CustomError('Erro', 404, { detail: 'not found' });
    expect(error.details).toEqual({ detail: 'not found' });
  });
});