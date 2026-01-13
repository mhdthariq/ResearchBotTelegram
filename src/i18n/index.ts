/**
 * Internationalization (i18n) Module
 *
 * Provides multi-language support for the Research Bot.
 * Supports dynamic language switching per user and fallback to default language.
 *
 * To add a new language:
 * 1. Create a new file in src/i18n/locales/ (e.g., fr.ts)
 * 2. Copy the structure from en.ts and translate all strings
 * 3. Import and add the locale to the translations object below
 * 4. Add the language code to LanguageCode type in types.ts
 * 5. Add the language name to LANGUAGE_NAMES in types.ts
 */

// Re-export types for convenience
export {
	DEFAULT_LANGUAGE,
	LANGUAGE_NAMES,
	type LanguageCode,
	type Translations,
} from "./types.js";

// Import locale files
import { ar } from "./locales/ar.js";
import { de } from "./locales/de.js";
import { en } from "./locales/en.js";
import { es } from "./locales/es.js";
import { fr } from "./locales/fr.js";
import { id } from "./locales/id.js";
import { ja } from "./locales/ja.js";
import { pt } from "./locales/pt.js";
import { ru } from "./locales/ru.js";
import { zh } from "./locales/zh.js";

import {
	DEFAULT_LANGUAGE,
	type LanguageCode,
	type Translations,
} from "./types.js";

/**
 * All available translations
 *
 * Each language has its own dedicated locale file with full translations.
 */
const translations: Record<LanguageCode, Translations> = {
	en,
	es,
	zh,
	ru,
	pt,
	fr,
	de,
	ja,
	ar,
	id,
};

/**
 * Get translations for a specific language
 *
 * @param lang - Language code
 * @returns Translation object
 */
export function getTranslations(lang: LanguageCode | string): Translations {
	const code =
		(lang as LanguageCode) in translations
			? (lang as LanguageCode)
			: DEFAULT_LANGUAGE;
	return translations[code];
}

/**
 * Get a specific translation string with interpolation
 *
 * @param lang - Language code
 * @param key - Dot-notation key path (e.g., "search.noResults")
 * @param params - Optional interpolation parameters
 * @returns Translated string
 *
 * @example
 * t("en", "search.results", { count: 10, topic: "AI" })
 * // Returns: "📄 Found 10 papers for 'AI'"
 */
export function t(
	lang: LanguageCode | string,
	key: string,
	params?: Record<string, string | number>,
): string {
	const trans = getTranslations(lang);
	const keys = key.split(".");

	// biome-ignore lint/suspicious/noExplicitAny: Dynamic key access
	let value: any = trans;
	for (const k of keys) {
		if (value && typeof value === "object" && k in value) {
			value = value[k];
		} else {
			// Fall back to English if key not found
			// biome-ignore lint/suspicious/noExplicitAny: Dynamic key access
			let fallback: any = translations.en;
			for (const fk of keys) {
				if (fallback && typeof fallback === "object" && fk in fallback) {
					fallback = fallback[fk];
				} else {
					return key; // Return key if not found in fallback either
				}
			}
			value = fallback;
			break;
		}
	}

	if (typeof value !== "string") {
		return key;
	}

	// Interpolate parameters
	if (params) {
		for (const [paramKey, paramValue] of Object.entries(params)) {
			value = value.replace(
				new RegExp(`\\{${paramKey}\\}`, "g"),
				String(paramValue),
			);
		}
	}

	return value;
}

/**
 * Detect language from Telegram language code
 *
 * @param telegramLangCode - Language code from Telegram user
 * @returns Supported language code
 */
export function detectLanguage(telegramLangCode?: string): LanguageCode {
	if (!telegramLangCode) {
		return DEFAULT_LANGUAGE;
	}

	// Normalize to lowercase and get base language
	const parts = telegramLangCode.toLowerCase().split("-");
	const normalized = parts[0] ?? "";

	if (normalized && normalized in translations) {
		return normalized as LanguageCode;
	}

	// Map common variants
	const languageMap: Record<string, LanguageCode> = {
		"zh-cn": "zh",
		"zh-tw": "zh",
		"zh-hk": "zh",
		"pt-br": "pt",
		"pt-pt": "pt",
		"es-mx": "es",
		"es-ar": "es",
		"es-es": "es",
		"fr-ca": "fr",
		"fr-fr": "fr",
		"de-at": "de",
		"de-ch": "de",
		"de-de": "de",
		"ar-sa": "ar",
		"ar-eg": "ar",
		"ar-ae": "ar",
		"id-id": "id",
	};

	const fullCode = telegramLangCode.toLowerCase();
	const mappedLang = languageMap[fullCode];
	if (mappedLang) {
		return mappedLang;
	}

	return DEFAULT_LANGUAGE;
}

/**
 * Check if a language is supported
 *
 * @param lang - Language code to check
 * @returns Whether the language is supported
 */
export function isLanguageSupported(lang: string): boolean {
	return lang in translations;
}

/**
 * Get all supported language codes
 *
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): LanguageCode[] {
	return Object.keys(translations) as LanguageCode[];
}

/**
 * I18n helper class for per-user translation management
 */
export class I18n {
	private lang: LanguageCode;

	constructor(lang: LanguageCode | string = DEFAULT_LANGUAGE) {
		this.lang = detectLanguage(lang);
	}

	/**
	 * Get current language code
	 */
	get language(): LanguageCode {
		return this.lang;
	}

	/**
	 * Set language
	 */
	setLanguage(lang: LanguageCode | string): void {
		this.lang = detectLanguage(lang);
	}

	/**
	 * Get all translations for current language
	 */
	getAll(): Translations {
		return getTranslations(this.lang);
	}

	/**
	 * Translate a key
	 */
	t(key: string, params?: Record<string, string | number>): string {
		return t(this.lang, key, params);
	}
}

// Export default instance for English
export const i18n = new I18n();
