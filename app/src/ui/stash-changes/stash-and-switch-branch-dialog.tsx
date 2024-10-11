import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { VerticalSegmentedControl } from '../lib/vertical-segmented-control'
import { Row } from '../lib/row'
import { Branch } from '../../models/branch'
import { UncommittedChangesStrategy } from '../../models/uncommitted-changes-strategy'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { PopupType } from '../../models/popup'
import { startTimer } from '../lib/timing'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'

enum StashAction {
  StashOnCurrentBranch,
  MoveToNewBranch,
}

interface ISwitchBranchProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly currentBranch: Branch

  /** The branch to checkout after the user selects a stash action */
  readonly branchToCheckout: Branch

  /** Whether `currentBranch` has an existing stash association */
  readonly hasAssociatedStash: boolean
  readonly onDismissed: () => void
}

interface ISwitchBranchState {
  readonly isStashingChanges: boolean
  readonly selectedStashAction: StashAction
  readonly currentBranchName: string
}

/**
 * Dialog that alerts users that their changes may be lost and offers them the
 * chance to stash them or potentially take them to another branch
 */
export class StashAndSwitchBranch extends React.Component<
  ISwitchBranchProps,
  ISwitchBranchState
> {
  public constructor(props: ISwitchBranchProps) {
    super(props)

    this.state = {
      isStashingChanges: false,
      selectedStashAction: StashAction.StashOnCurrentBranch,
      currentBranchName: props.currentBranch.name,
    }
  }

  public render() {
    const { isStashingChanges } = this.state
    return (
      <Dialog
        id="stash-changes"
        title="ブランチを切り替え"
        onSubmit={this.onSubmit}
        onDismissed={this.props.onDismissed}
        loading={isStashingChanges}
        disabled={isStashingChanges}
      >
        <DialogContent>
          {this.renderStashActions()}
          {this.renderStashOverwriteWarning()}
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup okButtonText="ブランチを切り替え" />
        </DialogFooter>
      </Dialog>
    )
  }

  private renderStashOverwriteWarning() {
    if (
      !this.props.hasAssociatedStash ||
      this.state.selectedStashAction !== StashAction.StashOnCurrentBranch
    ) {
      return null
    }

    return (
      <Row>
        <Octicon symbol={octicons.alert} />{' '}
        現在のスタッシュは、新しく作成したスタッシュで上書きされます。
      </Row>
    )
  }

  private renderStashActions() {
    const { branchToCheckout } = this.props
    const items = [
      {
        title: `変更を ${this.state.currentBranchName} に残す`,
        description: '作業中の変更は、このブランチにスタッシュされます。',
        key: StashAction.StashOnCurrentBranch,
      },
      {
        title: `変更を ${branchToCheckout.name} へ移動する`,
        description: '作業中の変更は、新しいブランチについてきます。',
        key: StashAction.MoveToNewBranch,
      },
    ]

    return (
      <Row>
        <VerticalSegmentedControl
          label="このブランチに変更があります。どうしますか？"
          items={items}
          selectedKey={this.state.selectedStashAction}
          onSelectionChanged={this.onSelectionChanged}
        />
      </Row>
    )
  }

  private onSelectionChanged = (action: StashAction) => {
    this.setState({ selectedStashAction: action })
  }

  private onSubmit = async () => {
    const { repository, branchToCheckout, dispatcher, hasAssociatedStash } =
      this.props
    const { selectedStashAction } = this.state

    if (
      selectedStashAction === StashAction.StashOnCurrentBranch &&
      hasAssociatedStash
    ) {
      dispatcher.showPopup({
        type: PopupType.ConfirmOverwriteStash,
        repository,
        branchToCheckout,
      })
      return
    }

    this.setState({ isStashingChanges: true })

    const timer = startTimer('スタッシュしてチェックアウト', repository)
    try {
      if (selectedStashAction === StashAction.StashOnCurrentBranch) {
        await dispatcher.checkoutBranch(
          repository,
          branchToCheckout,
          UncommittedChangesStrategy.StashOnCurrentBranch
        )
      } else if (selectedStashAction === StashAction.MoveToNewBranch) {
        // attempt to checkout the branch without creating a stash entry
        await dispatcher.checkoutBranch(
          repository,
          branchToCheckout,
          UncommittedChangesStrategy.MoveToNewBranch
        )
      }
    } finally {
      timer.done()
      this.setState({ isStashingChanges: false }, () => {
        this.props.onDismissed()
      })
    }
  }
}
