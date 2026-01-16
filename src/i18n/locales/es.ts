/**
 * Spanish Translations (Español)
 */

import type { Translations } from "../types";

export const es: Translations = {
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
};

export default es;
