import { useLocale } from "./locales/process";
import zh from "./locales/zh.ts";
import zhHant from "./locales/zh-hant.ts";
import en from "./locales/en.ts";

const userLang = mw.config.get('wgUserLanguage');

if (['zh', 'zh-hans', 'zh-cn', 'zh-sg', 'zh-my'].includes(userLang)) {    
    useLocale(zh);
} else if (['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'].includes(userLang)) {
    useLocale(zhHant);
} else {
    useLocale(en);
}