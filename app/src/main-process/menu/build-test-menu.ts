import { MenuItemConstructorOptions } from 'electron'
import { enableTestMenuItems } from '../../lib/feature-flag'
import { emit, separator } from './build-default-menu'

export function buildTestMenu() {
  if (!enableTestMenuItems()) {
    return []
  }

  const testMenuItems: MenuItemConstructorOptions[] = []

  if (__WIN32__) {
    testMenuItems.push(separator, {
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

  const errorDialogsSubmenu: MenuItemConstructorOptions[] = [
    {
      label: 'Confirm Committing Conflicted Files',
      click: emit('test-confirm-committing-conflicted-files'),
    },
    {
      label: 'Discarded Changes Will Be Unrecoverable',
      click: emit('test-discarded-changes-will-be-unrecoverable'),
    },
    {
      label: 'Do you want to fork this repository?',
      click: emit('test-do-you-want-fork-this-repository'),
    },
    {
      label: 'Newer Commits On Remote',
      click: emit('test-newer-commits-on-remote'),
    },
    {
      label: 'Files Too Large',
      click: emit('test-files-too-large'),
    },
    {
      label: 'Generic Git Authentication',
      click: emit('test-generic-git-authentication'),
    },
    {
      label: 'Invalidated Account Token',
      click: emit('test-invalidated-account-token'),
    },
  ]

  if (__DARWIN__) {
    errorDialogsSubmenu.push({
      label: 'Move to Application Folder',
      click: emit('test-move-to-application-folder'),
    })
  }

  errorDialogsSubmenu.push(
    {
      label: 'プッシュリジェクト',
      click: emit('test-push-rejected'),
    },
    {
      label: '再認証要求',
      click: emit('test-re-authorization-required'),
    },
    {
      label: 'Git所在確認失敗',
      click: emit('test-unable-to-locate-git'),
    },
    {
      label: '外部エディター起動失敗',
      click: emit('test-no-external-editor'),
    },
    {
      label: 'シェル起動失敗',
      click: emit('test-unable-to-open-shell'),
    },
    {
      label: '信頼できないサーバー',
      click: emit('test-untrusted-server'),
    },
    {
      label: '既存のGit LFS フィルターを更新しますか？',
      click: emit('test-update-existing-git-lfs-filters'),
    },
    {
      label: 'アップストリームがすでに存在します',
      click: emit('test-upstream-already-exists'),
    }
  )

  testMenuItems.push(
    separator,
    {
      label: 'メインプロセスをクラッシュ...',
      click() {
        throw new Error('Boomtown!')
      },
    },
    {
      label: 'レンダラープロセスをクラッシュ...',
      click: emit('boomtown'),
    },
    {
      label: 'ブランチをプルーン',
      click: emit('test-prune-branches'),
    },
    {
      label: '通知を表示',
      click: emit('test-notification'),
    },
    {
      label: 'ポップアップを表示',
      submenu: [
        {
          label: 'リリースノート',
          click: emit('test-release-notes-popup'),
        },
        {
          label: '謝辞',
          click: emit('test-thank-you-popup'),
        },
        {
          label: 'アプリケーションエラーを表示',
          click: emit('test-app-error'),
        },
        {
          label: 'Octicons',
          click: emit('test-icons'),
        },
        {
          label: 'About ダイアログ (テストモード)',
          click: emit('test-about-dialog'),
        },
      ],
    },
    {
      label: 'バナーを表示',
      submenu: [
        {
          label: 'バナーを更新',
          click: emit('test-update-banner'),
        },
        {
          label: 'バナーを更新 (プライオリティ)',
          click: emit('test-prioritized-update-banner'),
        },
        {
          label: `ショーケース バナー更新`,
          click: emit('test-showcase-update-banner'),
        },
        {
          label: `${__DARWIN__ ? 'Apple silicon' : 'Arm64'} banner`,
          click: emit('test-arm64-banner'),
        },
        {
          label: '謝辞',
          click: emit('test-thank-you-banner'),
        },
        {
          label: 'リオーダー成功',
          click: emit('test-reorder-banner'),
        },
        {
          label: 'リオーダー Undone',
          click: emit('test-undone-banner'),
        },
        {
          label: 'チェリーピック競合',
          click: emit('test-cherry-pick-conflicts-banner'),
        },
        {
          label: 'マージ成功',
          click: emit('test-merge-successful-banner'),
        },
        {
          label: 'OS バージョン サポート終了',
          click: emit('test-os-version-no-longer-supported'),
        },
      ],
    },
    {
      label: 'エラーダイアログを表示',
      submenu: errorDialogsSubmenu,
    }
  )

  return testMenuItems
}
