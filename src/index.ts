import { URL } from 'url';
import remoteOrigin from 'git-remote-origin-url';

export const getGithubRemoteInfo = async (repoRootPath: string): Promise<Record<'owner' | 'name', string> | undefined> => {
    let originUrl: undefined | string;
    try {
        try {
            originUrl = await remoteOrigin(repoRootPath);
        } catch (error) {
            if (error.message.startsWith('Couldn\'t find')) originUrl = undefined;
            else throw error;
        }

        if (!originUrl) return;

        const gitMatch = /git@github.com:(?<owner>\w+)\/(?<name>.+)(.git)/.exec(originUrl);
        if (gitMatch)
            return gitMatch.groups! as any;

        const url = new URL(originUrl);
        if (url.hostname !== 'github.com') throw new Error(`Unknown host ${url.hostname}`);

        let [, owner, name] = url.pathname.split('/');
        if (name.endsWith('.git'))
            name = name.slice(0, -'.git'.length);

        return { owner, name };
    } catch (error) {
        throw new Error(`${error.message} Error occured in ${repoRootPath} with remote origin ${originUrl!}`);
    }
};
