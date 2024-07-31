import * as React from 'react'
import * as URL from 'url'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IUntrustedCertificateProps {
  /** The untrusted certificate. */
  readonly certificate: Electron.Certificate

  /** The URL which was being accessed. */
  readonly url: string

  /** The function to call when the user chooses to dismiss the dialog. */
  readonly onDismissed: () => void

  /**
   * The function to call when the user chooses to continue in the process of
   * trusting the certificate.
   */
  readonly onContinue: (certificate: Electron.Certificate) => void
}

/**
 * The dialog we display when an API request encounters an untrusted
 * certificate.
 *
 * An easy way to test this dialog is to attempt to sign in to GitHub
 * Enterprise using  one of the badssl.com domains, such
 * as https://self-signed.badssl.com/
 */
export class UntrustedCertificate extends React.Component<
  IUntrustedCertificateProps,
  {}
> {
  public render() {
    const host = URL.parse(this.props.url).hostname

    return (
      <Dialog
        title="信頼されていないサーバー"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onContinue}
        type={__DARWIN__ ? 'warning' : 'error'}
      >
        <DialogContent>
          <p>
            {host} のアイデンティティを検証できません。
            署名 ({this.props.certificate.subjectName}) が無効か信頼できません。
            <strong>
              これは、データが盗まれる可能性を示しています。
            </strong>
          </p>
          <p>In some cases, this may be expected. For example:</p>
          <ul>
            <li>If this is a GitHub Enterprise trial.</li>
            <li>
              If your GitHub Enterprise instance is run on an unusual top-level
              domain.
            </li>
          </ul>
          <p>
            何をすべきか不明な場合は、キャンセルした上でシステム管理者に連絡してください。
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText="署名を表示"
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onContinue = () => {
    this.props.onDismissed()
    this.props.onContinue(this.props.certificate)
  }
}
