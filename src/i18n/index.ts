/**
 * Internationalization (i18n) Module
 *
 * Provides multi-language support for the Research Bot.
 * Supports dynamic language switching per user and fallback to default language.
 */

/**
 * Supported language codes
 */
export type LanguageCode =
	| "en"
	| "es"
	| "zh"
	| "ru"
	| "pt"
	| "fr"
	| "de"
	| "ja";

/**
 * Default language when user's language is not supported
 */
export const DEFAULT_LANGUAGE: LanguageCode = "en";

/**
 * Translation keys organized by category
 */
export interface Translations {
	// General
	welcome: string;
	help: string;
	error: string;
	success: string;
	loading: string;
	cancel: string;

	// Commands
	commands: {
		start: string;
		help: string;
		search: string;
		more: string;
		bookmarks: string;
		history: string;
		stats: string;
		categories: string;
		author: string;
		export: string;
		subscribe: string;
		subscriptions: string;
		unsubscribe: string;
		similar: string;
	};

	// Search
	search: {
		prompt: string;
		noResults: string;
		results: string;
		loadMore: string;
		newSearch: string;
		tip: string;
		searching: string;
	};

	// Papers
	papers: {
		title: string;
		authors: string;
		published: string;
		abstract: string;
		categories: string;
		viewPdf: string;
		viewArxiv: string;
		moreAuthors: string;
	};

	// Bookmarks
	bookmarks: {
		title: string;
		empty: string;
		added: string;
		removed: string;
		exists: string;
		exportTitle: string;
		exportEmpty: string;
	};

	// History
	history: {
		title: string;
		empty: string;
		cleared: string;
		clearConfirm: string;
	};

	// Subscriptions
	subscriptions: {
		title: string;
		empty: string;
		created: string;
		deleted: string;
		updated: string;
		prompt: string;
		interval: string;
		manage: string;
	};

	// Errors
	errors: {
		apiError: string;
		rateLimited: string;
		invalidCommand: string;
		invalidInput: string;
		notFound: string;
		unauthorized: string;
		tryAgain: string;
	};

	// Buttons
	buttons: {
		previous: string;
		next: string;
		bookmark: string;
		unbookmark: string;
		details: string;
		similar: string;
		bibtex: string;
		back: string;
		confirm: string;
		settings: string;
	};

	// Stats
	stats: {
		title: string;
		searches: string;
		uniqueQueries: string;
		bookmarksCount: string;
		subscriptionsCount: string;
	};

	// Categories
	categories: {
		title: string;
		select: string;
	};

	// Time
	time: {
		hours: string;
		days: string;
		weeks: string;
	};
}

/**
 * English translations (default)
 */
const en: Translations = {
	welcome:
		"👋 Welcome to Research Bot!\n\nI help you discover and track the latest research papers from arXiv.",
	help: "📚 Available Commands",
	error: "❌ An error occurred",
	success: "✅ Success",
	loading: "⏳ Loading...",
	cancel: "Operation cancelled",

	commands: {
		start: "Start the bot",
		help: "Show available commands",
		search: "Search for papers",
		more: "Load more results",
		bookmarks: "View saved papers",
		history: "View search history",
		stats: "View your statistics",
		categories: "Browse by category",
		author: "Search by author",
		export: "Export bookmarks as BibTeX",
		subscribe: "Subscribe to a topic",
		subscriptions: "Manage subscriptions",
		unsubscribe: "Remove a subscription",
		similar: "Find similar papers",
	},

	search: {
		prompt: "🔍 What topic would you like to search for?",
		noResults:
			"🔍 No papers found.\n\nTry different keywords or check your spelling.",
		results: "📄 Found {count} papers for '{topic}'",
		loadMore: "Load More",
		newSearch: "New Search",
		tip: "💡 Tip: Use specific terms for better results.",
		searching: "🔍 Searching...",
	},

	papers: {
		title: "Title",
		authors: "Authors",
		published: "Published",
		abstract: "Abstract",
		categories: "Categories",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} more",
	},

	bookmarks: {
		title: "🔖 Your Bookmarks",
		empty: "📚 No bookmarks yet. Save some papers first!",
		added: "✅ Paper bookmarked!",
		removed: "🗑️ Bookmark removed",
		exists: "📌 Already bookmarked",
		exportTitle: "📚 BibTeX Export",
		exportEmpty: "📚 No bookmarks to export. Save some papers first!",
	},

	history: {
		title: "📜 Search History",
		empty: "📜 No search history yet. Start with /search!",
		cleared: "📜 Search history cleared.",
		clearConfirm: "Are you sure you want to clear your search history?",
	},

	subscriptions: {
		title: "📬 Your Subscriptions",
		empty:
			"📭 You don't have any subscriptions yet.\nUse /subscribe <topic> to get periodic updates on research topics.",
		created: "✅ Subscribed to '{topic}'",
		deleted: "🗑️ Subscription removed",
		updated: "✅ Subscription updated",
		prompt: "📬 What topic would you like to subscribe to?",
		interval: "Notification interval",
		manage: "Manage",
	},

	errors: {
		apiError: "❌ Error fetching papers. Please try again later.",
		rateLimited: "⏳ Too many requests. Please wait {seconds} seconds.",
		invalidCommand: "❓ Unknown command. Use /help for available commands.",
		invalidInput: "❌ Invalid input. Please check and try again.",
		notFound: "❌ Not found.",
		unauthorized: "🔒 You don't have permission to do this.",
		tryAgain: "Please try again later.",
	},

	buttons: {
		previous: "⬅️ Previous",
		next: "➡️ Next",
		bookmark: "🔖 Bookmark",
		unbookmark: "🗑️ Remove",
		details: "📋 Details",
		similar: "🔗 Similar",
		bibtex: "📝 BibTeX",
		back: "⬅️ Back",
		confirm: "✅ Confirm",
		settings: "⚙️ Settings",
	},

	stats: {
		title: "📊 Your Statistics",
		searches: "🔍 Searches",
		uniqueQueries: "📝 Unique Queries",
		bookmarksCount: "🔖 Bookmarks",
		subscriptionsCount: "📬 Subscriptions",
	},

	categories: {
		title: "📂 Categories",
		select: "Select a category to browse:",
	},

	time: {
		hours: "hours",
		days: "days",
		weeks: "weeks",
	},
};

