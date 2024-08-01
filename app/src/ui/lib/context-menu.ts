const RestrictedFileExtensions = ['.cmd', '.exe', '.bat', '.sh']
export const CopyFilePathLabel = 'ファイルパスをコピー'

export const CopyRelativeFilePathLabel = '相対ファイルパスをコピー'

export const CopySelectedPathsLabel = 'ファイルパスをコピー'

export const CopySelectedRelativePathsLabel = '相対ファイルパスをコピー'

export const DefaultEditorLabel = '外部エディターで開く'

export const DefaultShellLabel = 'シェルで開く'

export const RevealInFileManagerLabel = __DARWIN__
  ? 'ファインダーで開く'
  : __WIN32__
  ? 'エクスプローラーで開く'
  : 'ファイルマネージャーで開く'

export const TrashNameLabel = 'ゴミ箱'

export const OpenWithDefaultProgramLabel = 'デフォルトアプリケーションで開く'

export function isSafeFileExtension(extension: string): boolean {
  if (__WIN32__) {
    return RestrictedFileExtensions.indexOf(extension.toLowerCase()) === -1
  }
  return true
}
