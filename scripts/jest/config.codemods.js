'use strict';

module.exports = {
  globalSetup: require.resolve('./setupGlobal.js'),
  modulePathIgnorePatterns: [
    '<rootDir>/packages',
  ],
  testMatch: ['**/__tests__/**'],
  moduleFileExtensions: ['js', 'ts'],
  rootDir: process.cwd(),
  roots: ['<rootDir>/codemods'],
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
};
