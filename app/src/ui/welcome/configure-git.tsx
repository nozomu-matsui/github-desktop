import * as React from 'react'
import { WelcomeStep } from './welcome'
import { Account } from '../../models/account'
import { ConfigureGitUser } from '../lib/configure-git-user'
import { Button } from '../lib/button'

interface IConfigureGitProps {
  readonly accounts: ReadonlyArray<Account>
  readonly advance: (step: WelcomeStep) => void
  readonly done: () => void
}

/** The Welcome flow step to configure git. */
export class ConfigureGit extends React.Component<IConfigureGitProps, {}> {
  public render() {
    return (
      <section id="configure-git" aria-label="Configure Git">
        <h1 className="welcome-title">Git を設定</h1>
        <p className="welcome-text">
          この情報は、あなたが作成したコミットを識別するために使います。
          コミットをパブリッシュしたら、誰でも見ることができます。
        </p>

        <ConfigureGitUser
          accounts={this.props.accounts}
          onSave={this.props.done}
          saveLabel="完了"
        >
          <Button onClick={this.cancel}>キャンセル</Button>
        </ConfigureGitUser>
      </section>
    )
  }

  private cancel = () => {
    this.props.advance(WelcomeStep.Start)
  }
}
