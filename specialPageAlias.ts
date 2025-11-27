

export async function toUnifiedSpecialPageName(name: string) {
    // 缓存到localStorage
    let cache;
    try {
        cache = JSON.parse(localStorage.getItem('ww:specialPageAliasCache'));
    } catch (e) {} // 忽略解析错误，重新请求
    
    if (cache) {
        return cache[name];
    } else {
        const aliases = await queryAliases();
        localStorage.setItem('ww:specialPageAliasCache', JSON.stringify(aliases));
        return aliases[name];
    }
}

interface QueryResult {
    query: {
        specialpagealiases: Array<{
            realname: string;
            aliases: string[];
        }>
    }
}

async function queryAliases() {
    const result = await (new mw.Api).get({
        action: 'query',
        meta: 'siteinfo',
        siprop: 'specialpagealiases',
        formatversion: 2
    }) as QueryResult;
    const obj = {} as Record<string, string>;
    for (const entity of result.query.specialpagealiases) {
        for (const alias of entity.aliases) {
            obj[alias] = entity.realname;
        }
    }
    return obj;
}



