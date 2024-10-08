import { Menu, shell, app, BrowserWindow } from 'electron'
import { ensureItemIds } from './ensure-item-ids'
import { MenuEvent } from './menu-event'
import { truncateWithEllipsis } from '../../lib/truncate-with-ellipsis'
import { getLogDirectoryPath } from '../../lib/logging/get-log-path'
import { UNSAFE_openDirectory } from '../shell'
import { MenuLabelsEvent } from '../../models/menu-labels'
import * as ipcWebContents from '../ipc-webcontents'
import { mkdir } from 'fs/promises'

const createPullRequestLabel = 'プルリクエストを作成'
const showPullRequestLabel = 'プルリクエストを GitHub で表示'
const defaultBranchNameValue = 'デフォルトブランチ'
const confirmRepositoryRemovalLabel = '削除...'
const repositoryRemovalLabel = '削除'
const confirmStashAllChangesLabel = 'すべての変更をスタッシュ...'
const stashAllChangesLabel = 'すべての変更をスタッシュ'

enum ZoomDirection {
  Reset,
  In,
  Out,
}

export function buildDefaultMenu({
  selectedExternalEditor,
  selectedShell,
  askForConfirmationOnForcePush,
  askForConfirmationOnRepositoryRemoval,
  hasCurrentPullRequest = false,
  contributionTargetDefaultBranch = defaultBranchNameValue,
  isForcePushForCurrentRepository = false,
  isStashedChangesVisible = false,
  askForConfirmationWhenStashingAllChanges = true,
}: MenuLabelsEvent): Electron.Menu {
  contributionTargetDefaultBranch = truncateWithEllipsis(
    contributionTargetDefaultBranch,
    25
  )

  const removeRepoLabel = askForConfirmationOnRepositoryRemoval
    ? confirmRepositoryRemovalLabel
    : repositoryRemovalLabel

  const pullRequestLabel = hasCurrentPullRequest
    ? showPullRequestLabel
    : createPullRequestLabel

  const template = new Array<Electron.MenuItemConstructorOptions>()
  const separator: Electron.MenuItemConstructorOptions = { type: 'separator' }

  if (__DARWIN__) {
    template.push({
      label: 'GitHub Desktop',
      submenu: [
        {
          label: 'GitHub Desktop について',
          click: emit('show-about'),
          id: 'about',
        },
        separator,
        {
          label: '設定...',
          id: 'preferences',
          accelerator: 'CmdOrCtrl+,',
          click: emit('show-preferences'),
        },
        separator,
        {
          label: 'コマンドラインツールをインストール...',
          id: 'install-cli',
          click: emit('install-darwin-cli'),
        },
        separator,
        {
          role: 'services',
          submenu: [],
        },
        separator,
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        separator,
        { role: 'quit' },
      ],
    })
  }

  const fileMenu: Electron.MenuItemConstructorOptions = {
    label: 'ファイル',
    submenu: [
      {
        label: 'リポジトリを新規作成...',
        id: 'new-repository',
        click: emit('create-repository'),
        accelerator: 'CmdOrCtrl+N',
      },
      separator,
      {
        label: 'ローカルリポジトリを追加...',
        id: 'add-local-repository',
        accelerator: 'CmdOrCtrl+O',
        click: emit('add-local-repository'),
      },
      {
        label: 'リポジトリをクローン',
        id: 'clone-repository',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: emit('clone-repository'),
      },
    ],
  }

  if (!__DARWIN__) {
    const fileItems = fileMenu.submenu as Electron.MenuItemConstructorOptions[]
    const exitAccelerator = __WIN32__ ? 'Alt+F4' : 'CmdOrCtrl+Q'

    fileItems.push(
      separator,
      {
        label: '設定...',
        id: 'preferences',
        accelerator: 'CmdOrCtrl+,',
        click: emit('show-preferences'),
      },
      separator,
      {
        role: 'quit',
        label: '終了',
        accelerator: exitAccelerator,
      }
    )
  }

  template.push(fileMenu)

  template.push({
    label: '編集',
    submenu: [
      { role: 'undo', label: 'Undo' },
      { role: 'redo', label: 'Redo' },
      separator,
      { role: 'cut', label: 'カット' },
      { role: 'copy', label: 'コピー' },
      { role: 'paste', label: 'ペースト' },
      {
        label: 'すべてを選択',
        accelerator: 'CmdOrCtrl+A',
        click: emit('select-all'),
      },
      separator,
      {
        id: 'find',
        label: '検索',
        accelerator: 'CmdOrCtrl+F',
        click: emit('find-text'),
      },
    ],
  })

  template.push({
    label: 'ビュー',
    submenu: [
      {
        label: '変更ファイルを表示',
        id: 'show-changes',
        accelerator: 'CmdOrCtrl+1',
        click: emit('show-changes'),
      },
      {
        label: 'コミット履歴を表示',
        id: 'show-history',
        accelerator: 'CmdOrCtrl+2',
        click: emit('show-history'),
      },
      {
        label: 'リポジトリ一覧を表示',
        id: 'show-repository-list',
        accelerator: 'CmdOrCtrl+T',
        click: emit('choose-repository'),
      },
      {
        label: 'ブランチ一覧を表示',
        id: 'show-branches-list',
        accelerator: 'CmdOrCtrl+B',
        click: emit('show-branches'),
      },
      separator,
      {
        label: 'サマリーを表示',
        id: 'go-to-commit-message',
        accelerator: 'CmdOrCtrl+G',
        click: emit('go-to-commit-message'),
      },
      {
        label: getStashedChangesLabel(isStashedChangesVisible),
        id: 'toggle-stashed-changes',
        accelerator: 'Ctrl+H',
        click: isStashedChangesVisible
          ? emit('hide-stashed-changes')
          : emit('show-stashed-changes'),
      },
      {
        label: '全画面表示',
        role: 'togglefullscreen',
      },
      separator,
      {
        label: '拡大表示をリセット',
        accelerator: 'CmdOrCtrl+0',
        click: zoom(ZoomDirection.Reset),
      },
      {
        label: '拡大',
        accelerator: 'CmdOrCtrl+=',
        click: zoom(ZoomDirection.In),
      },
      {
        label: '縮小',
        accelerator: 'CmdOrCtrl+-',
        click: zoom(ZoomDirection.Out),
      },
      {
        label: 'アクティブな領域をエクスパンド',
        id: 'increase-active-resizable-width',
        accelerator: 'CmdOrCtrl+9',
        click: emit('increase-active-resizable-width'),
      },
      {
        label: 'アクティブな領域をコントラクト',
        id: 'decrease-active-resizable-width',
        accelerator: 'CmdOrCtrl+8',
        click: emit('decrease-active-resizable-width'),
      },
      separator,
      {
        label: 'リロード',
        id: 'reload-window',
        // Ctrl+Alt is interpreted as AltGr on international keyboards and this
        // can clash with other shortcuts. We should always use Ctrl+Shift for
        // chorded shortcuts, but this menu item is not a user-facing feature
        // so we are going to keep this one around.
        accelerator: 'CmdOrCtrl+Alt+R',
        click(item: any, focusedWindow: Electron.BaseWindow | undefined) {
          if (focusedWindow instanceof BrowserWindow) {
            focusedWindow.reload()
          }
        },
        visible: __RELEASE_CHANNEL__ === 'development',
      },
      {
        id: 'show-devtools',
        label: '開発ツール',
        accelerator: (() => {
          return __DARWIN__ ? 'Alt+Command+I' : 'Ctrl+Shift+I'
        })(),
        click(item: any, focusedWindow: Electron.BaseWindow | undefined) {
          if (focusedWindow instanceof BrowserWindow) {
            focusedWindow.webContents.toggleDevTools()
          }
        },
      },
    ],
  })

  const pushLabel = getPushLabel(
    isForcePushForCurrentRepository,
    askForConfirmationOnForcePush
  )

  const pushEventType = isForcePushForCurrentRepository ? 'force-push' : 'push'

  template.push({
    label: 'リポジトリ',
    id: 'repository',
    submenu: [
      {
        id: 'push',
        label: pushLabel,
        accelerator: 'CmdOrCtrl+P',
        click: emit(pushEventType),
      },
      {
        id: 'pull',
        label: 'プル',
        accelerator: 'CmdOrCtrl+Shift+P',
        click: emit('pull'),
      },
      {
        id: 'fetch',
        label: 'フェッチ',
        accelerator: 'CmdOrCtrl+Shift+T',
        click: emit('fetch'),
      },
      {
        label: removeRepoLabel,
        id: 'remove-repository',
        accelerator: 'CmdOrCtrl+Backspace',
        click: emit('remove-repository'),
      },
      separator,
      {
        id: 'view-repository-on-github',
        label: 'GitHub で表示',
        accelerator: 'CmdOrCtrl+Shift+G',
        click: emit('view-repository-on-github'),
      },
      {
        label: `${selectedShell ?? 'シェル'} で開く`,
        id: 'open-in-shell',
        accelerator: 'Ctrl+`',
        click: emit('open-in-shell'),
      },
      {
        label: __DARWIN__
          ? 'ファインダーで開く'
          : __WIN32__
          ? 'エクスプローラーで開く'
          : 'ファイルマネージャーで開く',
        id: 'open-working-directory',
        accelerator: 'CmdOrCtrl+Shift+F',
        click: emit('open-working-directory'),
      },
      {
        label: `${selectedExternalEditor ?? ' 外部エディターで開く'}`,
        id: 'open-external-editor',
        accelerator: 'CmdOrCtrl+Shift+A',
        click: emit('open-external-editor'),
      },
      separator,
      {
        id: 'create-issue-in-repository-on-github',
        label: '課題を GitHub に作成する',
        accelerator: 'CmdOrCtrl+I',
        click: emit('create-issue-in-repository-on-github'),
      },
      separator,
      {
        label: 'リポジトリ設定...',
        id: 'show-repository-settings',
        click: emit('show-repository-settings'),
      },
    ],
  })

  const branchSubmenu = [
    {
      label: '新規ブランチ...',
      id: 'create-branch',
      accelerator: 'CmdOrCtrl+Shift+N',
      click: emit('create-branch'),
    },
    {
      label: '名前を変更...',
      id: 'rename-branch',
      accelerator: 'CmdOrCtrl+Shift+R',
      click: emit('rename-branch'),
    },
    {
      label: '削除...',
      id: 'delete-branch',
      accelerator: 'CmdOrCtrl+Shift+D',
      click: emit('delete-branch'),
    },
    separator,
    {
      label: 'すべての変更を破棄...',
      id: 'discard-all-changes',
      accelerator: 'CmdOrCtrl+Shift+Backspace',
      click: emit('discard-all-changes'),
    },
    {
      label: askForConfirmationWhenStashingAllChanges
        ? confirmStashAllChangesLabel
        : stashAllChangesLabel,
      id: 'stash-all-changes',
      accelerator: 'CmdOrCtrl+Shift+S',
      click: emit('stash-all-changes'),
    },
    separator,
    {
      label: `${contributionTargetDefaultBranch} から更新`,
      id: 'update-branch-with-contribution-target-branch',
      accelerator: 'CmdOrCtrl+Shift+U',
      click: emit('update-branch-with-contribution-target-branch'),
    },
    {
      label: 'ブランチと比較',
      id: 'compare-to-branch',
      accelerator: 'CmdOrCtrl+Shift+B',
      click: emit('compare-to-branch'),
    },
    {
      label: '選択中のブランチにマージ...',
      id: 'merge-branch',
      accelerator: 'CmdOrCtrl+Shift+M',
      click: emit('merge-branch'),
    },
    {
      label: '選択中のブランチにスクワッシュ & マージ...',
      id: 'squash-and-merge-branch',
      accelerator: 'CmdOrCtrl+Shift+H',
      click: emit('squash-and-merge-branch'),
    },
    {
      label: '選択中のブランチをリベース',
      id: 'rebase-branch',
      accelerator: 'CmdOrCtrl+Shift+E',
      click: emit('rebase-branch'),
    },
    separator,
    {
      label: 'GitHub で比較',
      id: 'compare-on-github',
      accelerator: 'CmdOrCtrl+Shift+C',
      click: emit('compare-on-github'),
    },
    {
      label: 'ブランチを GitHub で表示',
      id: 'branch-on-github',
      accelerator: 'CmdOrCtrl+Alt+B',
      click: emit('branch-on-github'),
    },
  ]

  branchSubmenu.push({
    label: 'プルリクエストをプレビュー',
    id: 'preview-pull-request',
    accelerator: 'CmdOrCtrl+Alt+P',
    click: emit('preview-pull-request'),
  })

  branchSubmenu.push({
    label: pullRequestLabel,
    id: 'create-pull-request',
    accelerator: 'CmdOrCtrl+R',
    click: emit('open-pull-request'),
  })

  template.push({
    label: 'ブランチ',
    id: 'branch',
    submenu: branchSubmenu,
  })

  if (__DARWIN__) {
    template.push({
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
        separator,
        { role: 'front' },
      ],
    })
  }

  const submitIssueItem: Electron.MenuItemConstructorOptions = {
    label: '課題を報告...',
    click() {
      shell
        .openExternal('https://github.com/desktop/desktop/issues/new/choose')
        .catch(err => log.error('Failed opening issue creation page', err))
    },
  }

  const contactSupportItem: Electron.MenuItemConstructorOptions = {
    label: 'GitHub サポートに連絡...',
    click() {
      shell
        .openExternal(
          `https://github.com/contact?from_desktop_app=1&app_version=${app.getVersion()}`
        )
        .catch(err => log.error('Failed opening contact support page', err))
    },
  }

  const showUserGuides: Electron.MenuItemConstructorOptions = {
    label: 'ユーザーガイドを表示',
    click() {
      shell
        .openExternal('https://docs.github.com/en/desktop')
        .catch(err => log.error('Failed opening user guides page', err))
    },
  }

  const showKeyboardShortcuts: Electron.MenuItemConstructorOptions = {
    label: 'キーボードショートカットを表示',
    click() {
      shell
        .openExternal(
          'https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/overview/keyboard-shortcuts'
        )
        .catch(err => log.error('Failed opening keyboard shortcuts page', err))
    },
  }

  const showLogsLabel = __DARWIN__
    ? 'ファインダーでログを表示'
    : __WIN32__
    ? 'エクスプローラーでログを表示'
    : 'ファイルマネージャーでログを表示'

  const showLogsItem: Electron.MenuItemConstructorOptions = {
    label: showLogsLabel,
    click() {
      const logPath = getLogDirectoryPath()
      mkdir(logPath, { recursive: true })
        .then(() => UNSAFE_openDirectory(logPath))
        .catch(err => log.error('Failed opening logs directory', err))
    },
  }

  const helpItems = [
    submitIssueItem,
    contactSupportItem,
    showUserGuides,
    showKeyboardShortcuts,
    showLogsItem,
  ]

  if (__DEV__) {
    helpItems.push(
      separator,
      {
        label: 'Crash main process…',
        click() {
          throw new Error('Boomtown!')
        },
      },
      {
        label: 'Crash renderer process…',
        click: emit('boomtown'),
      },
      {
        label: 'Show popup',
        submenu: [
          {
            label: 'Release notes',
            click: emit('show-release-notes-popup'),
          },
          {
            label: 'Thank you',
            click: emit('show-thank-you-popup'),
          },
          {
            label: 'Show App Error',
            click: emit('show-app-error'),
          },
          {
            label: 'Octicons',
            click: emit('show-icon-test-dialog'),
          },
        ],
      },
      {
        label: 'Prune branches',
        click: emit('test-prune-branches'),
      }
    )
  }

  if (__RELEASE_CHANNEL__ === 'development' || __RELEASE_CHANNEL__ === 'test') {
    if (__WIN32__) {
      helpItems.push(separator, {
        label: 'コマンドラインツール',
        submenu: [
          {
            label: 'インストール',
            click: emit('install-windows-cli'),
          },
          {
            label: 'アンインストール',
            click: emit('uninstall-windows-cli'),
          },
        ],
      })
    }

    helpItems.push(
      {
        label: '通知を表示',
        click: emit('test-show-notification'),
      },
      {
        label: 'バナーを表示',
        submenu: [
          {
            label: 'Update banner',
            click: emit('show-update-banner'),
          },
          {
            label: `Showcase Update banner`,
            click: emit('show-showcase-update-banner'),
          },
          {
            label: `${__DARWIN__ ? 'Apple silicon' : 'Arm64'} banner`,
            click: emit('show-arm64-banner'),
          },
          {
            label: 'Thank you',
            click: emit('show-thank-you-banner'),
          },
          {
            label: 'Reorder Successful',
            click: emit('show-test-reorder-banner'),
          },
          {
            label: 'Reorder Undone',
            click: emit('show-test-undone-banner'),
          },
          {
            label: 'コンフリクトしたチェリーピック',
            click: emit('show-test-cherry-pick-conflicts-banner'),
          },
          {
            label: '成功したマージ',
            click: emit('show-test-merge-successful-banner'),
          },
        ],
      }
    )
  }

  if (__DARWIN__) {
    template.push({
      role: 'help',
      submenu: helpItems,
    })
  } else {
    template.push({
      label: 'ヘルプ',
      submenu: [
        ...helpItems,
        separator,
        {
          label: 'GitHub Desktop について',
          click: emit('show-about'),
          id: 'about',
        },
      ],
    })
  }

  ensureItemIds(template)

  return Menu.buildFromTemplate(template)
}

