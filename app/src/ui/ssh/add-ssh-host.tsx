import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IAddSSHHostProps {
  readonly host: string
  readonly ip: string
  readonly keyType: string
  readonly fingerprint: string
  readonly onSubmit: (addHost: boolean) => void
  readonly onDismissed: () => void
}

/**
 * Dialog prompts the user to add a new SSH host as known.
 */
export class AddSSHHost extends React.Component<IAddSSHHostProps> {
  public render() {
    return (
      <Dialog
        id="add-ssh-host"
        type="normal"
        title="SSH ホスト"
        backdropDismissable={false}
        onSubmit={this.onSubmit}
        onDismissed={this.onCancel}
      >
        <DialogContent>
          <p>
            ホスト '{this.props.host} ({this.props.ip})'
            の信頼性が確立できません。
            {this.props.keyType} キーのフィンガープリントは{' '}
            {this.props.fingerprint}.
          </p>
          <p>本当に接続を継続しますか？</p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="はい"
            cancelButtonText="いいえ"
            onCancelButtonClick={this.onCancel}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private submit(addHost: boolean) {
    const { onSubmit, onDismissed } = this.props

    onSubmit(addHost)
    onDismissed()
  }

  private onSubmit = () => {
    this.submit(true)
  }

  private onCancel = () => {
    this.submit(false)
  }
}
