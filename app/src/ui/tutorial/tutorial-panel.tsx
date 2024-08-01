import * as React from 'react'
import { join } from 'path'
import { LinkButton } from '../lib/link-button'
import { Button } from '../lib/button'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import {
  ValidTutorialStep,
  TutorialStep,
  orderedTutorialSteps,
} from '../../models/tutorial-step'
import { encodePathAsUrl } from '../../lib/path'
import { PopupType } from '../../models/popup'
import { PreferencesTab } from '../../models/preferences'
import { Ref } from '../lib/ref'
import { suggestedExternalEditor } from '../../lib/editors/shared'
import { TutorialStepInstructions } from './tutorial-step-instruction'
import { KeyboardShortcut } from '../keyboard-shortcut/keyboard-shortcut'

const TutorialPanelImage = encodePathAsUrl(
  __dirname,
  'static/required-status-check.svg'
)

interface ITutorialPanelProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository

  /** name of the configured external editor
   * (`undefined` if none is configured.)
   */
  readonly resolvedExternalEditor: string | null
  readonly currentTutorialStep: ValidTutorialStep
  readonly onExitTutorial: () => void
}

interface ITutorialPanelState {
  /** ID of the currently expanded tutorial step */
  readonly currentlyOpenSectionId: ValidTutorialStep
}

/** The Onboarding Tutorial Panel
 *  Renders a list of expandable tutorial steps (`TutorialListItem`).
 *  Enforces only having one step expanded at a time through
 *  event callbacks and local state.
 */
export class TutorialPanel extends React.Component<
  ITutorialPanelProps,
  ITutorialPanelState
