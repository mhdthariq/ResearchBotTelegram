/**
 * Japanese Translations (日本語)
 *
 * Japanese translation file.
 */

import type { Translations } from "../types";

export const ja: Translations = {
	// General
	welcome:
		"👋 Research Botへようこそ！\n\narXivの最新研究論文の発見と追跡をお手伝いします。\n\n/helpで利用可能なコマンドを確認できます。",
	help: "📚 利用可能なコマンド",
	error: "❌ エラーが発生しました",
	success: "✅ 成功",
	loading: "⏳ 読み込み中...",
	cancel: "操作がキャンセルされました",

	// Commands
	commands: {
		start: "ボットを起動してウェルカムメッセージを表示",
		help: "利用可能なすべてのコマンドを表示",
		search: "トピックで研究論文を検索",
		more: "現在の検索結果をさらに読み込む",
		bookmarks: "保存した論文を表示",
		history: "最近の検索履歴を表示",
		stats: "個人統計を表示",
		categories: "arXivカテゴリーで論文を閲覧",
		author: "著者名で論文を検索",
		export: "ブックマークをBibTeXとしてエクスポート",
		subscribe: "研究トピックの更新を購読",
		subscriptions: "購読を表示・管理",
		unsubscribe: "トピックの購読を解除",
		similar: "類似の論文を検索",
	},

	// Search
	search: {
		prompt:
			"🔍 どのトピックを検索しますか？\n\n検索クエリを入力するか、以下を使用してください：\n/search [トピック]",
		noResults:
			"🔍 論文が見つかりませんでした。\n\n別のキーワードを試すか、スペルを確認してください。",
		results: "📄 '{topic}'で{count}件の論文が見つかりました",
		loadMore: "さらに読み込む",
		newSearch: "🔍 新規検索",
		tip: "💡 ヒント：「AI」だけでなく「transformer attention mechanism」のような具体的な用語を使用してください",
		searching: "🔍 論文を検索中...",
	},

	// Papers
	papers: {
		title: "タイトル",
		authors: "著者",
		published: "公開日",
		abstract: "要旨",
		categories: "カテゴリー",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count}名",
	},

	// Bookmarks
	bookmarks: {
		title: "🔖 ブックマーク",
		empty:
			"📚 ブックマークはまだありません。\n\n検索結果から論文を保存してここに表示しましょう！",
		added: "✅ 論文をブックマークに追加しました！",
		removed: "🗑️ ブックマークを削除しました",
		exists: "📌 この論文は既にブックマークされています",
		exportTitle: "📚 BibTeXエクスポート",
		exportEmpty:
			"📚 エクスポートするブックマークがありません。\n\nまず論文を保存してください！",
		total: "{count}件",
		searchButton: "🔍 検索",
		clearAllButton: "🗑️ すべて削除",
		alreadyBookmarked:
			"📌 この論文は既にブックマークに保存されています！\n\n/bookmarksで保存した論文を表示できます。",
		couldNotLoad:
			"❌ ブックマークを読み込めませんでした。もう一度お試しください。",
	},

	// History
	history: {
		title: "📜 検索履歴",
		empty:
			"📜 検索履歴はまだありません。\n\n/searchで論文を検索してみましょう！",
		cleared: "📜 検索履歴をクリアしました。",
		clearConfirm: "検索履歴をすべて削除してもよろしいですか？",
		recentSearches: "🕐 最近の検索",
		tapToSearch: "タップして再検索：",
		fullHistory: "📜 全履歴",
		clearHistory: "🗑️ 履歴をクリア",
		newSearch: "🔍 新規検索",
		noHistory: "📜 検索履歴はまだありません。",
		startSearching: "/searchで検索を始めましょう！",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 購読",
		empty:
			"📭 まだ購読がありません。\n\n/subscribe <トピック>を使用して、関心のある研究トピックの定期更新を受け取りましょう。",
		created:
			"✅ '{topic}'の購読に成功しました！\n\n新しい論文の更新を受け取ります。",
		deleted: "🗑️ 購読を削除しました",
		updated: "✅ 購読設定を更新しました",
		prompt:
			"📬 どのトピックを購読しますか？\n\n例：/subscribe machine learning\nカテゴリー指定：/subscribe [cs.AI] neural networks",
		interval: "通知間隔",
		manage: "管理",
		addSubscription: "➕ 購読を追加",
		noSubscriptions: "📭 購読がありません。",
		useSubscribe: "/subscribe <トピック>で更新を受け取れます。",
	},

	// Errors
	errors: {
		apiError:
			"❌ arXivから論文を取得中にエラーが発生しました。\n\n後でもう一度お試しください。",
		rateLimited:
			"⏳ リクエストが多すぎます。{seconds}秒後にもう一度お試しください。",
		invalidCommand:
			"❓ 不明なコマンドです。\n\n/helpで利用可能なコマンドを確認してください。",
		invalidInput:
			"❌ 入力が無効です。\n\n入力を確認してもう一度お試しください。",
		notFound: "❌ 見つかりませんでした。",
		unauthorized: "🔒 この操作を実行する権限がありません。",
		tryAgain: "後でもう一度お試しください。",
	},

	// Buttons
	buttons: {
		previous: "⬅️ 前へ",
		next: "➡️ 次へ",
		bookmark: "🔖 ブックマーク",
		unbookmark: "🗑️ ブックマーク解除",
		details: "📋 詳細",
		similar: "🔗 類似論文",
		bibtex: "📝 BibTeX",
		back: "⬅️ 戻る",
		confirm: "✅ 確認",
		settings: "⚙️ 設定",
		search: "🔍 検索",
		searchPapers: "🔍 論文を検索",
	},

	// Stats
	stats: {
		title: "📊 統計",
		searches: "🔍 総検索数",
		uniqueQueries: "📝 ユニーククエリ",
		bookmarksCount: "🔖 保存した論文",
		subscriptionsCount: "📬 アクティブな購読",
	},

	// Categories
	categories: {
		title: "📂 arXivカテゴリー",
		select: "カテゴリーを選択して最新の論文を閲覧：",
	},

	// Time
	time: {
		hours: "時間",
		days: "日",
		weeks: "週間",
	},

	// Language settings
	language: {
		title: "🌐 言語設定",
		current: "現在の言語：{language}",
		select: "希望する言語を選択してください：",
		changed: "✅ 言語を{language}に変更しました",
		unavailable: "❌ この言語はまだ利用できません。英語を使用します。",
	},

	// Main menu
	menu: {
		welcome: "AI Research Assistantへようこそ！",
		description: "arXivの最新研究論文の発見をお手伝いします。",
		whatICan: "できること：",
		searchDesc: "任意のトピックで論文を検索",
		bookmarkDesc: "後で読むために論文をブックマーク",
		historyDesc: "検索履歴を表示",
		exportDesc: "引用文献をエクスポート（BibTeX）",
		useButtons: "下のボタンを使用するか、コマンドを直接入力してください！",
		currentLanguage: "現在の言語：",
		searchPapers: "論文を検索",
		myBookmarks: "ブックマーク",
		history: "履歴",
		help: "ヘルプ",
	},

	// Help page
	helpPage: {
		title: "📖 ヘルプ＆コマンド",
		searchCommands: "検索コマンド：",
		searchTopic: "/search [トピック] - 論文を検索",
		searchAuthor: "/author [名前] - 著者で検索",
		browseCategory: "/category - カテゴリーで閲覧",
		findSimilar: "/similar [arxiv_id] - 類似論文を検索",
		historyBookmarks: "履歴＆ブックマーク：",
		viewBookmarks: "/bookmarks - 保存した論文を表示",
		savePaper: "/save [arxiv_id] - IDまたはURLで論文を保存",
		viewHistory: "/history - 検索履歴",
		viewStats: "/stats - 統計情報",
		exportBibtex: "/export - ブックマークをBibTeXでエクスポート",
		subscriptionsTitle: "購読：",
		subscribeTopic: "/subscribe [トピック] - トピックの更新を購読",
		manageSubscriptions: "/subscriptions - 購読を管理",
		unsubscribeTopic: "/unsubscribe [id] - 購読を解除",
		loadMore: "/more - さらに結果を読み込む",
	},
};

export default ja;
