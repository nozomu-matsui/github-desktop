import * as React from 'react'

import { encodePathAsUrl } from '../../lib/path'

const CodeImage = encodePathAsUrl(__dirname, 'static/code.svg')
const TeamDiscussionImage = encodePathAsUrl(
  __dirname,
  'static/github-for-teams.svg'
)
const CloudServerImage = encodePathAsUrl(
  __dirname,
  'static/github-for-business.svg'
)

export class TutorialWelcome extends React.Component {
  public render() {
    return (
      <div id="tutorial-welcome">
        <div className="header">
          <h1>GitHub Desktop へようこそ！</h1>
          <p>
            Git や GitHub、GitHub Desktop
            に不慣れな方は、チュートリアルを使ってください。
          </p>
        </div>
        <ul className="definitions">
          <li>
            <img src={CodeImage} alt="Html syntax icon" />
            <p>
              <strong>Git</strong> はバージョン管理システムです。
            </p>
          </li>
          <li>
            <img
              src={TeamDiscussionImage}
              alt="People with discussion bubbles overhead"
            />
            <p>
              <strong>GitHub</strong>{' '}
              は、コードを格納して、他社とコラボレーションするための環境です。
            </p>
          </li>
          <li>
            <img src={CloudServerImage} alt="Server stack with cloud" />
            <p>
              <strong>GitHub Desktop</strong> は、GitHub
              でのローカル作業を支援します。
            </p>
          </li>
        </ul>
      </div>
    )
  }
}
