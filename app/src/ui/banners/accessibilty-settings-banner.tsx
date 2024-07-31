import * as React from 'react'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Banner } from './banner'
import { LinkButton } from '../lib/link-button'
import { setBoolean } from '../../lib/local-storage'

export const accessibilityBannerDismissed = 'accessibility-banner-dismissed'

interface IAccessibilitySettingsBannerProps {
  readonly onOpenAccessibilitySettings: () => void
  readonly onDismissed: () => void
}

export class AccessibilitySettingsBanner extends React.Component<IAccessibilitySettingsBannerProps> {
  private onDismissed = () => {
    setBoolean(accessibilityBannerDismissed, true)
    this.props.onDismissed()
  }

  private onOpenAccessibilitySettings = () => {
    this.props.onOpenAccessibilitySettings()
    this.onDismissed()
  }

  public render() {
    return (
      <Banner
        id="accessibility-settings-banner"
        dismissable={true}
        onDismissed={this.onDismissed}
      >
        <Octicon symbol={octicons.accessibilityInset} />
        <div className="banner-message">
          <LinkButton onClick={this.onOpenAccessibilitySettings}>
            アクセシビリティ設定
          </LinkButton>{' '}
          が新しく追加されました。 リンクに下線を表示したり、Diff
          チェックマークを表示したりできます。
        </div>
      </Banner>
    )
  }
}
