export function normalizeUsername(input: string) {
    return input.trim().toLowerCase();
}

// 内部 email：用户永远不输入、不展示
export function usernameToEmail(username: string) {
    const u = normalizeUsername(username);

    // 可按需要放宽/收紧；先简单一点
    if (!/^[a-z0-9_]{3,20}$/.test(u)) {
        throw new Error("Username must be 3-20 chars: a-z, 0-9, underscore.");
    }

    return `${u}@sav4us.local`; // 只要是合法 email 格式就行
}
