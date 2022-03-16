import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    collectCoverage: true,
    clearMocks: true,
    preset: 'ts-jest',
    coverageDirectory: 'coverage',
    transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest'
    },
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/src/$1',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less)$': 'identity-obj-proxy'
    },

    coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
    modulePathIgnorePatterns: ['/dist/'],
    testPathIgnorePatterns: ['__tests__/(setup|testUtils).js'],
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!@pearone)'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json'
        }
    },
    maxWorkers: '100%',
    rootDir: './',
    moduleDirectories: ['node_modules', 'src']
};
export default config;
