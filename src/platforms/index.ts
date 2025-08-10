import { consola } from 'consola'
import type { Platform, PlatformConfig, PlatformOptions } from './types'
import { GitHubPlatform } from './github'
import { LocalPlatform } from './local'

/**
 * 创建平台实例
 */
export function createPlatform(
  config: PlatformConfig,
  options: PlatformOptions,
): Platform {
  consola.debug(`创建平台: ${config.type}`)

  switch (config.type) {
    case 'github':
      return new GitHubPlatform(config, options)
    case 'local':
      return new LocalPlatform(options)
    default:
      throw new Error(`不支持的平台: ${(config as PlatformConfig).type}`)
  }
}
