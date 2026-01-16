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
		tip: "💡 Conseil : Utilisez des termes spécifiques pour de meilleurs résultats.",
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
			"📚 Pas encore de favoris.\n\nSauvegardez des articles depuis les résultats de recherche !",
		added: "✅ Article ajouté aux favoris !",
		removed: "🗑️ Favori supprimé",
		exists: "📌 Cet article est déjà dans vos favoris",
		exportTitle: "📚 Export BibTeX",
		exportEmpty:
			"📚 Aucun favori à exporter.\n\nSauvegardez d'abord quelques articles !",
	},

	// History
	history: {
		title: "📜 Historique de Recherche",
		empty:
			"📜 Pas encore d'historique.\n\nCommencez avec /search pour trouver des articles !",
		cleared: "📜 Historique de recherche effacé avec succès.",
		clearConfirm:
			"Êtes-vous sûr de vouloir effacer tout votre historique de recherche ?",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 Vos Abonnements",
		empty:
			"📭 Vous n'avez pas encore d'abonnements.\n\nUtilisez /subscribe <sujet> pour recevoir des mises à jour périodiques.",
		created:
			"✅ Abonnement à '{topic}' réussi !\n\nVous recevrez des mises à jour sur les nouveaux articles.",
		deleted: "🗑️ Abonnement supprimé avec succès",
		updated: "✅ Paramètres d'abonnement mis à jour",
		prompt:
			"📬 À quel sujet souhaitez-vous vous abonner ?\n\nExemple : /subscribe machine learning\nCatégorie optionnelle : /subscribe [cs.AI] réseaux neuronaux",
		interval: "Intervalle de notification",
		manage: "Gérer",
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
};

export default fr;
