import { app, dialog } from 'electron'
import { setCrashMenu } from './menu'
import { formatError } from '../lib/logging/format-error'
import { CrashWindow } from './crash-window'

let hasReportedUncaughtException = false

/** Show the uncaught exception UI. */
export function showUncaughtException(isLaunchError: boolean, error: Error) {
  log.error(formatError(error))

  if (hasReportedUncaughtException) {
    return
  }

  hasReportedUncaughtException = true

  setCrashMenu()

  const window = new CrashWindow(isLaunchError ? 'launch' : 'generic', error)

  window.onDidLoad(() => {
    window.show()
  })

  window.onFailedToLoad(async () => {
    await dialog.showMessageBox({
      type: 'error',
      title: '復旧不能なエラー',
      message:
        `GitHub Desktop は、復旧不能なエラーが発生したため、再起動が必要です。\n\n` +
        `このエラーはチームに報告されましたが、同じエラーが繰り返し発生する場合は、` +
        `GitHub Desktop 課題トラッカーに報告してください。\n\n${
          error.stack || error.message
        }`,
    })

    if (!__DEV__) {
      app.relaunch()
    }
    app.quit()
  })

  window.onClose(() => {
    if (!__DEV__) {
      app.relaunch()
    }
    app.quit()
  })

  window.load()
}
