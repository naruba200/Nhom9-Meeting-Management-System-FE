import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: [
      'src/app/guards/auth.guard.spec.ts',
      'src/app/interceptors/jwt.interceptor.spec.ts',
      'src/app/services/auth.service.spec.ts',
    ],
  },
});
