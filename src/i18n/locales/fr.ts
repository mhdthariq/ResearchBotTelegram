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
};

export default fr;
