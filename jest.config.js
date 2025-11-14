/** @type {import('jest').Config} */
const jestConfig = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  transformIgnorePatterns: ['node_modules/(?!(next-auth|@auth|oauth4webapi|lucide-react)/)'],
  collectCoverageFrom: [
    'src/app/api/**/route.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/app/api/auth/**',
  ],
  reporters: ['default', 'jest-html-reporter'],
};

module.exports = jestConfig;
