import type { Config } from 'jest';
import baseConfig from './jest.config';

/**
 * Configuração para Testes UNITÁRIOS
 * - Testa uma única função/classe de forma isolada
 * - Dependências externas (BD, APIs) são sempre mockadas
 * - Roda muito rápido
 */
const unitConfig: Config = {
  ...baseConfig,

  displayName: 'unit',

  // Localiza os testes dentro de src/ (colocados junto ao código)
  // OU dentro de test/unit/ (pasta separada)
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/unit/**/*.spec.ts',
  ],
};

export default unitConfig;
