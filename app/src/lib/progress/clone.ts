import { GitProgressParser } from './git'

/**
 * Highly approximate (some would say outright inaccurate) division
 * of the individual progress reporting steps in a clone operation
 */
const steps = [
  { title: 'リモート: オブジェクトを圧縮しています', weight: 0.1 },
  { title: 'オブジェクトを受信しています', weight: 0.6 },
  { title: 'デルタを解決しています', weight: 0.1 },
  { title: 'ファイルをチェックアウトしています', weight: 0.2 },
]

/**
 * A utility class for interpreting the output from `git clone --progress`
 * and turning that into a percentage value estimating the overall progress
 * of the clone.
 */
export class CloneProgressParser extends GitProgressParser {
  public constructor() {
    super(steps)
  }
}
