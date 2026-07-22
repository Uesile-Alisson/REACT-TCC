import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: [
        'src/api/api-error.ts',
        'src/config/navigation.ts',
        'src/hooks/useProcessActions.ts',
        'src/hooks/useProcessOperationalState.ts',
        'src/hooks/useProcessPrecheck.ts',
        'src/services/processos.service.ts',
        'src/services/configuracoes-sensores.service.ts',
        'src/services/mqtt-hardware.service.ts',
        'src/services/realtime/socket-events.ts',
        'src/services/realtime/socket-client.ts',
      ],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70,
      },
    },
  },
})
