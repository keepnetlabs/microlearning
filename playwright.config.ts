import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    expect: { timeout: 5_000 },
    fullyParallel: true,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3000',
        locale: 'en-US',
        trace: 'on-first-retry',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'npm start',
        port: 3000,
        reuseExistingServer: true,
        timeout: 120_000,
    },
    projects: [
        {
            name: 'webkit-desktop',
            use: {
                browserName: 'webkit',
                viewport: { width: 1280, height: 800 },
            },
        },
        {
            name: 'webkit-iphone',
            use: {
                ...devices['iPhone 13'],
                browserName: 'webkit',
            },
        },
    ],
});

