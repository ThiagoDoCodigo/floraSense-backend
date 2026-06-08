import type { Config } from 'jest';


const baseConfig: Config = {
  testEnvironment: 'node',

  preset: 'ts-jest',

  globals: {
    'ts-jest': {
      tsconfig: {
        rootDir: '.',
        module: 'CommonJS',
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
        types: ['node', 'jest'],
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
        },
      },
    },
  },

  rootDir: '.',

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  moduleDirectories: ['node_modules', '<rootDir>'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': '<rootDir>/__mocks__/uuid.js',
  },


  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/app.ts',
    '!src/alimentar_rag.ts',
    '!src/data/**',
    '!src/config/**',
    '!src/**/migrations/**',
  ],

  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: './coverage',
};

export default baseConfig;
