import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr()
  ],
  // server: {
  //   host: '192.168.1.243',  // Ou use o seu IP local, como '192.168.x.x'
  //   port: 5173,        // Você pode alterar a porta se quiser
  // },
})
