import { getGithubRemoteInfo, RepoInfo } from '../src/index'
import { expectType } from 'tsd'

// Ensure defaults works in the same way
expectType<RepoInfo | undefined>(await getGithubRemoteInfo(''))

expectType<RepoInfo>(await getGithubRemoteInfo('', 'object', false))

expectType<string | undefined>(await getGithubRemoteInfo('', 'slug'))

expectType<string>(await getGithubRemoteInfo('', 'url', false))
