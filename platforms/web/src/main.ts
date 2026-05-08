import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { TRAILMATE_KEY, useTrailmateCore } from './composables/use-trailmate-core'

async function bootstrap(): Promise<void> {
  const app = createApp(App)
  const services = useTrailmateCore()
  await services.initialize()

  app.provide(TRAILMATE_KEY, services)
  app.mount('#app')
}

bootstrap().catch((error) => {
  console.error('[trailmate] failed to bootstrap app', error)

  const root = document.getElementById('app')
  if (root) {
    root.innerHTML = `
      <div style="padding: 24px; font-family: Inter, sans-serif;">
        <h1 style="margin-bottom: 8px;">Trailmate failed to start</h1>
        <p>Please check the console for bootstrap details.</p>
      </div>
    `
  }
})