function getPushLabel(
  isForcePushForCurrentRepository: boolean,
  askForConfirmationOnForcePush: boolean
): string {
  if (!isForcePushForCurrentRepository) {
    return 'プッシュ'
  }

  if (askForConfirmationOnForcePush) {
    return '強制プッシュ...'
  }

  return '強制プッシュ...'
}

function getStashedChangesLabel(isStashedChangesVisible: boolean): string {
  if (isStashedChangesVisible) {
    return 'スタッシュした変更を非表示'
  }

  return 'スタッシュした変更を表示'
}

type ClickHandler = (
  menuItem: Electron.MenuItem,
  browserWindow: Electron.BaseWindow | undefined,
  event: Electron.KeyboardEvent
) => void

/**
 * Utility function returning a Click event handler which, when invoked, emits
 * the provided menu event over IPC.
 */
function emit(name: MenuEvent): ClickHandler {
  return (_, focusedWindow) => {
    // focusedWindow can be null if the menu item was clicked without the window
    // being in focus. A simple way to reproduce this is to click on a menu item
    // while in DevTools. Since Desktop only supports one window at a time we
    // can be fairly certain that the first BrowserWindow we find is the one we
    // want.
    const window =
      focusedWindow instanceof BrowserWindow
        ? focusedWindow
        : BrowserWindow.getAllWindows()[0]
    if (window !== undefined) {
      ipcWebContents.send(window.webContents, 'menu-event', name)
    }
  }
}

