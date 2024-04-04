import { mergeConfig } from 'vite'
import baseConig from './vite.config.base'

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      host: '0.0.0.0',
      fs: {
        strict: true,
      },
    },
    plugins: [],
  },
  baseConig
)
