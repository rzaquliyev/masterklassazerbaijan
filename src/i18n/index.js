import az from './az.json' with { type: 'json' };
import ru from './ru.json' with { type: 'json' };
import en from './en.json' with { type: 'json' };

export const DEFAULT_LANG = 'az';
export const SUPPORTED_LANGS = ['az', 'ru', 'en'];
export const dictionaries = { az, ru, en };
