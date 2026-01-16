/**
 * French Translations (Français)
 */

import type { Translations } from "../types";

export const fr: Translations = {
	// General
	welcome:
		"👋 Bienvenue sur Research Bot !\n\nJe vous aide à découvrir et suivre les derniers articles de recherche d'arXiv.\n\nUtilisez /help pour voir les commandes disponibles.",
	help: "📚 Commandes Disponibles",
	error: "❌ Une erreur s'est produite",
	success: "✅ Succès",
	loading: "⏳ Chargement...",
	cancel: "Opération annulée",

	// Commands
	commands: {
		start: "Démarrer le bot et voir le message de bienvenue",
		help: "Afficher toutes les commandes disponibles",
		search: "Rechercher des articles par sujet",
		more: "Charger plus de résultats de la recherche actuelle",
		bookmarks: "Voir vos articles sauvegardés",
		history: "Voir votre historique de recherche récent",
		stats: "Voir vos statistiques personnelles",
		categories: "Parcourir les articles par catégorie arXiv",
		author: "Rechercher des articles par nom d'auteur",
		export: "Exporter vos favoris en BibTeX",
		subscribe: "S'abonner à un sujet de recherche pour des mises à jour",
		subscriptions: "Voir et gérer vos abonnements",
		unsubscribe: "Supprimer un abonnement à un sujet",
		similar: "Trouver des articles similaires",
	},

	// Search
	search: {
		prompt:
			"🔍 Quel sujet souhaitez-vous rechercher ?\n\nTapez votre requête ou utilisez :\n/search [sujet]",
		noResults:
			"🔍 Aucun article trouvé.\n\nEssayez d'autres mots-clés ou vérifiez l'orthographe.",
		results: "📄 {count} articles trouvés pour '{topic}'",
		loadMore: "Charger Plus",
		newSearch: "🔍 Nouvelle Recherche",
		tip: "💡 Conseil : Utilisez des termes spécifiques comme « transformer attention mechanism » au lieu de simplement « AI »",
		searching: "🔍 Recherche d'articles en cours...",
		noMorePapers: "📭 Plus d'articles trouvés pour ce sujet.",
		useSearchFirst: "Utilisez d'abord /search pour rechercher des articles.",
		loadingMore: '📚 Chargement d\'autres articles pour "{topic}"...',
	},

	// Papers
	papers: {
		title: "Titre",
		authors: "Auteurs",
		published: "Publié",
		abstract: "Résumé",
		categories: "Catégories",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} de plus",
		similarPapers: "📚 Articles Similaires",
		noSimilarFound: "Aucun article similaire trouvé.",
	},

	// Bookmarks
	bookmarks: {
		title: "🔖 Vos Favoris",
		empty:
			"📚 Pas encore de favoris.\n\nSauvegardez des articles depuis les résultats de recherche pour les voir ici !",
		added: "✅ Article ajouté aux favoris !",
		removed: "🗑️ Favori supprimé",
		exists: "📌 Cet article est déjà dans vos favoris",
		exportTitle: "📚 Export BibTeX",
		exportEmpty:
			"📚 Aucun favori à exporter.\n\nSauvegardez d'abord quelques articles !",
		total: "{count} au total",
		searchButton: "🔍 Rechercher",
		clearAllButton: "🗑️ Tout Supprimer",
		alreadyBookmarked:
			"📌 Cet article est déjà dans vos favoris !\n\nUtilisez /bookmarks pour voir vos articles sauvegardés.",
		couldNotLoad: "❌ Impossible de charger vos favoris. Veuillez réessayer.",
		viewBookmarks: "📚 Voir les Favoris",
		saveButton: "☆ Sauvegarder",
		savedButton: "⭐ Sauvegardé",
	},

	// History
	history: {
		title: "📜 Historique de Recherche",
		empty:
			"📜 Pas encore d'historique.\n\nCommencez avec /search pour trouver des articles !",
		cleared: "📜 Historique de recherche effacé.",
		clearConfirm:
			"Êtes-vous sûr de vouloir effacer tout votre historique de recherche ?",
		recentSearches: "🕐 Recherches Récentes",
		tapToSearch: "Appuyez sur une recherche pour la relancer :",
		fullHistory: "📜 Historique Complet",
		clearHistory: "🗑️ Effacer l'Historique",
		newSearch: "🔍 Nouvelle Recherche",
		noHistory: "📜 Pas encore d'historique de recherche.",
		startSearching: "Commencez avec /search !",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 Vos Abonnements",
		empty:
			"📭 Vous n'avez pas encore d'abonnements.\n\nUtilisez /subscribe <sujet> pour recevoir des mises à jour périodiques sur les sujets de recherche qui vous intéressent.",
		created:
			"✅ Abonnement à '{topic}' réussi !\n\nVous recevrez des mises à jour sur les nouveaux articles.",
		deleted: "🗑️ Abonnement supprimé avec succès",
		updated: "✅ Paramètres d'abonnement mis à jour",
		prompt:
			"📬 À quel sujet souhaitez-vous vous abonner ?\n\nExemple : /subscribe machine learning\nCatégorie optionnelle : /subscribe [cs.AI] réseaux neuronaux",
		interval: "Intervalle de notification",
		manage: "Gérer",
		addSubscription: "➕ Ajouter un Abonnement",
		noSubscriptions: "📭 Vous n'avez aucun abonnement.",
		useSubscribe: "Utilisez /subscribe <sujet> pour recevoir des mises à jour.",
		settings: "⚙️ Paramètres d'Abonnement",
		topic: "📌 Sujet",
		category: "📂 Catégorie",
		selectToRemove: "Sélectionnez un abonnement à supprimer :",
	},

	// Errors
	errors: {
		apiError:
			"❌ Erreur lors de la récupération des articles d'arXiv.\n\nVeuillez réessayer plus tard.",
		rateLimited:
			"⏳ Trop de requêtes. Veuillez attendre {seconds} secondes avant de réessayer.",
		invalidCommand:
			"❓ Commande inconnue.\n\nUtilisez /help pour voir toutes les commandes disponibles.",
		invalidInput:
			"❌ Entrée invalide.\n\nVeuillez vérifier votre saisie et réessayer.",
		notFound: "❌ Non trouvé.",
		unauthorized: "🔒 Vous n'avez pas la permission d'effectuer cette action.",
		tryAgain: "Veuillez réessayer plus tard.",
		couldNotProcess: "❌ Impossible de traiter la demande. Veuillez réessayer.",
		couldNotFetch: "❌ Impossible de récupérer les détails de l'article.",
		couldNotSave: "❌ Impossible de sauvegarder l'article. Veuillez réessayer.",
		couldNotExport: "❌ Impossible d'exporter les favoris. Veuillez réessayer.",
		couldNotSend:
			"❌ Impossible d'envoyer le fichier d'export. Veuillez réessayer plus tard.",
		invalidExportFormat: "❌ Format d'export invalide.",
	},

	// Buttons
	buttons: {
		previous: "⬅️ Précédent",
		next: "➡️ Suivant",
		bookmark: "🔖 Favori",
		unbookmark: "🗑️ Supprimer Favori",
		details: "📋 Détails",
		similar: "🔗 Articles Similaires",
		bibtex: "📝 BibTeX",
		back: "⬅️ Retour",
		confirm: "✅ Confirmer",
		settings: "⚙️ Paramètres",
		search: "🔍 Rechercher",
		searchPapers: "🔍 Rechercher des Articles",
		loadMore: "📚 Charger Plus",
		abstract: "📖 Résumé",
		pdf: "📄 PDF",
	},

	// Stats
	stats: {
		title: "📊 Vos Statistiques",
		searches: "🔍 Recherches Totales",
		uniqueQueries: "📝 Requêtes Uniques",
		bookmarksCount: "🔖 Articles Sauvegardés",
		subscriptionsCount: "📬 Abonnements Actifs",
	},

	// Categories
	categories: {
		title: "📂 Catégories arXiv",
		select: "Sélectionnez une catégorie pour parcourir les articles récents :",
		browseByCategory: "📂 Parcourir par Catégorie",
	},

	// Time
	time: {
		hours: "heures",
		days: "jours",
		weeks: "semaines",
	},

	// Language settings
	language: {
		title: "🌐 Paramètres de Langue",
		current: "Langue actuelle : {language}",
		select: "Sélectionnez votre langue préférée :",
		changed: "✅ Langue changée en {language}",
		unavailable:
			"❌ Cette langue n'est pas encore disponible. Utilisation de l'anglais.",
	},

	// Main menu
	menu: {
		welcome: "Bienvenue sur AI Research Assistant !",
		description:
			"Je vous aide à découvrir les derniers articles de recherche d'arXiv.",
		whatICan: "Ce que je peux faire :",
		searchDesc: "Rechercher des articles sur n'importe quel sujet",
		bookmarkDesc: "Sauvegarder des articles pour plus tard",
		historyDesc: "Voir votre historique de recherche",
		exportDesc: "Exporter des citations (BibTeX)",
		useButtons:
			"Utilisez les boutons ci-dessous ou tapez des commandes directement !",
		currentLanguage: "Langue actuelle :",
		searchPapers: "Rechercher des Articles",
		myBookmarks: "Mes Favoris",
		history: "Historique",
		help: "Aide",
	},

	// Help page
	helpPage: {
		title: "📖 Aide et Commandes",
		searchCommands: "Commandes de Recherche :",
		searchTopic: "/search [sujet] - Rechercher des articles",
		searchAuthor: "/author [nom] - Rechercher par auteur",
		browseCategory: "/category - Parcourir par catégorie",
		findSimilar: "/similar [arxiv_id] - Trouver des articles similaires",
		historyBookmarks: "Historique et Favoris :",
		viewBookmarks: "/bookmarks - Voir les articles sauvegardés",
		savePaper: "/save [arxiv_id] - Sauvegarder un article par ID ou URL",
		viewHistory: "/history - Historique de recherche",
		viewStats: "/stats - Vos statistiques",
		exportBibtex: "/export - Exporter les favoris en BibTeX",
		subscriptionsTitle: "Abonnements :",
		subscribeTopic:
			"/subscribe [sujet] - Recevoir des mises à jour sur un sujet",
		manageSubscriptions: "/subscriptions - Gérer les abonnements",
		unsubscribeTopic: "/unsubscribe [id] - Supprimer un abonnement",
		loadMore: "/more - Charger plus de résultats",
	},

	// Export
	export: {
		title: "📥 Exporter les Favoris",
		cancelled: "Export annulé.",
		selectFormat: "Sélectionnez le format d'export :",
		generating: "Génération de l'export...",
		downloadReady: "Votre export est prêt !",
		fileCaption: "📚 Vos favoris ({count} articles)",
	},

	// Save paper
	save: {
		title: "📥 Sauvegarder un Article",
		usage: "Pour sauvegarder un article, fournissez l'ID arXiv ou l'URL :",
		example: "/save 2301.00001\n/save https://arxiv.org/abs/2301.00001",
		tip: "Vous pouvez aussi sauvegarder des articles directement depuis les résultats de recherche avec le bouton ☆ Sauvegarder !",
		fetching: "🔍 Récupération de l'article depuis arXiv...",
		success: "⭐ Article sauvegardé dans les favoris !",
	},

	// Author search
	author: {
		usage: "Utilisation : /author <nom>",
		example: "Exemple : /author Yoshua Bengio",
		prompt: "🔍 Entrez le nom de l'auteur à rechercher :",
		searching: '🔍 Recherche d\'articles de "{name}"...',
		results: "Articles de {name}",
		noResults: 'Aucun article trouvé pour l\'auteur "{name}".',
	},

	// Similar papers
	similar: {
		usage: "Utilisation : /similar <arxiv_id>",
		example: "Exemple : /similar 2301.00001",
		hint: "Vous pouvez trouver l'ID arXiv dans les liens d'articles (ex. arxiv.org/abs/2301.00001)",
		searching: "🔍 Recherche d'articles similaires...",
		notFound: "❌ Impossible de trouver l'article avec l'ID \"{arxivId}\".",
		noResults: "Aucun article similaire trouvé.",
		title: "📚 Articles Similaires",
	},

	// Callback messages
	callbacks: {
		tooManyRequests: "Trop de requêtes. Veuillez patienter.",
		pleaseStartFirst: "Veuillez d'abord démarrer le bot avec /start",
		userNotFound: "Utilisateur non trouvé. Veuillez essayer /start d'abord.",
		subscriptionNotFound: "Abonnement non trouvé.",
		couldNotFetchPaper: "Impossible de récupérer les détails de l'article.",
		clearBookmarksHint:
			"Pour supprimer tous les favoris, utilisez une commande dédiée.",
		intervalUpdated: "✅ Intervalle mis à jour à toutes les {hours} heures.",
	},

	// Category browsing
	categoryBrowse: {
		loading: "🔍 Chargement des articles récents dans {category}...",
		noResults: "Aucun article trouvé dans la catégorie {category}.",
	},

	// Inline query
	inlineQuery: {
		typeToSearch: "Tapez au moins 3 caractères pour rechercher",
		searchDescription: "Rechercher des articles de recherche sur arXiv",
		helpMessage:
			"🔍 Utilisez ce bot pour rechercher des articles sur arXiv !\n\nTapez simplement @NomDuBot suivi de votre requête.",
		noResults: 'Aucun article trouvé pour "{query}"',
		tryDifferent: "Essayez un terme de recherche différent",
		searchFailed: "Échec de la recherche",
		tryAgain: "Une erreur s'est produite. Veuillez réessayer.",
	},

	// General UI
	ui: {
		errorOccurred:
			"❌ Une erreur s'est produite. Veuillez réessayer plus tard.",
		paperCount: "Vous avez {count} article(s) sauvegardé(s).",
		yourSubscriptions: "📬 Vos Abonnements",
		tapToManage: "Appuyez sur un sujet pour le gérer ou le supprimer.",
		settingsHeader: "⚙️ Paramètres d'Abonnement",
		intervalLabel: "⏱️ Intervalle",
		categoryLabel: "📂 Catégorie",
		selectFrequency:
			'⏱️ Sélectionnez la fréquence de mise à jour pour "{topic}" :',
		exportPreparing: "📥 Préparation de l'export {format}...",
		exportSuccess: "✅ Export {format} envoyé ! Vérifiez le fichier ci-dessus.",
		bibtexFormat: "BibTeX",
		csvFormat: "CSV",
		forLatex: "Pour LaTeX et gestionnaires de citations",
		forSpreadsheets: "Pour tableurs (Excel, Google Sheets)",
		cancelButton: "❌ Annuler",
		viewBookmarksButton: "📚 Voir les Favoris",
	},

	// Validation
	validation: {
		invalidArxivId: "❌ ID arXiv ou URL invalide.",
		validFormats: "Formats valides :",
		alreadyBookmarked: "📌 Cet article est déjà dans vos favoris !",
		useBookmarksToView:
			"Utilisez /bookmarks pour voir vos articles sauvegardés.",
	},
};

export default fr;