> {
  public constructor(props: ITutorialPanelProps) {
    super(props)
    this.state = { currentlyOpenSectionId: this.props.currentTutorialStep }
  }

  private openTutorialFileInEditor = () => {
    this.props.dispatcher.openInExternalEditor(
      // TODO: tie this filename to a shared constant
      // for tutorial repos
      join(this.props.repository.path, 'README.md')
    )
  }

  private openPullRequest = () => {
    // This will cause the tutorial pull request step to close first.
    this.props.dispatcher.markPullRequestTutorialStepAsComplete(
      this.props.repository
    )

    // wait for the tutorial step to close before opening the PR, so that the
    // focusing of the "You're Done!" header is not interupted.
    setTimeout(() => {
      this.props.dispatcher.createPullRequest(this.props.repository)
    }, 500)
  }

  private skipEditorInstall = () => {
    this.props.dispatcher.skipPickEditorTutorialStep(this.props.repository)
  }

  private skipCreatePR = () => {
    this.props.dispatcher.markPullRequestTutorialStepAsComplete(
      this.props.repository
    )
  }

  private isStepComplete = (step: ValidTutorialStep) => {
    return (
      orderedTutorialSteps.indexOf(step) <
      orderedTutorialSteps.indexOf(this.props.currentTutorialStep)
    )
  }

  private isStepNextTodo = (step: ValidTutorialStep) => {
    return step === this.props.currentTutorialStep
  }

  public componentWillReceiveProps(nextProps: ITutorialPanelProps) {
    if (this.props.currentTutorialStep !== nextProps.currentTutorialStep) {
      this.setState({
        currentlyOpenSectionId: nextProps.currentTutorialStep,
      })
    }
  }

  public render() {
    return (
      <div className="tutorial-panel-component panel">
        <div className="titleArea">
          <h3>Get started</h3>
          <img src={TutorialPanelImage} alt="Partially checked check list" />
        </div>
        <ol>
          <TutorialStepInstructions
            summaryText="Install a text editor"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.PickEditor}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            skipLinkButton={<SkipLinkButton onClick={this.skipEditorInstall} />}
            onSummaryClick={this.onStepSummaryClick}
          >
            {!this.isStepComplete(TutorialStep.PickEditor) ? (
              <>
                <p className="description">
                  テキストエディターがインストールされいないようです。
                  お奨めとしては、{' '}
                  <LinkButton
                    uri={suggestedExternalEditor.url}
                    title={`${suggestedExternalEditor.name} のサイトを開く`}
                  >
                    {suggestedExternalEditor.name}
                  </LinkButton>
                  {` もしくは `}
                  <LinkButton uri="https://atom.io" title="Atom のサイトを開く">
                    Atom
                  </LinkButton>
                  などがありますが、お好みのテキストエディターをお使いいただけます。
                </p>
                <div className="action">
                  <LinkButton onClick={this.skipEditorInstall}>
                    テキストエディターを持っているのでスキップする
                  </LinkButton>
                </div>
              </>
            ) : (
              <p className="description">
                デフォルトエディターは{' '}
                <strong>{this.props.resolvedExternalEditor}</strong>
                に設定されています。{' '}
                <LinkButton onClick={this.onPreferencesClick}>
                  設定
                </LinkButton>{' '}
                から変更できます。
              </p>
            )}
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="ブランチを作成する"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.CreateBranch}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              ブランチを使うことで、ひとつのレポジトリで複数バージョンの作業ができます。
              トップバーのブランチメニューから
              {` `}"作成ブランチ..."{` `}をクリックすると、作成できます。
            </p>
            <div className="action">
              <KeyboardShortcut
                darwinKeys={['⌘', '⇧', 'N']}
                keys={['Ctrl', 'Shift', 'N']}
              />
            </div>
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="Edit a file"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.EditFile}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              お好みのテキストエディターを使って、このレポジトリを開いてください。
              そうしたら、{` `}
              <Ref>README.md</Ref>
              {` `}を編集してみてください。 保存したら、戻ってきてください。
            </p>
            {this.props.resolvedExternalEditor && (
              <div className="action">
                <Button onClick={this.openTutorialFileInEditor}>
                  エディターを開く
                </Button>
                <KeyboardShortcut
                  darwinKeys={['⌘', '⇧', 'A']}
                  keys={['Ctrl', 'Shift', 'A']}
                />
              </div>
            )}
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="コミットを作る"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.MakeCommit}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              コミットは、変更を保存することができます。 左下にある "サマリー"
              フィールドに、変更について簡潔な説明を書いてください。
              描き終わったら、青いコミットボタンを押したら完了です。
            </p>
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="GitHub にパブリッシュする"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.PushBranch}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              パブリッシュは、GitHub
              上のレポジトリのこのブランチに、あなたが作ったコミットを"プッシュ"
              もしくはアップロードします。
              パブリッシュはトップバーの3番目のボタンを使います。
            </p>
            <div className="action">
              <KeyboardShortcut darwinKeys={['⌘', 'P']} keys={['Ctrl', 'P']} />
            </div>
          </TutorialStepInstructions>
          <TutorialStepInstructions
            summaryText="プルリクエストを開く"
            isComplete={this.isStepComplete}
            isNextStepTodo={this.isStepNextTodo}
            sectionId={TutorialStep.OpenPullRequest}
            currentlyOpenSectionId={this.state.currentlyOpenSectionId}
            skipLinkButton={<SkipLinkButton onClick={this.skipCreatePR} />}
            onSummaryClick={this.onStepSummaryClick}
          >
            <p className="description">
              プルリクエストを使うことで、変更の提案ができます。
              プルリクエストを作ると、他の人にレビューやマージを依頼できます。
              このレポジトリはデモンストレーションなので、プルリクエストはプライベートになります。
            </p>
            <div className="action">
              <Button onClick={this.openPullRequest} role="link">
                プルリクエストを開く
                <Octicon symbol={octicons.linkExternal} />
              </Button>
              <KeyboardShortcut darwinKeys={['⌘', 'R']} keys={['Ctrl', 'R']} />
            </div>
          </TutorialStepInstructions>
        </ol>
        <div className="footer">
          <Button onClick={this.props.onExitTutorial}>
            チュートリアルを終了する
          </Button>
        </div>
      </div>
    )
  }
  /** this makes sure we only have one `TutorialListItem` open at a time */
  public onStepSummaryClick = (id: ValidTutorialStep) => {
    this.setState({ currentlyOpenSectionId: id })
  }

  private onPreferencesClick = () => {
    this.props.dispatcher.showPopup({
      type: PopupType.Preferences,
      initialSelectedTab: PreferencesTab.Integrations,
    })
  }
}

const SkipLinkButton: React.FunctionComponent<{
  onClick: () => void
}> = props => <LinkButton onClick={props.onClick}>Skip</LinkButton>
