/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@trailmate/adapters/mock-adapter' {
  import type { IPlugin } from '../../core'
  const MockAdapterModule: IPlugin
  export default MockAdapterModule
}