/**
 * Spanish translations
 */
const es: Translations = {
	welcome:
		"👋 ¡Bienvenido a Research Bot!\n\nTe ayudo a descubrir y seguir los últimos artículos de investigación de arXiv.",
	help: "📚 Comandos Disponibles",
	error: "❌ Ocurrió un error",
	success: "✅ Éxito",
	loading: "⏳ Cargando...",
	cancel: "Operación cancelada",

	commands: {
		start: "Iniciar el bot",
		help: "Mostrar comandos disponibles",
		search: "Buscar artículos",
		more: "Cargar más resultados",
		bookmarks: "Ver artículos guardados",
		history: "Ver historial de búsqueda",
		stats: "Ver tus estadísticas",
		categories: "Explorar por categoría",
		author: "Buscar por autor",
		export: "Exportar marcadores como BibTeX",
		subscribe: "Suscribirse a un tema",
		subscriptions: "Gestionar suscripciones",
		unsubscribe: "Eliminar una suscripción",
		similar: "Encontrar artículos similares",
	},

	search: {
		prompt: "🔍 ¿Qué tema te gustaría buscar?",
		noResults:
			"🔍 No se encontraron artículos.\n\nIntenta con diferentes palabras clave.",
		results: "📄 Se encontraron {count} artículos para '{topic}'",
		loadMore: "Cargar Más",
		newSearch: "Nueva Búsqueda",
		tip: "💡 Consejo: Usa términos específicos para mejores resultados.",
		searching: "🔍 Buscando...",
	},

	papers: {
		title: "Título",
		authors: "Autores",
		published: "Publicado",
		abstract: "Resumen",
		categories: "Categorías",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} más",
	},

	bookmarks: {
		title: "🔖 Tus Marcadores",
		empty: "📚 Sin marcadores aún. ¡Guarda algunos artículos primero!",
		added: "✅ ¡Artículo guardado!",
		removed: "🗑️ Marcador eliminado",
		exists: "📌 Ya está guardado",
		exportTitle: "📚 Exportación BibTeX",
		exportEmpty:
			"📚 No hay marcadores para exportar. ¡Guarda algunos artículos!",
	},

	history: {
		title: "📜 Historial de Búsqueda",
		empty: "📜 Sin historial aún. ¡Comienza con /search!",
		cleared: "📜 Historial borrado.",
		clearConfirm: "¿Estás seguro de que quieres borrar tu historial?",
	},

	subscriptions: {
		title: "📬 Tus Suscripciones",
		empty:
			"📭 No tienes suscripciones aún.\nUsa /subscribe <tema> para recibir actualizaciones periódicas.",
		created: "✅ Suscrito a '{topic}'",
		deleted: "🗑️ Suscripción eliminada",
		updated: "✅ Suscripción actualizada",
		prompt: "📬 ¿A qué tema te gustaría suscribirte?",
		interval: "Intervalo de notificación",
		manage: "Gestionar",
	},

	errors: {
		apiError: "❌ Error al obtener artículos. Intenta más tarde.",
		rateLimited: "⏳ Demasiadas solicitudes. Espera {seconds} segundos.",
		invalidCommand: "❓ Comando desconocido. Usa /help para ver los comandos.",
		invalidInput: "❌ Entrada inválida. Verifica e intenta de nuevo.",
		notFound: "❌ No encontrado.",
		unauthorized: "🔒 No tienes permiso para hacer esto.",
		tryAgain: "Por favor intenta más tarde.",
	},

	buttons: {
		previous: "⬅️ Anterior",
		next: "➡️ Siguiente",
		bookmark: "🔖 Guardar",
		unbookmark: "🗑️ Eliminar",
		details: "📋 Detalles",
		similar: "🔗 Similares",
		bibtex: "📝 BibTeX",
		back: "⬅️ Volver",
		confirm: "✅ Confirmar",
		settings: "⚙️ Ajustes",
	},

	stats: {
		title: "📊 Tus Estadísticas",
		searches: "🔍 Búsquedas",
		uniqueQueries: "📝 Consultas Únicas",
		bookmarksCount: "🔖 Marcadores",
		subscriptionsCount: "📬 Suscripciones",
	},

	categories: {
		title: "📂 Categorías",
		select: "Selecciona una categoría para explorar:",
	},

	time: {
		hours: "horas",
		days: "días",
		weeks: "semanas",
	},
};

