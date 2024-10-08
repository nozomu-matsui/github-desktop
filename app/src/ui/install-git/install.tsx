import * as React from 'react'

import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { shell } from '../../lib/app-shell'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

interface IInstallGitProps {
  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * The path to the current repository, in case the user wants to continue
   * doing whatever they're doing.
   */
  readonly path: string

  /** Called when the user chooses to open the shell. */
  readonly onOpenShell: (path: string) => void
}

/**
 * A dialog indicating that Git wasn't found, to direct the user to an
 * external resource for more information about setting up their environment.
 */
export class InstallGit extends React.Component<IInstallGitProps, {}> {
  public constructor(props: IInstallGitProps) {
    super(props)
  }

  private onSubmit = () => {
    this.props.onOpenShell(this.props.path)
    this.props.onDismissed()
  }

  private onExternalLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    const url = `https://help.github.com/articles/set-up-git/#setting-up-git`
    shell.openExternal(url)
  }

  public render() {
    return (
      <Dialog
        id="install-git"
        type="warning"
        title="Git が見つかりません"
        onSubmit={this.onSubmit}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <p>
            Git の在処がわかりません。 これは、Git コマンドが
            {__DARWIN__ ? 'ターミナル' : 'コマンドプロンプト'}
            で利用できないことを意味します。
          </p>
          <p>Git をインストールするためには、外部リソースが利用可能です。</p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="Git なしで開く"
            cancelButtonText="Git をインストール"
            onCancelButtonClick={this.onExternalLink}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
