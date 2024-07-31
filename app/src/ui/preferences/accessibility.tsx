import * as React from 'react'
import { DialogContent } from '../dialog'
import { Checkbox, CheckboxValue } from '../lib/checkbox'

interface IAccessibilityPreferencesProps {
  readonly underlineLinks: boolean
  readonly onUnderlineLinksChanged: (value: boolean) => void

  readonly showDiffCheckMarks: boolean
  readonly onShowDiffCheckMarksChanged: (value: boolean) => void
}

export class Accessibility extends React.Component<
  IAccessibilityPreferencesProps,
  {}
> {
  public constructor(props: IAccessibilityPreferencesProps) {
    super(props)
  }

  public render() {
    return (
      <DialogContent>
        <div className="advanced-section">
          <h2>アクセシビリティ</h2>
          <Checkbox
            label="リンクに下線を表示する"
            value={
              this.props.underlineLinks ? CheckboxValue.On : CheckboxValue.Off
            }
            onChange={this.onUnderlineLinksChanged}
            ariaDescribedBy="underline-setting-description"
          />
          <p
            id="underline-setting-description"
            className="git-settings-description"
          >
            この設定を有効にすると、コミットメッセージやコメント、その他のテキストフィールド中の
            URL に下線が付きます。 URL が見つけやすくなります。
            {this.renderExampleLink()}
          </p>

          <Checkbox
            label="Diffにチェックマークを表示する"
            value={
              this.props.showDiffCheckMarks
                ? CheckboxValue.On
                : CheckboxValue.Off
            }
            onChange={this.onShowDiffCheckMarksChanged}
            ariaDescribedBy="diff-checkmarks-setting-description"
          />
          <p
            id="diff-checkmarks-setting-description"
            className="git-settings-description"
          >
            この設定を有効にすると、コミットする際の変更箇所にチェックマーク（行番号の横）が表示されます。
          </p>
        </div>
      </DialogContent>
    )
  }

  private renderExampleLink() {
    // The example link is rendered with inline style to override the global setting.
    const style = {
      textDecoration: this.props.underlineLinks ? 'underline' : 'none',
    }

    return (
      <span className="link-button-component" style={style}>
        例がこちら。
      </span>
    )
  }

  private onUnderlineLinksChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onUnderlineLinksChanged(event.currentTarget.checked)
  }

  private onShowDiffCheckMarksChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onShowDiffCheckMarksChanged(event.currentTarget.checked)
  }
}
