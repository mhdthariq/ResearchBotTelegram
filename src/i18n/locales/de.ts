/**
 * German Translations (Deutsch)
 */

import type { Translations } from "../types";

export const de: Translations = {
	// General
	welcome:
		"👋 Willkommen bei Research Bot!\n\nIch helfe dir, die neuesten Forschungsarbeiten von arXiv zu entdecken und zu verfolgen.\n\nVerwende /help um alle verfügbaren Befehle zu sehen.",
	help: "📚 Verfügbare Befehle",
	error: "❌ Ein Fehler ist aufgetreten",
	success: "✅ Erfolg",
	loading: "⏳ Laden...",
	cancel: "Vorgang abgebrochen",

	// Commands
	commands: {
		start: "Bot starten und Willkommensnachricht sehen",
		help: "Alle verfügbaren Befehle anzeigen",
		search: "Nach Forschungsarbeiten suchen",
		more: "Mehr Ergebnisse laden",
		bookmarks: "Gespeicherte Arbeiten anzeigen",
		history: "Suchverlauf anzeigen",
		stats: "Persönliche Statistiken anzeigen",
		categories: "Nach arXiv-Kategorie durchsuchen",
		author: "Nach Autorname suchen",
		export: "Lesezeichen als BibTeX exportieren",
		subscribe: "Thema für Updates abonnieren",
		subscriptions: "Abonnements verwalten",
		unsubscribe: "Themenabonnement entfernen",
		similar: "Ähnliche Arbeiten finden",
	},

	// Search
	search: {
		prompt:
			"🔍 Nach welchem Thema möchtest du suchen?\n\nGib deine Suchanfrage ein oder verwende:\n/search [Thema]",
		noResults:
			"🔍 Keine Arbeiten gefunden.\n\nVersuche andere Suchbegriffe oder überprüfe die Schreibweise.",
		results: "📄 {count} Arbeiten für '{topic}' gefunden",
		loadMore: "Mehr laden",
		newSearch: "🔍 Neue Suche",
		tip: '💡 Tipp: Verwende spezifische Begriffe wie „transformer attention mechanism" statt nur „AI"',
		searching: "🔍 Suche nach Arbeiten...",
		noMorePapers: "📭 Keine weiteren Arbeiten zu diesem Thema gefunden.",
		useSearchFirst: "Verwende zuerst /search um nach Arbeiten zu suchen.",
		loadingMore: '📚 Lade weitere Arbeiten für "{topic}"...',
	},

	// Papers
	papers: {
		title: "Titel",
		authors: "Autoren",
		published: "Veröffentlicht",
		abstract: "Zusammenfassung",
		categories: "Kategorien",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} weitere",
		similarPapers: "📚 Ähnliche Arbeiten",
		noSimilarFound: "Keine ähnlichen Arbeiten gefunden.",
	},

	// Bookmarks
	bookmarks: {
		title: "🔖 Deine Lesezeichen",
		empty:
			"📚 Noch keine Lesezeichen.\n\nSpeichere Arbeiten aus den Suchergebnissen, um sie hier zu sehen!",
		added: "✅ Arbeit zu Lesezeichen hinzugefügt!",
		removed: "🗑️ Lesezeichen entfernt",
		exists: "📌 Diese Arbeit ist bereits als Lesezeichen gespeichert",
		exportTitle: "📚 BibTeX-Export",
		exportEmpty:
			"📚 Keine Lesezeichen zum Exportieren.\n\nSpeichere zuerst einige Arbeiten!",
		total: "{count} gesamt",
		searchButton: "🔍 Suchen",
		clearAllButton: "🗑️ Alle löschen",
		alreadyBookmarked:
			"📌 Diese Arbeit ist bereits in deinen Lesezeichen!\n\nVerwende /bookmarks um deine gespeicherten Arbeiten anzuzeigen.",
		couldNotLoad:
			"❌ Lesezeichen konnten nicht geladen werden. Bitte versuche es erneut.",
		viewBookmarks: "📚 Lesezeichen anzeigen",
		saveButton: "☆ Speichern",
		savedButton: "⭐ Gespeichert",
	},

	// History
	history: {
		title: "📜 Suchverlauf",
		empty:
			"📜 Noch kein Suchverlauf.\n\nBeginne mit /search um Arbeiten zu finden!",
		cleared: "📜 Suchverlauf gelöscht.",
		clearConfirm:
			"Bist du sicher, dass du deinen gesamten Suchverlauf löschen möchtest?",
		recentSearches: "🕐 Letzte Suchen",
		tapToSearch: "Tippe auf eine Suche, um sie erneut auszuführen:",
		fullHistory: "📜 Vollständiger Verlauf",
		clearHistory: "🗑️ Verlauf löschen",
		newSearch: "🔍 Neue Suche",
		noHistory: "📜 Noch kein Suchverlauf.",
		startSearching: "Beginne mit /search!",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 Deine Abonnements",
		empty:
			"📭 Du hast noch keine Abonnements.\n\nVerwende /subscribe <Thema> um regelmäßige Updates zu Forschungsthemen zu erhalten.",
		created:
			"✅ Erfolgreich '{topic}' abonniert!\n\nDu erhältst Updates zu neuen Arbeiten.",
		deleted: "🗑️ Abonnement erfolgreich entfernt",
		updated: "✅ Abonnement-Einstellungen aktualisiert",
		prompt:
			"📬 Welches Thema möchtest du abonnieren?\n\nBeispiel: /subscribe machine learning\nOptionale Kategorie: /subscribe [cs.AI] neural networks",
		interval: "Benachrichtigungsintervall",
		manage: "Verwalten",
		addSubscription: "➕ Abonnement hinzufügen",
		noSubscriptions: "📭 Du hast keine Abonnements.",
		useSubscribe: "Verwende /subscribe <Thema> um Updates zu erhalten.",
		settings: "⚙️ Abonnement-Einstellungen",
		topic: "📌 Thema",
		category: "📂 Kategorie",
		selectToRemove: "Wähle ein Abonnement zum Entfernen:",
	},

	// Errors
	errors: {
		apiError:
			"❌ Fehler beim Abrufen von Arbeiten von arXiv.\n\nBitte versuche es später erneut.",
		rateLimited:
			"⏳ Zu viele Anfragen. Bitte warte {seconds} Sekunden bevor du es erneut versuchst.",
		invalidCommand:
			"❓ Unbekannter Befehl.\n\nVerwende /help um alle verfügbaren Befehle zu sehen.",
		invalidInput:
			"❌ Ungültige Eingabe.\n\nBitte überprüfe deine Eingabe und versuche es erneut.",
		notFound: "❌ Nicht gefunden.",
		unauthorized: "🔒 Du hast keine Berechtigung, diese Aktion durchzuführen.",
		tryAgain: "Bitte versuche es später erneut.",
		couldNotProcess:
			"❌ Anfrage konnte nicht verarbeitet werden. Bitte versuche es erneut.",
		couldNotFetch: "❌ Paper-Details konnten nicht abgerufen werden.",
		couldNotSave:
			"❌ Paper konnte nicht gespeichert werden. Bitte versuche es erneut.",
		couldNotExport:
			"❌ Lesezeichen konnten nicht exportiert werden. Bitte versuche es erneut.",
		couldNotSend:
			"❌ Export-Datei konnte nicht gesendet werden. Bitte versuche es später erneut.",
		invalidExportFormat: "❌ Ungültiges Export-Format.",
	},

	// Buttons
	buttons: {
		previous: "⬅️ Zurück",
		next: "➡️ Weiter",
		bookmark: "🔖 Speichern",
		unbookmark: "🗑️ Lesezeichen entfernen",
		details: "📋 Details",
		similar: "🔗 Ähnliche Arbeiten",
		bibtex: "📝 BibTeX",
		back: "⬅️ Zurück",
		confirm: "✅ Bestätigen",
		settings: "⚙️ Einstellungen",
		search: "🔍 Suchen",
		searchPapers: "🔍 Arbeiten suchen",
		loadMore: "📚 Mehr laden",
		abstract: "📖 Zusammenfassung",
		pdf: "📄 PDF",
	},

	// Stats
	stats: {
		title: "📊 Deine Statistiken",
		searches: "🔍 Gesamte Suchen",
		uniqueQueries: "📝 Einzigartige Anfragen",
		bookmarksCount: "🔖 Gespeicherte Arbeiten",
		subscriptionsCount: "📬 Aktive Abonnements",
	},

	// Categories
	categories: {
		title: "📂 arXiv-Kategorien",
		select: "Wähle eine Kategorie, um aktuelle Arbeiten zu durchsuchen:",
		browseByCategory: "📂 Nach Kategorie durchsuchen",
	},

	// Time
	time: {
		hours: "Stunden",
		days: "Tage",
		weeks: "Wochen",
	},

	// Language settings
	language: {
		title: "🌐 Spracheinstellungen",
		current: "Aktuelle Sprache: {language}",
		select: "Wähle deine bevorzugte Sprache:",
		changed: "✅ Sprache zu {language} geändert",
		unavailable:
			"❌ Diese Sprache ist noch nicht verfügbar. Englisch wird verwendet.",
	},

	// Main menu
	menu: {
		welcome: "Willkommen bei AI Research Assistant!",
		description:
			"Ich helfe dir, die neuesten Forschungsarbeiten von arXiv zu entdecken.",
		whatICan: "Was ich kann:",
		searchDesc: "Nach Arbeiten zu jedem Thema suchen",
		bookmarkDesc: "Arbeiten für später speichern",
		historyDesc: "Deinen Suchverlauf anzeigen",
		exportDesc: "Zitate exportieren (BibTeX)",
		useButtons: "Verwende die Schaltflächen unten oder gib Befehle direkt ein!",
		currentLanguage: "Aktuelle Sprache:",
		searchPapers: "Arbeiten suchen",
		myBookmarks: "Meine Lesezeichen",
		history: "Verlauf",
		help: "Hilfe",
	},

	// Help page
	helpPage: {
		title: "📖 Hilfe & Befehle",
		searchCommands: "Suchbefehle:",
		searchTopic: "/search [Thema] - Nach Arbeiten suchen",
		searchAuthor: "/author [Name] - Nach Autor suchen",
		browseCategory: "/category - Nach Kategorie durchsuchen",
		findSimilar: "/similar [arxiv_id] - Ähnliche Arbeiten finden",
		historyBookmarks: "Verlauf & Lesezeichen:",
		viewBookmarks: "/bookmarks - Gespeicherte Arbeiten anzeigen",
		savePaper: "/save [arxiv_id] - Arbeit per ID oder URL speichern",
		viewHistory: "/history - Suchverlauf",
		viewStats: "/stats - Deine Statistiken",
		exportBibtex: "/export - Lesezeichen als BibTeX exportieren",
		subscriptionsTitle: "Abonnements:",
		subscribeTopic: "/subscribe [Thema] - Updates zu einem Thema erhalten",
		manageSubscriptions: "/subscriptions - Abonnements verwalten",
		unsubscribeTopic: "/unsubscribe [id] - Abonnement entfernen",
		loadMore: "/more - Mehr Ergebnisse laden",
	},

	// Export
	export: {
		title: "📥 Lesezeichen exportieren",
		cancelled: "Export abgebrochen.",
		selectFormat: "Export-Format auswählen:",
		generating: "Export wird erstellt...",
		downloadReady: "Dein Export ist bereit!",
		fileCaption: "📚 Deine Lesezeichen ({count} Arbeiten)",
	},

	// Save paper
	save: {
		title: "📥 Paper zu Lesezeichen speichern",
		usage: "Um ein Paper zu speichern, gib die arXiv-ID oder URL an:",
		example: "/save 2301.00001\n/save https://arxiv.org/abs/2301.00001",
		tip: "Du kannst Paper auch direkt aus den Suchergebnissen mit der ☆ Speichern-Schaltfläche speichern!",
		fetching: "🔍 Paper wird von arXiv abgerufen...",
		success: "⭐ Paper zu Lesezeichen hinzugefügt!",
	},

	// Author search
	author: {
		usage: "Verwendung: /author <Name>",
		example: "Beispiel: /author Yoshua Bengio",
		prompt: "🔍 Gib den Autorennamen ein:",
		searching: '🔍 Suche nach Arbeiten von "{name}"...',
		results: "Arbeiten von {name}",
		noResults: 'Keine Arbeiten für Autor "{name}" gefunden.',
	},

	// Similar papers
	similar: {
		usage: "Verwendung: /similar <arxiv_id>",
		example: "Beispiel: /similar 2301.00001",
		hint: "Die arXiv-ID findest du in Paper-Links (z.B. arxiv.org/abs/2301.00001)",
		searching: "🔍 Suche nach ähnlichen Arbeiten...",
		notFound: '❌ Konnte kein Paper mit ID "{arxivId}" finden.',
		noResults: "Keine ähnlichen Arbeiten gefunden.",
		title: "📚 Ähnliche Arbeiten",
	},

	// Callback messages
	callbacks: {
		tooManyRequests: "Zu viele Anfragen. Bitte warte einen Moment.",
		pleaseStartFirst: "Bitte starte den Bot zuerst mit /start",
		userNotFound: "Benutzer nicht gefunden. Bitte versuche /start zuerst.",
		subscriptionNotFound: "Abonnement nicht gefunden.",
		couldNotFetchPaper: "Paper-Details konnten nicht abgerufen werden.",
		clearBookmarksHint:
			"Um alle Lesezeichen zu löschen, verwende einen dedizierten Befehl.",
		intervalUpdated: "✅ Intervall auf alle {hours} Stunden aktualisiert.",
	},

	// Category browsing
	categoryBrowse: {
		loading: "🔍 Lade aktuelle Arbeiten in {category}...",
		noResults: "Keine Arbeiten in Kategorie {category} gefunden.",
	},

	// Inline query
	inlineQuery: {
		typeToSearch: "Gib mindestens 3 Zeichen ein, um zu suchen",
		searchDescription: "Suche nach Forschungsarbeiten auf arXiv",
		helpMessage:
			"🔍 Nutze diesen Bot, um Forschungsarbeiten auf arXiv zu suchen!\n\nGib einfach @BotName gefolgt von deiner Suchanfrage ein.",
		noResults: 'Keine Arbeiten für "{query}" gefunden',
		tryDifferent: "Versuche einen anderen Suchbegriff",
		searchFailed: "Suche fehlgeschlagen",
		tryAgain: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
	},

	// General UI
	ui: {
		errorOccurred:
			"❌ Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
		paperCount: "Du hast {count} gespeicherte(s) Paper.",
		yourSubscriptions: "📬 Deine Abonnements",
		tapToManage: "Tippe auf ein Thema, um es zu verwalten oder zu entfernen.",
		settingsHeader: "⚙️ Abonnement-Einstellungen",
		intervalLabel: "⏱️ Intervall",
		categoryLabel: "📂 Kategorie",
		selectFrequency: '⏱️ Wähle die Aktualisierungshäufigkeit für "{topic}":',
		exportPreparing: "📥 {format}-Export wird vorbereitet...",
		exportSuccess: "✅ {format}-Export gesendet! Siehe die Datei oben.",
		bibtexFormat: "BibTeX",
		csvFormat: "CSV",
		forLatex: "Für LaTeX und Literaturverwaltung",
		forSpreadsheets: "Für Tabellenkalkulation (Excel, Google Sheets)",
		cancelButton: "❌ Abbrechen",
		viewBookmarksButton: "📚 Lesezeichen anzeigen",
	},

	// Validation
	validation: {
		invalidArxivId: "❌ Ungültige arXiv-ID oder URL.",
		validFormats: "Gültige Formate:",
		alreadyBookmarked: "📌 Diese Arbeit ist bereits in deinen Lesezeichen!",
		useBookmarksToView:
			"Verwende /bookmarks um deine gespeicherten Arbeiten anzuzeigen.",
	},
};

export default de;
