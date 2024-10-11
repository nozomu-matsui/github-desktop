import * as React from 'react'
import { Branch, BranchType } from '../../models/branch'

import { Row } from './row'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Ref } from './ref'

export function renderBranchHasRemoteWarning(branch: Branch) {
  if (branch.upstream != null) {
    return (
      <Row className="warning-helper-text">
        <Octicon symbol={octicons.alert} />
        <p>
          このブランチは <Ref>{branch.upstream}</Ref>{' '}
          を追跡しています。リネームはリモートブランチ名に影響しません。
        </p>
      </Row>
    )
  } else {
    return null
  }
}

export function renderBranchNameExistsOnRemoteWarning(
  sanitizedName: string,
  branches: ReadonlyArray<Branch>
) {
  const alreadyExistsOnRemote =
    branches.findIndex(
      b => b.nameWithoutRemote === sanitizedName && b.type === BranchType.Remote
    ) > -1

  if (alreadyExistsOnRemote === false) {
    return null
  }

  return (
    <Row className="warning-helper-text">
      <Octicon symbol={octicons.alert} />
      <p>
        ブランチ名 <Ref>{sanitizedName}</Ref> は、すでにリモートに存在します。.
      </p>
    </Row>
  )
}
