/**
 * Chinese Translations (中文)
 *
 * Simplified Chinese translation file.
 */

import type { Translations } from "../types";

export const zh: Translations = {
	welcome:
		"👋 欢迎使用 Research Bot！\n\n我帮助您发现和追踪 arXiv 上的最新研究论文。",
	help: "📚 可用命令",
	error: "❌ 发生错误",
	success: "✅ 成功",
	loading: "⏳ 加载中...",
	cancel: "操作已取消",

	commands: {
		start: "启动机器人",
		help: "显示可用命令",
		search: "搜索论文",
		more: "加载更多结果",
		bookmarks: "查看已保存的论文",
		history: "查看搜索历史",
		stats: "查看您的统计",
		categories: "按类别浏览",
		author: "按作者搜索",
		export: "导出书签为 BibTeX",
		subscribe: "订阅主题",
		subscriptions: "管理订阅",
		unsubscribe: "取消订阅",
		similar: "查找相似论文",
	},

	search: {
		prompt: "🔍 您想搜索什么主题？",
		noResults: "🔍 未找到论文。\n\n请尝试不同的关键词。",
		results: "📄 为 '{topic}' 找到 {count} 篇论文",
		loadMore: "加载更多",
		newSearch: "新搜索",
		tip: "💡 提示：使用具体术语获得更好的结果。",
		searching: "🔍 搜索中...",
	},

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

	bookmarks: {
		title: "🔖 您的书签",
		empty: "📚 还没有书签。先保存一些论文吧！",
		added: "✅ 已添加书签！",
		removed: "🗑️ 书签已移除",
		exists: "📌 已经添加过书签",
		exportTitle: "📚 BibTeX 导出",
		exportEmpty: "📚 没有可导出的书签。先保存一些论文！",
	},

	history: {
		title: "📜 搜索历史",
		empty: "📜 还没有搜索历史。开始使用 /search！",
		cleared: "📜 搜索历史已清除。",
		clearConfirm: "您确定要清除搜索历史吗？",
	},

	subscriptions: {
		title: "📬 您的订阅",
		empty: "📭 您还没有任何订阅。\n使用 /subscribe <主题> 获取定期更新。",
		created: "✅ 已订阅 '{topic}'",
		deleted: "🗑️ 订阅已移除",
		updated: "✅ 订阅已更新",
		prompt: "📬 您想订阅什么主题？",
		interval: "通知间隔",
		manage: "管理",
	},

	errors: {
		apiError: "❌ 获取论文时出错。请稍后再试。",
		rateLimited: "⏳ 请求过多。请等待 {seconds} 秒。",
		invalidCommand: "❓ 未知命令。使用 /help 查看可用命令。",
		invalidInput: "❌ 输入无效。请检查后重试。",
		notFound: "❌ 未找到。",
		unauthorized: "🔒 您没有权限执行此操作。",
		tryAgain: "请稍后再试。",
	},

	buttons: {
		previous: "⬅️ 上一页",
		next: "➡️ 下一页",
		bookmark: "🔖 收藏",
		unbookmark: "🗑️ 移除",
		details: "📋 详情",
		similar: "🔗 相似",
		bibtex: "📝 BibTeX",
		back: "⬅️ 返回",
		confirm: "✅ 确认",
		settings: "⚙️ 设置",
	},

	stats: {
		title: "📊 您的统计",
		searches: "🔍 搜索次数",
		uniqueQueries: "📝 独特查询",
		bookmarksCount: "🔖 书签数",
		subscriptionsCount: "📬 订阅数",
	},

	categories: {
		title: "📂 类别",
		select: "选择一个类别浏览：",
	},

	time: {
		hours: "小时",
		days: "天",
		weeks: "周",
	},

	language: {
		title: "🌐 语言设置",
		current: "当前语言：{language}",
		select: "选择您的首选语言：",
		changed: "✅ 语言已更改为 {language}",
		unavailable: "❌ 此语言暂不可用。使用英语。",
	},
};

export default zh;
