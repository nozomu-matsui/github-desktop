import * as React from 'react'

import { UiView } from './ui-view'
import { Dispatcher } from './dispatcher'
import { Repository } from '../models/repository'

import { Button } from './lib/button'
import { Row } from './lib/row'
import { LinkButton } from './lib/link-button'
import { addSafeDirectory, getRepositoryType } from '../lib/git'
import { Ref } from './lib/ref'
import { Loading } from './lib/loading'

interface IMissingRepositoryProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
}

interface IMissingRepositoryState {
  readonly isPathUnsafe: boolean
  readonly unsafePath?: string
  readonly isTrustingPath: boolean
}

/** The view displayed when a repository is missing. */
export class MissingRepository extends React.Component<
  IMissingRepositoryProps,
  IMissingRepositoryState
> {
  public constructor(props: IMissingRepositoryProps) {
    super(props)
    this.state = { isPathUnsafe: false, isTrustingPath: false }
  }

  private onTrustDirectory = async () => {
    this.setState({ isTrustingPath: true })
    const { unsafePath } = this.state
    const { repository } = this.props

    if (unsafePath) {
      await addSafeDirectory(unsafePath)
      const type = await getRepositoryType(repository.path)

      this.setState({ isTrustingPath: false })

      if (type.kind !== 'unsafe') {
        this.checkAgain()
      }
    }
  }

  public async componentDidMount() {
    this.updateUnsafePathState()
  }

  public async componentDidUpdate(prevProps: IMissingRepositoryProps) {
    if (prevProps.repository.path !== this.props.repository.path) {
      this.updateUnsafePathState()
    }
  }

  private updateUnsafePathState = async () => {
    const { path } = this.props.repository
    const type = await getRepositoryType(path)
    if (path === this.props.repository.path) {
      this.setState({
        isPathUnsafe: type.kind === 'unsafe',
        unsafePath: type.kind === 'unsafe' ? type.path : undefined,
      })
    }
  }

  public render() {
    const buttons = new Array<JSX.Element>()
    const { isPathUnsafe, unsafePath } = this.state

    if (!isPathUnsafe) {
      buttons.push(
        <Button key="locate" onClick={this.locate} type="submit">
          フォルダを選択...
        </Button>
      )

      if (this.canCloneAgain()) {
        buttons.push(
          <Button key="clone-again" onClick={this.cloneAgain}>
            再度クローンする
          </Button>
        )
      }
    } else {
      buttons.push(
        <Button
          key="trustDirectory"
          onClick={this.onTrustDirectory}
          type="submit"
          disabled={this.state.isTrustingPath}
        >
          {this.state.isTrustingPath && <Loading />}
          リポジトリを信頼する
        </Button>
      )
    }

    buttons.push(
      <Button key="remove" onClick={this.remove}>
        削除する
      </Button>
    )

    if (isPathUnsafe) {
      return (
        <UiView id="missing-repository-view">
          <div className="title-container">
            <div className="title">
              {this.props.repository.name} is potentially unsafe
            </div>
            <div className="details">
              <p>
                この Git リポジトリ <Ref>{unsafePath}</Ref>{' '}
                他のユーザがオーナーのようです。
                信頼できないリポジトリの追加は、リポジトリ内のファイルが自動的に実行されるおそれがあります。
              </p>
              <p>
                フォルダのオーナーが信頼できる場合は、例外を追加することでコンティニューできます。
              </p>
            </div>
          </div>

          <Row>{buttons}</Row>
        </UiView>
      )
    }

    return (
      <UiView id="missing-repository-view">
        <div className="title-container">
          <div className="title">
            "{this.props.repository.name}" が見つかりません。
          </div>
          <div className="details">
            最後に使った時は{' '}
            <span className="path">{this.props.repository.path}</span>{' '}
            に存在しました。{' '}
            <LinkButton onClick={this.checkAgain}>再度チェックする</LinkButton>
          </div>
        </div>
        <Row>{buttons}</Row>
      </UiView>
    )
  }

  private canCloneAgain() {
    const gitHubRepository = this.props.repository.gitHubRepository
    return gitHubRepository && gitHubRepository.cloneURL
  }

  private checkAgain = () => {
    this.props.dispatcher.refreshRepository(this.props.repository)
  }

  private remove = () => {
    this.props.dispatcher.removeRepository(this.props.repository, false)
  }

  private locate = () => {
    this.props.dispatcher.relocateRepository(this.props.repository)
  }

  private cloneAgain = async () => {
    const gitHubRepository = this.props.repository.gitHubRepository
    if (!gitHubRepository) {
      return
    }

    const cloneURL = gitHubRepository.cloneURL
    if (!cloneURL) {
      return
    }

    try {
      await this.props.dispatcher.cloneAgain(
        cloneURL,
        this.props.repository.path
      )
    } catch (error) {
      this.props.dispatcher.postError(error)
    }
  }
}
