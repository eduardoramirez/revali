module.exports = {
  moduleNameMapper: {
    'revali/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  coverageDirectory: './coverage/',
  collectCoverageFrom: ['src/**/*.ts', '!**/*.d.ts', '!**/__tests__/**', '!testUtils.ts'],
}
