import * as React from 'react'
import { DialogContent } from '../dialog'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { LinkButton } from '../lib/link-button'
import { SamplesURL } from '../../lib/stats'
import { isWindowsOpenSSHAvailable } from '../../lib/ssh/ssh'
import { enableExternalCredentialHelper } from '../../lib/feature-flag'

interface IAdvancedPreferencesProps {
  readonly useWindowsOpenSSH: boolean
  readonly optOutOfUsageTracking: boolean
  readonly useExternalCredentialHelper: boolean
  readonly repositoryIndicatorsEnabled: boolean
  readonly onUseWindowsOpenSSHChanged: (checked: boolean) => void
  readonly onOptOutofReportingChanged: (checked: boolean) => void
  readonly onUseExternalCredentialHelperChanged: (checked: boolean) => void
  readonly onRepositoryIndicatorsEnabledChanged: (enabled: boolean) => void
}

interface IAdvancedPreferencesState {
  readonly optOutOfUsageTracking: boolean
  readonly canUseWindowsSSH: boolean
  readonly useExternalCredentialHelper: boolean
}

export class Advanced extends React.Component<
  IAdvancedPreferencesProps,
  IAdvancedPreferencesState
> {
  public constructor(props: IAdvancedPreferencesProps) {
    super(props)

    this.state = {
      optOutOfUsageTracking: this.props.optOutOfUsageTracking,
      canUseWindowsSSH: false,
      useExternalCredentialHelper: this.props.useExternalCredentialHelper,
    }
  }

  public componentDidMount() {
    this.checkSSHAvailability()
  }

  private async checkSSHAvailability() {
    this.setState({ canUseWindowsSSH: await isWindowsOpenSSHAvailable() })
  }

  private onReportingOptOutChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = !event.currentTarget.checked

    this.setState({ optOutOfUsageTracking: value })
    this.props.onOptOutofReportingChanged(value)
  }

  private onUseExternalCredentialHelperChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.checked

    this.setState({ useExternalCredentialHelper: value })
    this.props.onUseExternalCredentialHelperChanged(value)
  }

  private onRepositoryIndicatorsEnabledChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onRepositoryIndicatorsEnabledChanged(event.currentTarget.checked)
  }

  private onUseWindowsOpenSSHChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onUseWindowsOpenSSHChanged(event.currentTarget.checked)
  }

  private reportDesktopUsageLabel() {
    return (
      <span>
        GitHub Desktop の改善に協力する{' '}
        <LinkButton uri={SamplesURL}>usage stats</LinkButton>
      </span>
    )
  }

  public render() {
    return (
      <DialogContent>
        <div className="advanced-section">
          <h2>バックグラウンドアップデート</h2>
          <Checkbox
            label="ステータスアイコンをレポジトリ一覧に表示する"
            value={
              this.props.repositoryIndicatorsEnabled
                ? CheckboxValue.On
                : CheckboxValue.Off
            }
            onChange={this.onRepositoryIndicatorsEnabledChanged}
            ariaDescribedBy="periodic-fetch-description"
          />
          <div
            id="periodic-fetch-description"
            className="git-settings-description"
          >
            <p>
              この設定は、どのレポジトリがローカルもしくはリモート変更があるかをアイコン表示します。
              また、選択されていないレポジトリで、フェッチが必要なものをアイコン表示します。
            </p>
            <p>
              この設定を無効にしても、選択中のレポジトリに対する定期的なフェッチは継続されますが、
              多くのユーザが使っているレポジトリにおいては、アプリケーション全体のパフォーマンスを改善します。
            </p>
          </div>
        </div>
        <div className="advanced-section">
          <h2>Usage</h2>
          <Checkbox
            label={this.reportDesktopUsageLabel()}
            value={
              this.state.optOutOfUsageTracking
                ? CheckboxValue.Off
                : CheckboxValue.On
            }
            onChange={this.onReportingOptOutChanged}
          />
        </div>
        {(this.state.canUseWindowsSSH || enableExternalCredentialHelper()) && (
          <h2>ネットワーク & クレデンシャル</h2>
        )}
        {this.renderSSHSettings()}
        {enableExternalCredentialHelper() && (
          <div className="advanced-section">
            <Checkbox
              label={'Use Git Credential Manager'}
              value={
                this.state.useExternalCredentialHelper
                  ? CheckboxValue.On
                  : CheckboxValue.Off
              }
              onChange={this.onUseExternalCredentialHelperChanged}
              ariaDescribedBy="use-external-credential-helper-description"
            />
            <div
              id="use-external-credential-helper-description"
              className="git-settings-description"
            >
              <p>
                <LinkButton uri="https://gh.io/gcm">
                  Git クレデンシャルマネージャー{' '}
                </LinkButton>{' '}
                を GitHub.com 以外のレポジトリに使用します。
                この機能は、試験的なもので、変更される可能性があります。
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    )
  }

  private renderSSHSettings() {
    if (!this.state.canUseWindowsSSH) {
      return null
    }

    return (
      <div className="advanced-section">
        <Checkbox
          label="Use system OpenSSH (recommended)"
          value={
            this.props.useWindowsOpenSSH ? CheckboxValue.On : CheckboxValue.Off
          }
          onChange={this.onUseWindowsOpenSSHChanged}
        />
      </div>
    )
  }
}
