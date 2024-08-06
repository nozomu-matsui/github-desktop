import * as React from 'react'
import { ForkContributionTarget } from '../../models/workflow-preferences'
import { RepositoryWithForkedGitHubRepository } from '../../models/repository'

interface IForkSettingsDescription {
  readonly repository: RepositoryWithForkedGitHubRepository
  readonly forkContributionTarget: ForkContributionTarget
}

export function ForkSettingsDescription(props: IForkSettingsDescription) {
  // We can't use the getNonForkGitHubRepository() helper since we need to calculate
  // the value based on the temporary form state.
  const targetRepository =
    props.forkContributionTarget === ForkContributionTarget.Self
      ? props.repository.gitHubRepository
      : props.repository.gitHubRepository.parent

  return (
    <ul className="fork-settings-description">
      <li>
        <strong>{targetRepository.fullName}</strong>{' '}
        をターゲットにしているプルリクエストが、 一覧に表示されます。
      </li>
      <li>
        課題は <strong>{targetRepository.fullName}</strong> に作成されます。
      </li>
      <li>
        "GitHub で開く" は <strong>{targetRepository.fullName}</strong>{' '}
        をブラウザーで開きます。
      </li>
      <li>
        新規ブランチは <strong>{targetRepository.fullName}</strong>{' '}
        のデフォルトブランチをベースにします。
      </li>
      <li>
        ユーザや課題の自動補完は <strong>{targetRepository.fullName}</strong>{' '}
        をベースにします。
      </li>
    </ul>
  )
}
