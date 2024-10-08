import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Dispatcher } from '../dispatcher'
import { TrashNameLabel } from '../lib/context-menu'
import { RetryAction } from '../../models/retry-actions'
import { Checkbox, CheckboxValue } from '../lib/checkbox'

interface IDiscardChangesRetryDialogProps {
  readonly dispatcher: Dispatcher
  readonly retryAction: RetryAction
  readonly onDismissed: () => void
  readonly onConfirmDiscardChangesChanged: (optOut: boolean) => void
}

interface IDiscardChangesRetryDialogState {
  readonly retrying: boolean
  readonly confirmDiscardChanges: boolean
}

export class DiscardChangesRetryDialog extends React.Component<
  IDiscardChangesRetryDialogProps,
  IDiscardChangesRetryDialogState
> {
  public constructor(props: IDiscardChangesRetryDialogProps) {
    super(props)
    this.state = { retrying: false, confirmDiscardChanges: true }
  }

  public render() {
    const { retrying } = this.state

    return (
      <Dialog
        title="Error"
        id="discard-changes-retry"
        loading={retrying}
        disabled={retrying}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
        type="error"
      >
        <DialogContent>
          <p>変更を {TrashNameLabel} に破棄できませんでした。</p>
          <div>
            よくある理由は：
            <ul>
              <li>{TrashNameLabel} は、即座に削除する設定になっている。</li>
              <li>ファイルの移動が制限されている。</li>
            </ul>
          </div>
          <p>この操作によって破棄した変更は、元に戻せません。</p>
          {this.renderConfirmDiscardChanges()}
        </DialogContent>
        {this.renderFooter()}
      </Dialog>
    )
  }

  private renderConfirmDiscardChanges() {
    return (
      <Checkbox
        label="このメッセージを次から表示しない"
        value={
          this.state.confirmDiscardChanges
            ? CheckboxValue.Off
            : CheckboxValue.On
        }
        onChange={this.onConfirmDiscardChangesChanged}
      />
    )
  }

  private renderFooter() {
    return (
      <DialogFooter>
        <OkCancelButtonGroup
          okButtonText="永久に変更を破棄"
          okButtonTitle={`この操作によって破棄した変更は、元に戻せません。`}
          cancelButtonText="キャンセル"
          destructive={true}
        />
      </DialogFooter>
    )
  }

  private onConfirmDiscardChangesChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = !event.currentTarget.checked

    this.setState({ confirmDiscardChanges: value })
  }

  private onSubmit = async () => {
    const { dispatcher, retryAction } = this.props

    this.setState({ retrying: true })

    await dispatcher.performRetry(retryAction)

    this.props.onConfirmDiscardChangesChanged(this.state.confirmDiscardChanges)
    this.props.onDismissed()
  }
}
