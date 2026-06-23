import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // TODO: CEO가 토스 콘솔 등록값으로 교체 (콘솔의 app identifier 고유키와 일치해야 함)
  appName: 'runners-discount',

  brand: {
    displayName: '러너스 디스카운트',
    primaryColor: '#A8E63D',
    icon: 'https://static.toss.im/appsintoss/51379/d4bd7baf-dfc5-4892-9989-65f09a68462a.png',
  },

  // 카카오맵 JS SDK 스크립트 동적 주입 허용을 위해 partner 타입 사용
  webViewProps: {
    type: 'partner',
  },

  // 빌드 산출물 디렉토리 (vite build outDir과 일치해야 함, 기본값 'dist')
  outdir: 'dist',

  permissions: ['geolocation'],

  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'npm run dev',
      // 기존 빌드 체인 유지 (sitemap → tsc -b → vite build)
      build: 'npm run sitemap && npx tsc -b && npx vite build',
    },
  },
});
