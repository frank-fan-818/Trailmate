import type { ICore } from './core.interface'

export interface IPlugin {
  pluginId: string
  pluginName: string
  version: string
  dependencies?: string[]

  onInstall(core: ICore): void | Promise<void>
  onMount(core: ICore): void | Promise<void>
  onUnmount(core: ICore): void | Promise<void>
}