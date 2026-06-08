
require('ts-node').register({
  project: './tsconfig.test.json',
  transpileOnly: true,
});

module.exports = require('./jest.unit.config.ts').default;
