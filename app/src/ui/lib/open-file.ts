import { shell } from '../../lib/app-shell'
import { Dispatcher } from '../dispatcher'

export async function openFile(
  fullPath: string,
  dispatcher: Dispatcher
): Promise<void> {
  const result = await shell.openExternal(`file://${fullPath}`)

  if (!result) {
    const error = {
      name: 'no-external-program',
      message: `外部アプリケーションを使って ${fullPath} が開けません。ファイル拡張子に紐づけられたアプリケーションを確認してください。`,
    }
    await dispatcher.postError(error)
  }
}
