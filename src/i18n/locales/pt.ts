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
		tip: "💡 Dica: Use termos específicos para melhores resultados.",
		searching: "🔍 Pesquisando artigos...",
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
	},

	// History
	history: {
		title: "📜 Histórico de Pesquisa",
		empty:
			"📜 Nenhum histórico ainda.\n\nComece com /search para encontrar artigos!",
		cleared: "📜 Histórico de pesquisa limpo com sucesso.",
		clearConfirm:
			"Tem certeza de que deseja limpar todo o seu histórico de pesquisa?",
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
};

export default pt;