/** The zoom steps that we support, these factors must sorted */
const ZoomInFactors = [0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2]
const ZoomOutFactors = ZoomInFactors.slice().reverse()

/**
 * Returns the element in the array that's closest to the value parameter. Note
 * that this function will throw if passed an empty array.
 */
function findClosestValue(arr: Array<number>, value: number) {
  return arr.reduce((previous, current) => {
    return Math.abs(current - value) < Math.abs(previous - value)
      ? current
      : previous
  })
}

/**
 * Figure out the next zoom level for the given direction and alert the renderer
 * about a change in zoom factor if necessary.
 */
function zoom(direction: ZoomDirection): ClickHandler {
  return (menuItem, window) => {
    if (!(window instanceof BrowserWindow)) {
      return
    }

    const { webContents } = window

    if (direction === ZoomDirection.Reset) {
      webContents.zoomFactor = 1
      ipcWebContents.send(webContents, 'zoom-factor-changed', 1)
    } else {
      const rawZoom = webContents.zoomFactor
      const zoomFactors =
        direction === ZoomDirection.In ? ZoomInFactors : ZoomOutFactors

      // So the values that we get from zoomFactor property are floating point
      // precision numbers from chromium, that don't always round nicely, so
      // we'll have to do a little trick to figure out which of our supported
      // zoom factors the value is referring to.
      const currentZoom = findClosestValue(zoomFactors, rawZoom)

      const nextZoomLevel = zoomFactors.find(f =>
        direction === ZoomDirection.In ? f > currentZoom : f < currentZoom
      )

      // If we couldn't find a zoom level (likely due to manual manipulation
      // of the zoom factor in devtools) we'll just snap to the closest valid
      // factor we've got.
      const newZoom = nextZoomLevel === undefined ? currentZoom : nextZoomLevel

      webContents.zoomFactor = newZoom
      ipcWebContents.send(webContents, 'zoom-factor-changed', newZoom)
    }
  }
}
