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
		tip: "💡 Tipp: Verwende spezifische Begriffe für bessere Ergebnisse.",
		searching: "🔍 Suche nach Arbeiten...",
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
	},

	// History
	history: {
		title: "📜 Suchverlauf",
		empty:
			"📜 Noch kein Suchverlauf.\n\nBeginne mit /search um Arbeiten zu finden!",
		cleared: "📜 Suchverlauf erfolgreich gelöscht.",
		clearConfirm:
			"Bist du sicher, dass du deinen gesamten Suchverlauf löschen möchtest?",
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
		unauthorized:
			"🔒 Du hast keine Berechtigung, diese Aktion durchzuführen.",
		tryAgain: "Bitte versuche es später erneut.",
	},

	// Buttons
	buttons: {
		previous: "⬅️ Zurück",
		next: "➡️ Weiter",
		bookmark: "🔖 Speichern",
		unbookmark: "🗑️ Entfernen",
		details: "📋 Details",
		similar: "🔗 Ähnliche Arbeiten",
		bibtex: "📝 BibTeX",
		back: "⬅️ Zurück",
		confirm: "✅ Bestätigen",
		settings: "⚙️ Einstellungen",
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
};

export default de;
