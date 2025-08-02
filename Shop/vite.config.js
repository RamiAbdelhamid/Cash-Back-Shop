import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ✅ هذا التعديل المهم
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})