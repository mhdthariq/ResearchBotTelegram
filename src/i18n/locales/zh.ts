/**
 * Chinese Translations (中文)
 *
 * Simplified Chinese translation file.
 */

import type { Translations } from "../types";

export const zh: Translations = {
	// General
	welcome:
		"👋 欢迎使用 Research Bot！\n\n我帮助您发现和追踪 arXiv 上的最新研究论文。\n\n使用 /help 查看可用命令。",
	help: "📚 可用命令",
	error: "❌ 发生错误",
	success: "✅ 成功",
	loading: "⏳ 加载中...",
	cancel: "操作已取消",

	// Commands
	commands: {
		start: "启动机器人并显示欢迎消息",
		help: "显示所有可用命令",
		search: "按主题搜索研究论文",
		more: "加载当前搜索的更多结果",
		bookmarks: "查看已保存的论文",
		history: "查看最近搜索历史",
		stats: "查看个人统计",
		categories: "按 arXiv 类别浏览论文",
		author: "按作者姓名搜索论文",
		export: "将书签导出为 BibTeX",
		subscribe: "订阅研究主题以获取更新",
		subscriptions: "查看和管理订阅",
		unsubscribe: "取消主题订阅",
		similar: "查找相似论文",
	},

	// Search
	search: {
		prompt: "🔍 您想搜索什么主题？\n\n输入搜索查询或使用：\n/search [主题]",
		noResults: "🔍 未找到论文。\n\n请尝试不同的关键词或检查拼写。",
		results: "📄 为 '{topic}' 找到 {count} 篇论文",
		loadMore: "加载更多",
		newSearch: "🔍 新搜索",
		tip: "💡 提示：使用具体术语如「transformer attention mechanism」而不是仅仅「AI」",
		searching: "🔍 搜索论文中...",
	},

	// Papers
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

	// Bookmarks
	bookmarks: {
		title: "🔖 您的书签",
		empty: "📚 还没有书签。\n\n从搜索结果中保存论文即可在此显示！",
		added: "✅ 论文已添加到书签！",
		removed: "🗑️ 书签已移除",
		exists: "📌 此论文已被收藏",
		exportTitle: "📚 BibTeX 导出",
		exportEmpty: "📚 没有可导出的书签。\n\n请先保存一些论文！",
		total: "{count} 篇",
		searchButton: "🔍 搜索",
		clearAllButton: "🗑️ 全部清除",
		alreadyBookmarked:
			"📌 此论文已在您的书签中！\n\n使用 /bookmarks 查看已保存的论文。",
		couldNotLoad: "❌ 无法加载您的书签。请重试。",
	},

	// History
	history: {
		title: "📜 搜索历史",
		empty: "📜 还没有搜索历史。\n\n使用 /search 开始查找论文！",
		cleared: "📜 搜索历史已清除。",
		clearConfirm: "您确定要清除整个搜索历史吗？",
		recentSearches: "🕐 最近搜索",
		tapToSearch: "点击搜索词重新搜索：",
		fullHistory: "📜 完整历史",
		clearHistory: "🗑️ 清除历史",
		newSearch: "🔍 新搜索",
		noHistory: "📜 还没有搜索历史。",
		startSearching: "使用 /search 开始搜索！",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 您的订阅",
		empty:
			"📭 您还没有任何订阅。\n\n使用 /subscribe <主题> 获取您关心的研究主题的定期更新。",
		created: "✅ 已成功订阅 '{topic}'！\n\n您将收到新论文的更新。",
		deleted: "🗑️ 订阅已成功移除",
		updated: "✅ 订阅设置已更新",
		prompt:
			"📬 您想订阅什么主题？\n\n例如：/subscribe machine learning\n可选类别：/subscribe [cs.AI] neural networks",
		interval: "通知间隔",
		manage: "管理",
		addSubscription: "➕ 添加订阅",
		noSubscriptions: "📭 您没有任何订阅。",
		useSubscribe: "使用 /subscribe <主题> 获取更新。",
	},

	// Errors
	errors: {
		apiError: "❌ 从 arXiv 获取论文时出错。\n\n请稍后再试。",
		rateLimited: "⏳ 请求过多。请等待 {seconds} 秒后再试。",
		invalidCommand: "❓ 未知命令。\n\n使用 /help 查看所有可用命令。",
		invalidInput: "❌ 输入无效。\n\n请检查您的输入后重试。",
		notFound: "❌ 未找到。",
		unauthorized: "🔒 您没有权限执行此操作。",
		tryAgain: "请稍后再试。",
	},

	// Buttons
	buttons: {
		previous: "⬅️ 上一页",
		next: "➡️ 下一页",
		bookmark: "🔖 收藏",
		unbookmark: "🗑️ 取消收藏",
		details: "📋 详情",
		similar: "🔗 相似论文",
		bibtex: "📝 BibTeX",
		back: "⬅️ 返回",
		confirm: "✅ 确认",
		settings: "⚙️ 设置",
		search: "🔍 搜索",
		searchPapers: "🔍 搜索论文",
	},

	// Stats
	stats: {
		title: "📊 您的统计",
		searches: "🔍 总搜索次数",
		uniqueQueries: "📝 独特查询",
		bookmarksCount: "🔖 已保存论文",
		subscriptionsCount: "📬 活跃订阅",
	},

	// Categories
	categories: {
		title: "📂 arXiv 类别",
		select: "选择一个类别浏览最新论文：",
	},

	// Time
	time: {
		hours: "小时",
		days: "天",
		weeks: "周",
	},

	// Language settings
	language: {
		title: "🌐 语言设置",
		current: "当前语言：{language}",
		select: "选择您的首选语言：",
		changed: "✅ 语言已更改为 {language}",
		unavailable: "❌ 此语言暂不可用。使用英语。",
	},

	// Main menu
	menu: {
		welcome: "欢迎使用 AI Research Assistant！",
		description: "我帮助您发现 arXiv 上的最新研究论文。",
		whatICan: "我能做的：",
		searchDesc: "搜索任意主题的论文",
		bookmarkDesc: "收藏论文以便稍后阅读",
		historyDesc: "查看搜索历史",
		exportDesc: "导出引用（BibTeX）",
		useButtons: "使用下方按钮或直接输入命令！",
		currentLanguage: "当前语言：",
		searchPapers: "搜索论文",
		myBookmarks: "我的收藏",
		history: "历史",
		help: "帮助",
	},

	// Help page
	helpPage: {
		title: "📖 帮助与命令",
		searchCommands: "搜索命令：",
		searchTopic: "/search [主题] - 搜索论文",
		searchAuthor: "/author [姓名] - 按作者搜索",
		browseCategory: "/category - 按类别浏览",
		findSimilar: "/similar [arxiv_id] - 查找相似论文",
		historyBookmarks: "历史与书签：",
		viewBookmarks: "/bookmarks - 查看已保存论文",
		savePaper: "/save [arxiv_id] - 通过 ID 或 URL 保存论文",
		viewHistory: "/history - 搜索历史",
		viewStats: "/stats - 您的统计",
		exportBibtex: "/export - 将书签导出为 BibTeX",
		subscriptionsTitle: "订阅：",
		subscribeTopic: "/subscribe [主题] - 获取主题更新",
		manageSubscriptions: "/subscriptions - 管理订阅",
		unsubscribeTopic: "/unsubscribe [id] - 取消订阅",
		loadMore: "/more - 加载更多结果",
	},
};

export default zh;
