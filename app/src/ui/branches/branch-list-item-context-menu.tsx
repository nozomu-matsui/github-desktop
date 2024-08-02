import { IMenuItem } from '../../lib/menu-item'
import { clipboard } from 'electron'

interface IBranchContextMenuConfig {
  name: string
  isLocal: boolean
  onRenameBranch?: (branchName: string) => void
  onDeleteBranch?: (branchName: string) => void
}

export function generateBranchContextMenuItems(
  config: IBranchContextMenuConfig
): IMenuItem[] {
  const { name, isLocal, onRenameBranch, onDeleteBranch } = config
  const items = new Array<IMenuItem>()

  if (onRenameBranch !== undefined) {
    items.push({
      label: 'リネーム...',
      action: () => onRenameBranch(name),
      enabled: isLocal,
    })
  }

  items.push({
    label: 'ブランチ名をコピー',
    action: () => clipboard.writeText(name),
  })

  items.push({ type: 'separator' })

  if (onDeleteBranch !== undefined) {
    items.push({
      label: '削除...',
      action: () => onDeleteBranch(name),
    })
  }

  return items
}
