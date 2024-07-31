import * as React from 'react'
import { DialogContent } from '../dialog'
import { RefNameTextBox } from '../lib/ref-name-text-box'
import { Ref } from '../lib/ref'
import { LinkButton } from '../lib/link-button'
import { Account } from '../../models/account'
import { GitConfigUserForm } from '../lib/git-config-user-form'

interface IGitProps {
  readonly name: string
  readonly email: string
  readonly defaultBranch: string
  readonly isLoadingGitConfig: boolean
  readonly globalGitConfigPath: string | null

  readonly dotComAccount: Account | null
  readonly enterpriseAccount: Account | null

  readonly onNameChanged: (name: string) => void
  readonly onEmailChanged: (email: string) => void
  readonly onDefaultBranchChanged: (defaultBranch: string) => void

  readonly selectedExternalEditor: string | null
  readonly onOpenFileInExternalEditor: (path: string) => void
}

export class Git extends React.Component<IGitProps> {
  public render() {
    return (
      <DialogContent>
        {this.renderGitConfigAuthorInfo()}
        {this.renderDefaultBranchSetting()}
      </DialogContent>
    )
  }

  private renderGitConfigAuthorInfo() {
    return (
      <GitConfigUserForm
        email={this.props.email}
        name={this.props.name}
        isLoadingGitConfig={this.props.isLoadingGitConfig}
        enterpriseAccount={this.props.enterpriseAccount}
        dotComAccount={this.props.dotComAccount}
        onEmailChanged={this.props.onEmailChanged}
        onNameChanged={this.props.onNameChanged}
      />
    )
  }

  private renderDefaultBranchSetting() {
    return (
      <div className="default-branch-component">
        <h2 id="default-branch-heading">
          新規レポジトリのデフォルトブランチ名
        </h2>

        <RefNameTextBox
          initialValue={this.props.defaultBranch}
          onValueChange={this.props.onDefaultBranchChanged}
          ariaLabelledBy={'default-branch-heading'}
          ariaDescribedBy="default-branch-description"
          warningMessageVerb="saved"
        />

        <p id="default-branch-description" className="git-settings-description">
          GitHub のデフォルトブランチ名は <Ref>main</Ref> です。
          デフォルトブランチ名は変更できます。 従来の <Ref>master</Ref>{' '}
          にも変更できます。
        </p>

        <p className="git-settings-description">
          この設定は{' '}
          {this.props.selectedExternalEditor &&
          this.props.globalGitConfigPath ? (
            <LinkButton onClick={this.openGlobalGitConfigInEditor}>
              グローバル Git 設定ファイルを変更します。
            </LinkButton>
          ) : (
            'グローバル Git 設定ファイルを変更します。'
          )}
          .
        </p>
      </div>
    )
  }

  // This function is called to open the global git config file in the
  // user's default editor.
  private openGlobalGitConfigInEditor = () => {
    if (this.props.globalGitConfigPath) {
      this.props.onOpenFileInExternalEditor(this.props.globalGitConfigPath)
    }
  }
}
