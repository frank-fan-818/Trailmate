import type { IPlugin } from './interfaces/plugin.interface'
import type { ICore } from './interfaces/core.interface'

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map()
  private installedPlugins: Set<string> = new Set()
  private mountedPlugins: Set<string> = new Set()

  constructor(private core: ICore) { }

  async install(plugin: IPlugin): Promise<void> {
    if (this.plugins.has(plugin.pluginId)) return

    if (plugin.dependencies?.length) {
      for (const dep of plugin.dependencies) {
        if (!this.installedPlugins.has(dep)) {
          throw new Error(`插件${plugin.pluginName}依赖的插件${dep}未安装`)
        }
      }
    }

    await plugin.onInstall(this.core)
    this.plugins.set(plugin.pluginId, plugin)
    this.installedPlugins.add(plugin.pluginId)
  }

  async mount(pluginId?: string): Promise<void> {
    if (pluginId) {
      const plugin = this.plugins.get(pluginId)
      if (!plugin || this.mountedPlugins.has(pluginId)) return
      await plugin.onMount(this.core)
      this.mountedPlugins.add(pluginId)
      return
    }

    for (const [id, plugin] of this.plugins.entries()) {
      if (!this.mountedPlugins.has(id)) {
        await plugin.onMount(this.core)
        this.mountedPlugins.add(id)
      }
    }
  }

  async unmount(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || !this.mountedPlugins.has(pluginId)) return
    await plugin.onUnmount(this.core)
    this.mountedPlugins.delete(pluginId)
  }

  getPlugin<T extends IPlugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T | undefined
  }
}