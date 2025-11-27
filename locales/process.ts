interface LocaleRecord {
    [k: string]: string | LocaleRecord;
    
};
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

export type Leaves<T> = T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T]
  : "";

export type PrefixWW<S extends string> = `ww:${S}`;



function flattenLocale<R extends LocaleRecord>(obj: R, into = {}, prefix = ''): Record<string, string> {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            into[prefix + key] = value;
        } else {
            flattenLocale(value, into, `${prefix}${key}.`);
        }
    }
    return into;
}

export function useLocale(locale) {
    const flattened = flattenLocale(locale, {}, 'ww:');
    console.log(flattened);
    mw.messages.set(flattened);
}
