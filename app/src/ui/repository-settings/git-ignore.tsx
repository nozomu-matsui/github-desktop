import * as React from 'react'
import { DialogContent } from '../dialog'
import { TextArea } from '../lib/text-area'
import { LinkButton } from '../lib/link-button'
import { Ref } from '../lib/ref'

interface IGitIgnoreProps {
  readonly text: string | null
  readonly onIgnoreTextChanged: (text: string) => void
  readonly onShowExamples: () => void
}

/** A view for creating or modifying the repository's gitignore file */
export class GitIgnore extends React.Component<IGitIgnoreProps, {}> {
  public render() {
    return (
      <DialogContent>
        <p>
          <Ref>.gitignore</Ref> を編集しています。 このファイルでは、Git
          が無視して追跡しないファイルを指定できます。 すでに Git
          で追跡済みのファイルには影響しません。{' '}
          <LinkButton onClick={this.props.onShowExamples}>
            gitignore ファイルについて、さらに詳しく
          </LinkButton>
        </p>

        <TextArea
          placeholder="無視するファイル"
          value={this.props.text || ''}
          onValueChanged={this.props.onIgnoreTextChanged}
          textareaClassName="gitignore"
        />
      </DialogContent>
    )
  }
}
