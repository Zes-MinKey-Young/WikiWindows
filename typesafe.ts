import type {
    Leaves,
    PrefixWW
} from './locales/process.ts';


declare module 'vue' {
    interface ComponentCustomProperties {
        // to get a type-safe dev experience, modify the `node_modules\types-mediawiki\vue\index.d.ts`:
        // $i18n(...): ... instead of $i18n: (...) => ...
        $i18n(key: PrefixWW<Leaves<typeof import('./locales/zh.ts').default>>, ...parameters: any[]): mw.Message;
    }
}