/**
 * Chinese (Simplified) translations
 */
const zh: Translations = {
	welcome:
		"👋 欢迎使用 Research Bot！\n\n我帮助您发现和追踪 arXiv 上的最新研究论文。",
	help: "📚 可用命令",
	error: "❌ 发生错误",
	success: "✅ 成功",
	loading: "⏳ 加载中...",
	cancel: "操作已取消",

	commands: {
		start: "启动机器人",
		help: "显示可用命令",
		search: "搜索论文",
		more: "加载更多结果",
		bookmarks: "查看已保存的论文",
		history: "查看搜索历史",
		stats: "查看您的统计",
		categories: "按类别浏览",
		author: "按作者搜索",
		export: "导出书签为 BibTeX",
		subscribe: "订阅主题",
		subscriptions: "管理订阅",
		unsubscribe: "取消订阅",
		similar: "查找相似论文",
	},

	search: {
		prompt: "🔍 您想搜索什么主题？",
		noResults: "🔍 未找到论文。\n\n请尝试不同的关键词。",
		results: "📄 为 '{topic}' 找到 {count} 篇论文",
		loadMore: "加载更多",
		newSearch: "新搜索",
		tip: "💡 提示：使用具体术语获得更好的结果。",
		searching: "🔍 搜索中...",
	},

	papers: {
		title: "标题",
		authors: "作者",
		published: "发布日期",
		abstract: "摘要",
		categories: "类别",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} 位更多",
	},

	bookmarks: {
		title: "🔖 您的书签",
		empty: "📚 还没有书签。先保存一些论文吧！",
		added: "✅ 已添加书签！",
		removed: "🗑️ 书签已移除",
		exists: "📌 已经添加过书签",
		exportTitle: "📚 BibTeX 导出",
		exportEmpty: "📚 没有可导出的书签。先保存一些论文！",
	},

	history: {
		title: "📜 搜索历史",
		empty: "📜 还没有搜索历史。开始使用 /search！",
		cleared: "📜 搜索历史已清除。",
		clearConfirm: "您确定要清除搜索历史吗？",
	},

	subscriptions: {
		title: "📬 您的订阅",
		empty: "📭 您还没有任何订阅。\n使用 /subscribe <主题> 获取定期更新。",
		created: "✅ 已订阅 '{topic}'",
		deleted: "🗑️ 订阅已移除",
		updated: "✅ 订阅已更新",
		prompt: "📬 您想订阅什么主题？",
		interval: "通知间隔",
		manage: "管理",
	},

	errors: {
		apiError: "❌ 获取论文时出错。请稍后再试。",
		rateLimited: "⏳ 请求过多。请等待 {seconds} 秒。",
		invalidCommand: "❓ 未知命令。使用 /help 查看可用命令。",
		invalidInput: "❌ 输入无效。请检查后重试。",
		notFound: "❌ 未找到。",
		unauthorized: "🔒 您没有权限执行此操作。",
		tryAgain: "请稍后再试。",
	},

	buttons: {
		previous: "⬅️ 上一页",
		next: "➡️ 下一页",
		bookmark: "🔖 收藏",
		unbookmark: "🗑️ 移除",
		details: "📋 详情",
		similar: "🔗 相似",
		bibtex: "📝 BibTeX",
		back: "⬅️ 返回",
		confirm: "✅ 确认",
		settings: "⚙️ 设置",
	},

	stats: {
		title: "📊 您的统计",
		searches: "🔍 搜索次数",
		uniqueQueries: "📝 独特查询",
		bookmarksCount: "🔖 书签数",
		subscriptionsCount: "📬 订阅数",
	},

	categories: {
		title: "📂 类别",
		select: "选择一个类别浏览：",
	},

	time: {
		hours: "小时",
		days: "天",
		weeks: "周",
	},
};

/**
 * All available translations
 */
const translations: Record<LanguageCode, Translations> = {
	en,
	es,
	zh,
	// Placeholder for other languages - fall back to English
	ru: en,
	pt: en,
	fr: en,
	de: en,
	ja: en,
};

/**
 * Language display names
 */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
	en: "English",
	es: "Español",
	zh: "中文",
	ru: "Русский",
	pt: "Português",
	fr: "Français",
	de: "Deutsch",
	ja: "日本語",
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

// Export translations for direct access
export { translations };
