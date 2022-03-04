module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  "transformIgnorePatterns": [
    "node_modules/(?!(@vetprovieh)/)"
  ],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^lib/(.*)$': '<rootDir>/dist/$1'
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    '^.+\\.jsx?$': 'babel-jest',
  },
};