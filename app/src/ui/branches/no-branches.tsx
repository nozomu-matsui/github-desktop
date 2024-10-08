import * as React from 'react'
import { encodePathAsUrl } from '../../lib/path'
import { Button } from '../lib/button'
import { KeyboardShortcut } from '../keyboard-shortcut/keyboard-shortcut'

const BlankSlateImage = encodePathAsUrl(
  __dirname,
  'static/empty-no-branches.svg'
)

interface INoBranchesProps {
  /** The callback to invoke when the user wishes to create a new branch */
  readonly onCreateNewBranch: () => void
  /** True to display the UI elements for creating a new branch, false to hide them */
  readonly canCreateNewBranch: boolean
  /** Optional: No branches message */
  readonly noBranchesMessage?: string | JSX.Element
}

export class NoBranches extends React.Component<INoBranchesProps> {
  public render() {
    if (this.props.canCreateNewBranch) {
      return (
        <div className="no-branches">
          <img src={BlankSlateImage} className="blankslate-image" alt="" />

          <div className="title">Sorry, I can't find that branch</div>

          <div className="subtitle">
            代わりに、新しいブランチを生成しますか？
          </div>

          <Button
            className="create-branch-button"
            onClick={this.props.onCreateNewBranch}
            type="submit"
          >
            新しいブランチを作成する
          </Button>

          <div className="protip">
            ヒント{' '}
            <KeyboardShortcut
              darwinKeys={['⌘', '⇧', 'N']}
              keys={['Ctrl', 'Shift', 'N']}
            />{' '}
            を押すと、すばやく新しいブランチを作成できます。
          </div>
        </div>
      )
    }

    return (
      <div className="no-branches">
        {this.props.noBranchesMessage ?? "Sorry, I can't find that branch"}
      </div>
    )
  }
}
