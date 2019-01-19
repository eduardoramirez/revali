module.exports = {
  moduleNameMapper: {
    'revali/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  coverageDirectory: './coverage/',
  collectCoverageFrom: ['src/**/*.ts', '!**/*.d.ts', '!**/__tests__/**', '!testUtils.ts'],
  globals: {
    'ts-jest': {
      tsConfig: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: false,
        noFallthroughCasesInSwitch: true,
      },
    },
  },
}
