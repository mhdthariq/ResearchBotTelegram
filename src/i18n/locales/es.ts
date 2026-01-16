/**
 * Spanish Translations (Español)
 */

import type { Translations } from "../types";

export const es: Translations = {
	// General
	welcome:
		"👋 ¡Bienvenido a Research Bot!\n\nTe ayudo a descubrir y seguir los últimos artículos de investigación de arXiv.\n\nUsa /help para ver los comandos disponibles.",
	help: "📚 Comandos Disponibles",
	error: "❌ Ocurrió un error",
	success: "✅ Éxito",
	loading: "⏳ Cargando...",
	cancel: "Operación cancelada",

	// Commands
	commands: {
		start: "Iniciar el bot y ver mensaje de bienvenida",
		help: "Mostrar todos los comandos disponibles",
		search: "Buscar artículos de investigación por tema",
		more: "Cargar más resultados de la búsqueda actual",
		bookmarks: "Ver tus artículos guardados",
		history: "Ver tu historial de búsqueda reciente",
		stats: "Ver tus estadísticas personales",
		categories: "Explorar artículos por categoría de arXiv",
		author: "Buscar artículos por nombre de autor",
		export: "Exportar tus marcadores como BibTeX",
		subscribe: "Suscribirse a un tema de investigación para actualizaciones",
		subscriptions: "Ver y gestionar tus suscripciones",
		unsubscribe: "Eliminar una suscripción de tema",
		similar: "Encontrar artículos similares a uno dado",
	},

	// Search
	search: {
		prompt:
			"🔍 ¿Qué tema te gustaría buscar?\n\nEscribe tu consulta de búsqueda o usa:\n/search [tema]",
		noResults:
			"🔍 No se encontraron artículos.\n\nIntenta con diferentes palabras clave o revisa la ortografía.",
		results: "📄 Se encontraron {count} artículos para '{topic}'",
		loadMore: "Cargar Más",
		newSearch: "🔍 Nueva Búsqueda",
		tip: '💡 Consejo: Usa términos específicos como "transformer attention mechanism" en lugar de solo "AI"',
		searching: "🔍 Buscando artículos...",
	},

	// Papers
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

	// Bookmarks
	bookmarks: {
		title: "🔖 Tus Marcadores",
		empty:
			"📚 Sin marcadores aún.\n\n¡Guarda artículos de los resultados de búsqueda para verlos aquí!",
		added: "✅ ¡Artículo añadido a marcadores!",
		removed: "🗑️ Marcador eliminado",
		exists: "📌 Este artículo ya está guardado",
		exportTitle: "📚 Exportación BibTeX",
		exportEmpty:
			"📚 No hay marcadores para exportar.\n\n¡Guarda algunos artículos primero!",
		total: "{count} total",
		searchButton: "🔍 Buscar",
		clearAllButton: "🗑️ Borrar Todo",
		alreadyBookmarked:
			"📌 ¡Este artículo ya está en tus marcadores!\n\nUsa /bookmarks para ver tus artículos guardados.",
		couldNotLoad:
			"❌ No se pudieron cargar tus marcadores. Por favor intenta de nuevo.",
	},

	// History
	history: {
		title: "📜 Historial de Búsqueda",
		empty:
			"📜 Sin historial de búsqueda aún.\n\n¡Comienza con /search para encontrar artículos!",
		cleared: "📜 Historial de búsqueda borrado.",
		clearConfirm:
			"¿Estás seguro de que quieres borrar todo tu historial de búsqueda?",
		recentSearches: "🕐 Búsquedas Recientes",
		tapToSearch: "Toca una búsqueda para ejecutarla de nuevo:",
		fullHistory: "📜 Historial Completo",
		clearHistory: "🗑️ Borrar Historial",
		newSearch: "🔍 Nueva Búsqueda",
		noHistory: "📜 Sin historial de búsqueda aún.",
		startSearching: "¡Comienza con /search!",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 Tus Suscripciones",
		empty:
			"📭 No tienes suscripciones aún.\n\nUsa /subscribe <tema> para recibir actualizaciones periódicas sobre temas de investigación que te interesan.",
		created:
			"✅ ¡Suscrito exitosamente a '{topic}'!\n\nRecibirás actualizaciones sobre nuevos artículos.",
		deleted: "🗑️ Suscripción eliminada exitosamente",
		updated: "✅ Configuración de suscripción actualizada",
		prompt:
			"📬 ¿A qué tema te gustaría suscribirte?\n\nEjemplo: /subscribe machine learning\nCategoría opcional: /subscribe [cs.AI] neural networks",
		interval: "Intervalo de notificación",
		manage: "Gestionar",
		addSubscription: "➕ Añadir Suscripción",
		noSubscriptions: "📭 No tienes ninguna suscripción.",
		useSubscribe: "Usa /subscribe <tema> para recibir actualizaciones.",
	},

	// Errors
	errors: {
		apiError:
			"❌ Error al obtener artículos de arXiv.\n\nPor favor intenta más tarde.",
		rateLimited:
			"⏳ Demasiadas solicitudes. Por favor espera {seconds} segundos antes de intentar de nuevo.",
		invalidCommand:
			"❓ Comando desconocido.\n\nUsa /help para ver todos los comandos disponibles.",
		invalidInput:
			"❌ Entrada inválida.\n\nPor favor verifica tu entrada e intenta de nuevo.",
		notFound: "❌ No encontrado.",
		unauthorized: "🔒 No tienes permiso para realizar esta acción.",
		tryAgain: "Por favor intenta más tarde.",
	},

	// Buttons
	buttons: {
		previous: "⬅️ Anterior",
		next: "➡️ Siguiente",
		bookmark: "🔖 Guardar",
		unbookmark: "🗑️ Quitar Marcador",
		details: "📋 Detalles",
		similar: "🔗 Artículos Similares",
		bibtex: "📝 BibTeX",
		back: "⬅️ Volver",
		confirm: "✅ Confirmar",
		settings: "⚙️ Ajustes",
		search: "🔍 Buscar",
		searchPapers: "🔍 Buscar Artículos",
	},

	// Stats
	stats: {
		title: "📊 Tus Estadísticas",
		searches: "🔍 Total de Búsquedas",
		uniqueQueries: "📝 Consultas Únicas",
		bookmarksCount: "🔖 Artículos Guardados",
		subscriptionsCount: "📬 Suscripciones Activas",
	},

	// Categories
	categories: {
		title: "📂 Categorías de arXiv",
		select: "Selecciona una categoría para explorar artículos recientes:",
	},

	// Time
	time: {
		hours: "horas",
		days: "días",
		weeks: "semanas",
	},

	// Language settings
	language: {
		title: "🌐 Configuración de Idioma",
		current: "Idioma actual: {language}",
		select: "Selecciona tu idioma preferido:",
		changed: "✅ Idioma cambiado a {language}",
		unavailable: "❌ Este idioma no está disponible todavía. Usando inglés.",
	},

	// Main menu
	menu: {
		welcome: "¡Bienvenido a AI Research Assistant!",
		description:
			"Te ayudo a descubrir los últimos artículos de investigación de arXiv.",
		whatICan: "Lo que puedo hacer:",
		searchDesc: "Buscar artículos sobre cualquier tema",
		bookmarkDesc: "Guardar artículos para después",
		historyDesc: "Ver tu historial de búsqueda",
		exportDesc: "Exportar citas (BibTeX)",
		useButtons: "¡Usa los botones de abajo o escribe comandos directamente!",
		currentLanguage: "Idioma actual:",
		searchPapers: "Buscar Artículos",
		myBookmarks: "Mis Marcadores",
		history: "Historial",
		help: "Ayuda",
	},

	// Help page
	helpPage: {
		title: "📖 Ayuda y Comandos",
		searchCommands: "Comandos de Búsqueda:",
		searchTopic: "/search [tema] - Buscar artículos",
		searchAuthor: "/author [nombre] - Buscar por autor",
		browseCategory: "/category - Explorar por categoría",
		findSimilar: "/similar [arxiv_id] - Encontrar artículos similares",
		historyBookmarks: "Historial y Marcadores:",
		viewBookmarks: "/bookmarks - Ver artículos guardados",
		savePaper: "/save [arxiv_id] - Guardar un artículo por ID o URL",
		viewHistory: "/history - Historial de búsqueda",
		viewStats: "/stats - Tus estadísticas",
		exportBibtex: "/export - Exportar marcadores como BibTeX",
		subscriptionsTitle: "Suscripciones:",
		subscribeTopic: "/subscribe [tema] - Recibir actualizaciones de un tema",
		manageSubscriptions: "/subscriptions - Gestionar suscripciones",
		unsubscribeTopic: "/unsubscribe [id] - Eliminar suscripción",
		loadMore: "/more - Cargar más resultados",
	},
};

export default es;
