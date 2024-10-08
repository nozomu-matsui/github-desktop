import * as React from 'react'
import { WelcomeStep } from './welcome'
import { LinkButton } from '../lib/link-button'
import { Dispatcher } from '../dispatcher'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Button } from '../lib/button'
import { Loading } from '../lib/loading'
import { BrowserRedirectMessage } from '../lib/authentication-form'
import { SamplesURL } from '../../lib/stats'

/**
 * The URL to the sign-up page on GitHub.com. Used in conjunction
 * with account actions in the app where the user might want to
 * consider signing up.
 */
export const CreateAccountURL = 'https://github.com/join?source=github-desktop'

interface IStartProps {
  readonly advance: (step: WelcomeStep) => void
  readonly dispatcher: Dispatcher
  readonly loadingBrowserAuth: boolean
}

/** The first step of the Welcome flow. */
export class Start extends React.Component<IStartProps, {}> {
  public render() {
    return (
      <section
        id="start"
        aria-label="Welcome to GitHub Desktop"
        aria-describedby="start-description"
      >
        <div className="start-content">
          <h1 className="welcome-title">
            <span>GitHub Desktop</span> へようこそ
          </h1>
          {!this.props.loadingBrowserAuth ? (
            <>
              <p id="start-description" className="welcome-text">
                GitHub Desktop は GitHub や GitHub Enterprise
                上のプロジェクトにシームレスに貢献するアプリケーションです。
                サインインしてプロジェクトへの貢献を開始しましよう。
              </p>
            </>
          ) : (
            <p>{BrowserRedirectMessage}</p>
          )}

          <div className="welcome-main-buttons">
            <Button
              type="submit"
              className="button-with-icon"
              disabled={this.props.loadingBrowserAuth}
              onClick={this.signInWithBrowser}
              autoFocus={true}
              role="link"
            >
              {this.props.loadingBrowserAuth && <Loading />}
              GitHub.com へサインイン
              <Octicon symbol={octicons.linkExternal} />
            </Button>
            {this.props.loadingBrowserAuth ? (
              <Button onClick={this.cancelBrowserAuth}>キャンセル</Button>
            ) : (
              <Button onClick={this.signInToEnterprise}>
                GitHub Enterprise へサインイン
              </Button>
            )}
          </div>
          <div className="skip-action-container">
            <p className="welcome-text">
              GitHub は初めてですか？{' '}
              <LinkButton
                uri={CreateAccountURL}
                className="create-account-link"
              >
                無料のアカウントを作成しましょう。
              </LinkButton>
            </p>
            <LinkButton className="skip-button" onClick={this.skip}>
              この手順をスキップする
            </LinkButton>
          </div>
        </div>

        <div className="start-footer">
          <p>
            アカウントを作成することで、{' '}
            <LinkButton uri={'https://github.com/site/terms'}>
              Terms of Service
            </LinkButton>{' '}
            に同意したことになります。 さらなる情報は、{' '}
            <LinkButton uri={'https://github.com/site/privacy'}>
              GitHub Privacy Statement
            </LinkButton>{' '}
            をご覧ください。
          </p>
          <p>
            GitHub Desktop は製品の改善のため、利用状況を送信します。{' '}
            <LinkButton uri={SamplesURL}>利用状況の使用について。</LinkButton>
          </p>
        </div>
      </section>
    )
  }

  private signInWithBrowser = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
    }

    this.props.advance(WelcomeStep.SignInToDotComWithBrowser)
    this.props.dispatcher.requestBrowserAuthenticationToDotcom()
  }

  private cancelBrowserAuth = () => {
    this.props.advance(WelcomeStep.Start)
  }

  private signInToEnterprise = () => {
    this.props.advance(WelcomeStep.SignInToEnterprise)
  }

  private skip = () => {
    this.props.advance(WelcomeStep.ConfigureGit)
  }
}
