/** @type {import('jest').Config} */
const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(lucide-react)/)'],
  reporters: ['default', 'jest-html-reporter'],
};

module.exports = jestConfig;
