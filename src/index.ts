import { URL } from 'url'
import remoteOrigin from 'git-remote-origin-url'

//TODO didn't name repo because it could be annoying to see in import suggestions
export interface RepoInfo {
    owner: string
    name: string
}

// TODO revamp typechecking here
/**
 * @param cwd Dir in which .git is present
 * @param returnFormat In which format return data:
 * - object - object with owner/name (default)
 * - slug - string with `owner/name` e.g. zardoy/github-remote-info
 * - url - full github url to the repo
 *
 * Can't be `undefined`, otherwise wrong type will be returned
 * @param throwIfNoOrigin If true and origin  will throw instead of returning `undefined`
 * @throws It will throw **anyway** if origin host is not GitHub
 */
export const getGithubRemoteInfo = async <T extends 'object' | 'slug' | 'url' = 'object', K extends boolean = false>(
    cwd: string,
    //@ts-expect-error How does it make any sense?
    returnFormat: T = 'object',
    //@ts-expect-error
    throwIfNoOrigin: K = false,
    //@ts-expect-error That's unfortunately
): Promise<(T extends 'object' ? RepoInfo : string) | (K extends true ? never : undefined)> => {
    let originUrl: undefined | string
    try {
        try {
            originUrl = await remoteOrigin(cwd)
        } catch (error) {
            if (throwIfNoOrigin) throw error
            if (error.message.startsWith("Couldn't find")) originUrl = undefined
            else throw error
        }

        if (!originUrl) return undefined as any

        const gitMatch = /git@github.com:(?<owner>\w+)\/(?<name>.+)(.git)/.exec(originUrl)
        if (gitMatch) return gitMatch.groups! as any

        const url = new URL(originUrl)
        if (url.hostname !== 'github.com') throw new Error(`Unknown host in origin ${url.hostname}`)

        let [, owner, name] = url.pathname.split('/')
        if (name.endsWith('.git')) name = name.slice(0, -'.git'.length)

        switch (returnFormat) {
            case 'object':
                return { owner, name } as any
                break
            case 'slug':
                return `${owner}/${name}` as any
            case 'url':
                return `https://github.com/${owner}/${name}` as any
        }
    } catch (error) {
        throw new Error(`${error.message}. Error occured in ${cwd} with remote origin ${originUrl!}`)
    }
}
