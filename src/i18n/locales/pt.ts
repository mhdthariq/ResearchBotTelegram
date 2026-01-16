/**
 * Portuguese Translations (Português)
 *
 * Brazilian Portuguese translation file.
 */

import type { Translations } from "../types";

export const pt: Translations = {
	// General
	welcome:
		"👋 Bem-vindo ao Research Bot!\n\nEu ajudo você a descobrir e acompanhar os últimos artigos de pesquisa do arXiv.\n\nUse /help para ver os comandos disponíveis.",
	help: "📚 Comandos Disponíveis",
	error: "❌ Ocorreu um erro",
	success: "✅ Sucesso",
	loading: "⏳ Carregando...",
	cancel: "Operação cancelada",

	// Commands
	commands: {
		start: "Iniciar o bot e ver mensagem de boas-vindas",
		help: "Mostrar todos os comandos disponíveis",
		search: "Pesquisar artigos por tema",
		more: "Carregar mais resultados da pesquisa atual",
		bookmarks: "Ver seus artigos salvos",
		history: "Ver seu histórico de pesquisa recente",
		stats: "Ver suas estatísticas pessoais",
		categories: "Navegar artigos por categoria do arXiv",
		author: "Pesquisar artigos por nome do autor",
		export: "Exportar seus favoritos como BibTeX",
		subscribe: "Inscrever-se em um tema de pesquisa para atualizações",
		subscriptions: "Ver e gerenciar suas inscrições",
		unsubscribe: "Remover uma inscrição de tema",
		similar: "Encontrar artigos semelhantes a um determinado artigo",
	},

	// Search
	search: {
		prompt:
			"🔍 Qual tema você gostaria de pesquisar?\n\nDigite sua consulta ou use:\n/search [tema]",
		noResults:
			"🔍 Nenhum artigo encontrado.\n\nTente palavras-chave diferentes ou verifique a ortografia.",
		results: "📄 Encontrados {count} artigos para '{topic}'",
		loadMore: "Carregar Mais",
		newSearch: "🔍 Nova Pesquisa",
		tip: '💡 Dica: Use termos específicos como "transformer attention mechanism" em vez de apenas "AI"',
		searching: "🔍 Pesquisando artigos...",
		noMorePapers: "📭 Não há mais artigos para este tema.",
		useSearchFirst: "Use /search primeiro para pesquisar artigos.",
		loadingMore: '📚 Carregando mais artigos para "{topic}"...',
	},

	// Papers
	papers: {
		title: "Título",
		authors: "Autores",
		published: "Publicado",
		abstract: "Resumo",
		categories: "Categorias",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} mais",
		similarPapers: "📚 Artigos Semelhantes",
		noSimilarFound: "Nenhum artigo semelhante encontrado.",
	},

	// Bookmarks
	bookmarks: {
		title: "🔖 Seus Favoritos",
		empty:
			"📚 Nenhum favorito ainda.\n\nSalve artigos dos resultados de pesquisa para vê-los aqui!",
		added: "✅ Artigo adicionado aos favoritos!",
		removed: "🗑️ Favorito removido",
		exists: "📌 Este artigo já está nos favoritos",
		exportTitle: "📚 Exportação BibTeX",
		exportEmpty:
			"📚 Nenhum favorito para exportar.\n\nSalve alguns artigos primeiro!",
		total: "{count} no total",
		searchButton: "🔍 Pesquisar",
		clearAllButton: "🗑️ Limpar Tudo",
		alreadyBookmarked:
			"📌 Este artigo já está nos seus favoritos!\n\nUse /bookmarks para ver seus artigos salvos.",
		couldNotLoad:
			"❌ Não foi possível carregar seus favoritos. Por favor, tente novamente.",
		viewBookmarks: "📚 Ver Favoritos",
		saveButton: "☆ Salvar",
		savedButton: "⭐ Salvo",
	},

	// History
	history: {
		title: "📜 Histórico de Pesquisa",
		empty:
			"📜 Nenhum histórico ainda.\n\nComece com /search para encontrar artigos!",
		cleared: "📜 Histórico de pesquisa limpo.",
		clearConfirm:
			"Tem certeza de que deseja limpar todo o seu histórico de pesquisa?",
		recentSearches: "🕐 Pesquisas Recentes",
		tapToSearch: "Toque em uma pesquisa para executá-la novamente:",
		fullHistory: "📜 Histórico Completo",
		clearHistory: "🗑️ Limpar Histórico",
		newSearch: "🔍 Nova Pesquisa",
		noHistory: "📜 Nenhum histórico de pesquisa ainda.",
		startSearching: "Comece com /search!",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 Suas Inscrições",
		empty:
			"📭 Você ainda não tem nenhuma inscrição.\n\nUse /subscribe <tema> para receber atualizações periódicas sobre temas de pesquisa do seu interesse.",
		created:
			"✅ Inscrito com sucesso em '{topic}'!\n\nVocê receberá atualizações sobre novos artigos.",
		deleted: "🗑️ Inscrição removida com sucesso",
		updated: "✅ Configurações de inscrição atualizadas",
		prompt:
			"📬 Em qual tema você gostaria de se inscrever?\n\nExemplo: /subscribe aprendizado de máquina\nCategoria opcional: /subscribe [cs.AI] redes neurais",
		interval: "Intervalo de notificação",
		manage: "Gerenciar",
		addSubscription: "➕ Adicionar Inscrição",
		noSubscriptions: "📭 Você não tem nenhuma inscrição.",
		useSubscribe: "Use /subscribe <tema> para receber atualizações.",
		settings: "⚙️ Configurações de Inscrição",
		topic: "📌 Tema",
		category: "📂 Categoria",
		selectToRemove: "Selecione uma inscrição para remover:",
	},

	// Errors
	errors: {
		apiError:
			"❌ Erro ao buscar artigos do arXiv.\n\nPor favor, tente novamente mais tarde.",
		rateLimited:
			"⏳ Muitas solicitações. Por favor, aguarde {seconds} segundos antes de tentar novamente.",
		invalidCommand:
			"❓ Comando desconhecido.\n\nUse /help para ver todos os comandos disponíveis.",
		invalidInput:
			"❌ Entrada inválida.\n\nPor favor, verifique sua entrada e tente novamente.",
		notFound: "❌ Não encontrado.",
		unauthorized: "🔒 Você não tem permissão para realizar esta ação.",
		tryAgain: "Por favor, tente novamente mais tarde.",
		couldNotProcess:
			"❌ Não foi possível processar a solicitação. Tente novamente.",
		couldNotFetch: "❌ Não foi possível obter detalhes do artigo.",
		couldNotSave: "❌ Não foi possível salvar o artigo. Tente novamente.",
		couldNotExport:
			"❌ Não foi possível exportar os favoritos. Tente novamente.",
		couldNotSend:
			"❌ Não foi possível enviar o arquivo de exportação. Tente mais tarde.",
		invalidExportFormat: "❌ Formato de exportação inválido.",
	},

	// Buttons
	buttons: {
		previous: "⬅️ Anterior",
		next: "➡️ Próximo",
		bookmark: "🔖 Favoritar",
		unbookmark: "🗑️ Remover Favorito",
		details: "📋 Detalhes",
		similar: "🔗 Artigos Semelhantes",
		bibtex: "📝 BibTeX",
		back: "⬅️ Voltar",
		confirm: "✅ Confirmar",
		settings: "⚙️ Configurações",
		search: "🔍 Pesquisar",
		searchPapers: "🔍 Pesquisar Artigos",
		loadMore: "📚 Carregar Mais",
		abstract: "📖 Resumo",
		pdf: "📄 PDF",
	},

	// Stats
	stats: {
		title: "📊 Suas Estatísticas",
		searches: "🔍 Total de Pesquisas",
		uniqueQueries: "📝 Consultas Únicas",
		bookmarksCount: "🔖 Artigos Salvos",
		subscriptionsCount: "📬 Inscrições Ativas",
	},

	// Categories
	categories: {
		title: "📂 Categorias do arXiv",
		select: "Selecione uma categoria para navegar artigos recentes:",
		browseByCategory: "📂 Navegar por Categoria",
	},

	// Time
	time: {
		hours: "horas",
		days: "dias",
		weeks: "semanas",
	},

	// Language settings
	language: {
		title: "🌐 Configurações de Idioma",
		current: "Idioma atual: {language}",
		select: "Selecione seu idioma preferido:",
		changed: "✅ Idioma alterado para {language}",
		unavailable: "❌ Este idioma ainda não está disponível. Usando inglês.",
	},

	// Main menu
	menu: {
		welcome: "Bem-vindo ao AI Research Assistant!",
		description:
			"Eu ajudo você a descobrir os últimos artigos de pesquisa do arXiv.",
		whatICan: "O que eu posso fazer:",
		searchDesc: "Pesquisar artigos sobre qualquer tema",
		bookmarkDesc: "Salvar artigos para depois",
		historyDesc: "Ver seu histórico de pesquisa",
		exportDesc: "Exportar citações (BibTeX)",
		useButtons: "Use os botões abaixo ou digite comandos diretamente!",
		currentLanguage: "Idioma atual:",
		searchPapers: "Pesquisar Artigos",
		myBookmarks: "Meus Favoritos",
		history: "Histórico",
		help: "Ajuda",
	},

	// Help page
	helpPage: {
		title: "📖 Ajuda e Comandos",
		searchCommands: "Comandos de Pesquisa:",
		searchTopic: "/search [tema] - Pesquisar artigos",
		searchAuthor: "/author [nome] - Pesquisar por autor",
		browseCategory: "/category - Navegar por categoria",
		findSimilar: "/similar [arxiv_id] - Encontrar artigos semelhantes",
		historyBookmarks: "Histórico e Favoritos:",
		viewBookmarks: "/bookmarks - Ver artigos salvos",
		savePaper: "/save [arxiv_id] - Salvar um artigo por ID ou URL",
		viewHistory: "/history - Histórico de pesquisa",
		viewStats: "/stats - Suas estatísticas",
		exportBibtex: "/export - Exportar favoritos como BibTeX",
		subscriptionsTitle: "Inscrições:",
		subscribeTopic: "/subscribe [tema] - Receber atualizações sobre um tema",
		manageSubscriptions: "/subscriptions - Gerenciar inscrições",
		unsubscribeTopic: "/unsubscribe [id] - Remover inscrição",
		loadMore: "/more - Carregar mais resultados",
	},

	// Export
	export: {
		title: "📥 Exportar Favoritos",
		cancelled: "Exportação cancelada.",
		selectFormat: "Selecione o formato de exportação:",
		generating: "Gerando exportação...",
		downloadReady: "Sua exportação está pronta!",
		fileCaption: "📚 Seus favoritos ({count} artigos)",
	},

	// Save paper
	save: {
		title: "📥 Salvar Artigo nos Favoritos",
		usage: "Para salvar um artigo, forneça o ID do arXiv ou URL:",
		example: "/save 2301.00001\n/save https://arxiv.org/abs/2301.00001",
		tip: "Você também pode salvar artigos diretamente dos resultados de pesquisa usando o botão ☆ Salvar!",
		fetching: "🔍 Buscando artigo do arXiv...",
		success: "⭐ Artigo salvo nos favoritos!",
	},

	// Author search
	author: {
		usage: "Uso: /author <nome>",
		example: "Exemplo: /author Yoshua Bengio",
		prompt: "🔍 Digite o nome do autor para pesquisar:",
		searching: '🔍 Pesquisando artigos de "{name}"...',
		results: "Artigos de {name}",
		noResults: 'Nenhum artigo encontrado para o autor "{name}".',
	},

	// Similar papers
	similar: {
		usage: "Uso: /similar <arxiv_id>",
		example: "Exemplo: /similar 2301.00001",
		hint: "Você pode encontrar o ID do arXiv nos links de artigos (ex. arxiv.org/abs/2301.00001)",
		searching: "🔍 Buscando artigos semelhantes...",
		notFound: '❌ Não foi possível encontrar o artigo com ID "{arxivId}".',
		noResults: "Nenhum artigo semelhante encontrado.",
		title: "📚 Artigos Semelhantes",
	},

	// Callback messages
	callbacks: {
		tooManyRequests: "Muitas solicitações. Por favor, aguarde.",
		pleaseStartFirst: "Por favor, inicie o bot primeiro com /start",
		userNotFound: "Usuário não encontrado. Tente /start primeiro.",
		subscriptionNotFound: "Inscrição não encontrada.",
		couldNotFetchPaper: "Não foi possível obter detalhes do artigo.",
		clearBookmarksHint:
			"Para limpar todos os favoritos, use um comando dedicado.",
		intervalUpdated: "✅ Intervalo atualizado para cada {hours} horas.",
	},

	// Category browsing
	categoryBrowse: {
		loading: "🔍 Carregando artigos recentes em {category}...",
		noResults: "Nenhum artigo encontrado na categoria {category}.",
	},

	// Inline query
	inlineQuery: {
		typeToSearch: "Digite pelo menos 3 caracteres para pesquisar",
		searchDescription: "Pesquisar artigos de pesquisa no arXiv",
		helpMessage:
			"🔍 Use este bot para pesquisar artigos no arXiv!\n\nBasta digitar @NomeDoBot seguido da sua consulta.",
		noResults: 'Nenhum artigo encontrado para "{query}"',
		tryDifferent: "Tente um termo de pesquisa diferente",
		searchFailed: "Pesquisa falhou",
		tryAgain: "Ocorreu um erro. Por favor, tente novamente.",
	},

	// General UI
	ui: {
		errorOccurred: "❌ Ocorreu um erro. Por favor, tente mais tarde.",
		paperCount: "Você tem {count} artigo(s) salvo(s).",
		yourSubscriptions: "📬 Suas Inscrições",
		tapToManage: "Toque em um tema para gerenciar ou remover.",
		settingsHeader: "⚙️ Configurações de Inscrição",
		intervalLabel: "⏱️ Intervalo",
		categoryLabel: "📂 Categoria",
		selectFrequency: '⏱️ Selecione a frequência de atualização para "{topic}":',
		exportPreparing: "📥 Preparando exportação {format}...",
		exportSuccess: "✅ Exportação {format} enviada! Verifique o arquivo acima.",
		bibtexFormat: "BibTeX",
		csvFormat: "CSV",
		forLatex: "Para LaTeX e gerenciadores de citações",
		forSpreadsheets: "Para planilhas (Excel, Google Sheets)",
		cancelButton: "❌ Cancelar",
		viewBookmarksButton: "📚 Ver Favoritos",
	},

	// Validation
	validation: {
		invalidArxivId: "❌ ID do arXiv ou URL inválido.",
		validFormats: "Formatos válidos:",
		alreadyBookmarked: "📌 Este artigo já está nos seus favoritos!",
		useBookmarksToView: "Use /bookmarks para ver seus artigos salvos.",
	},
};

export default pt;
