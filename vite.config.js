import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/korea-univ-game/', // 본인의 깃허브 리포지토리 이름으로 변경
})