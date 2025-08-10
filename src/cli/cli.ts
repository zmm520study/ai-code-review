import { cac } from 'cac'
import { consola } from 'consola'
import { version } from '../../package.json'
import { loadConfig } from '../config/config'
import { CodeReviewer } from '../core/reviewer'

const cli = cac('encode-code-review')

/**
 * 设置CLI版本和帮助信息
 */
cli
  .version(version)
  .help()
  .option('-c, --config <path>', '配置文件路径')
  .option('--debug', '启用调试模式')

/**
 * 审查GitHub拉取请求
 */
cli
  .command('github-pr', '审查GitHub拉取请求')
  .option('--owner <owner>', '仓库所有者')
  .option('--repo <repo>', '仓库名称')
  .option('--pr-id <id>', '拉取请求ID')
  .action(async (options) => {
    console.log('options', options) 
    try {
      if (!options.owner || !options.repo || !options.prId) {
        consola.error('缺少必要参数: --owner, --repo 和 --pr-id 是必需的')
        process.exit(1)
      }

      const config = await loadConfig(options.config, {
        platform: {
          type: 'github',
        },
      })

      const reviewer = new CodeReviewer({
        config,
        owner: options.owner,
        repo: options.repo,
        prId: options.prId,
      })

      await reviewer.review()
    }
    catch (error) {
      consola.error('GitHub拉取请求审查失败:', error)
      process.exit(1)
    }
  })

/**
 * 审查本地代码
 */
cli
  .command('local', '审查本地代码')
  .option('--path <path>', '代码路径')
  .option('--commit <sha>', '特定提交的SHA')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config, {
        platform: {
          type: 'local',
        },
      })

      const reviewer = new CodeReviewer({
        config,
        path: options.path,
        commitSha: options.commit,
      })

      await reviewer.review()
    }
    catch (error) {
      consola.error('本地代码审查失败:', error)
      process.exit(1)
    }
  })

/**
 * 审查GitHub PR上的特定文件并添加评论
 */
cli
  .command('github-file', '审查GitHub PR中的特定文件并提交评论')
  .option('--owner <owner>', '仓库所有者')
  .option('--repo <repo>', '仓库名称')
  .option('--pr-id <id>', '拉取请求ID')
  .option('--file <file>', '要审查的文件路径')
  .action(async (options) => {
    try {
      if (!options.owner || !options.repo || !options.prId || !options.file) {
        consola.error('缺少必要参数: --owner, --repo, --pr-id 和 --file 是必需的')
        process.exit(1)
      }

      const config = await loadConfig(options.config, {
        platform: {
          type: 'github',
        },
      })

      consola.info(`审查GitHub PR #${options.prId} 中的文件: ${options.file}`)

      // 创建代码审查器，设置为GitHub平台
      const reviewer = new CodeReviewer({
        config,
        owner: options.owner,
        repo: options.repo,
        prId: options.prId,
      })

      // 获取代码差异
      await reviewer.reviewSingleFile(options.file)
    }
    catch (error) {
      consola.error('GitHub文件审查失败:', error)
      process.exit(1)
    }
  })

/**
 * 解析命令行参数
 */
function run(): void {
  try {
    cli.parse(process.argv, { run: false })
    console.log('process.argv', process.argv.slice(2), process.argv)
    if (!process.argv.slice(2).length) {
      cli.outputHelp()
      return
    }

    cli.runMatchedCommand()
  }
  catch (error) {
    consola.error('命令执行出错:', error)
    process.exit(1)
  }
}

export default { run }
