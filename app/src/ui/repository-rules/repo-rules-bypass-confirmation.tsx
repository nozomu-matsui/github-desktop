import * as React from 'react'
import { GitHubRepository } from '../../models/github-repository'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  OkCancelButtonGroup,
} from '../dialog'
import { RepoRulesetsForBranchLink } from './repo-rulesets-for-branch-link'

interface IRepoRulesBypassConfirmationProps {
  readonly repository: GitHubRepository
  readonly branch: string
  readonly onConfirm: () => void
  readonly onDismissed: () => void
}

/**
 * Returns a LinkButton to the webpage for the ruleset with the
 * provided ID within the provided repo.
 */
export class RepoRulesBypassConfirmation extends React.Component<
  IRepoRulesBypassConfirmationProps,
  {}
> {
  public render() {
    return (
      <Dialog
        id="repo-rules-bypass-confirmation"
        title="リポジトリルールをバイパス"
        onSubmit={this.submit}
        onDismissed={this.props.onDismissed}
        type="warning"
      >
        <DialogContent>
          このコミットは{' '}
          <RepoRulesetsForBranchLink
            repository={this.props.repository}
            branch={this.props.branch}
          >
            リポジトリルール
          </RepoRulesetsForBranchLink>
          をバイパスします。 本当にバイパスしますか？
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText="ルールをバイパスしてコミット"
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private submit = () => {
    this.props.onConfirm()
    this.props.onDismissed()
  }
}
