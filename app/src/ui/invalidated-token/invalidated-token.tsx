import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Dispatcher } from '../dispatcher'
import { Row } from '../lib/row'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Account, isEnterpriseAccount } from '../../models/account'

interface IInvalidatedTokenProps {
  readonly dispatcher: Dispatcher
  readonly account: Account
  readonly onDismissed: () => void
}

/**
 * Dialog that alerts user that their GitHub (Enterprise) account token is not
 * valid and they need to sign in again.
 */
export class InvalidatedToken extends React.Component<IInvalidatedTokenProps> {
  public render() {
    const { account } = this.props
    const accountTypeSuffix = isEnterpriseAccount(account) ? ' Enterprise' : ''

    return (
      <Dialog
        id="invalidated-token"
        type="warning"
        title="無効化されたアカウントトークン"
        onSubmit={this.onSubmit}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <Row>
            アカウントトークンが無効なため、GitHub{accountTypeSuffix}{' '}
            からサインアウトされました。 再度サインインしますか？
          </Row>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup okButtonText="はい" cancelButtonText="いいえ" />
        </DialogFooter>
      </Dialog>
    )
  }

  private onSubmit = () => {
    const { dispatcher, onDismissed, account } = this.props

    onDismissed()

    if (isEnterpriseAccount(account)) {
      dispatcher.showEnterpriseSignInDialog(this.props.account.endpoint)
    } else {
      dispatcher.showDotComSignInDialog()
    }
  }
}
