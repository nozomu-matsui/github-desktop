import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { LinkButton } from '../lib/link-button'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IAttributeMismatchProps {
  /** Called when the dialog should be dismissed. */
  readonly onDismissed: () => void

  /** Called when the user has chosen to replace the update filters. */
  readonly onUpdateExistingFilters: () => void

  readonly onEditGlobalGitConfig: () => void
}

export class AttributeMismatch extends React.Component<IAttributeMismatchProps> {
  public render() {
    return (
      <Dialog
        id="lfs-attribute-mismatch"
        title="既存の Git LFS フィルターを更新する"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <p>
            すでに Git LFS フィルターが{' '}
            <LinkButton onClick={this.props.onEditGlobalGitConfig}>
              グローバル git 設定
            </LinkButton>{' '}
            に登録されていますが、期待された値ではありません。更新しますか？
          </p>
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="既存のフィルターを更新する"
            cancelButtonText="今はしない"
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onSubmit = () => {
    this.props.onUpdateExistingFilters()
    this.props.onDismissed()
  }
}
