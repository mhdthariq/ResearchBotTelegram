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
		noMorePapers: "📭 このトピックの論文はこれ以上ありません。",
		useSearchFirst: "まず/searchで論文を検索してください。",
		loadingMore: "📚 「{topic}」の論文をさらに読み込み中...",
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
		similarPapers: "📚 類似論文",
		noSimilarFound: "類似の論文が見つかりませんでした。",
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
		viewBookmarks: "📚 ブックマークを表示",
		saveButton: "☆ 保存",
		savedButton: "⭐ 保存済み",
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
		settings: "⚙️ 購読設定",
		topic: "📌 トピック",
		category: "📂 カテゴリー",
		selectToRemove: "削除する購読を選択してください：",
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
		couldNotProcess:
			"❌ リクエストを処理できませんでした。もう一度お試しください。",
		couldNotFetch: "❌ 論文の詳細を取得できませんでした。",
		couldNotSave: "❌ 論文を保存できませんでした。もう一度お試しください。",
		couldNotExport:
			"❌ ブックマークをエクスポートできませんでした。もう一度お試しください。",
		couldNotSend:
			"❌ エクスポートファイルを送信できませんでした。後でもう一度お試しください。",
		invalidExportFormat: "❌ 無効なエクスポート形式です。",
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
		loadMore: "📚 さらに読み込む",
		abstract: "📖 要旨",
		pdf: "📄 PDF",
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
		browseByCategory: "📂 カテゴリーで閲覧",
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

	// Export
	export: {
		title: "📥 ブックマークをエクスポート",
		cancelled: "エクスポートがキャンセルされました。",
		selectFormat: "エクスポート形式を選択してください：",
		generating: "エクスポートを生成中...",
		downloadReady: "エクスポートの準備ができました！",
		fileCaption: "📚 あなたのブックマーク（{count}件の論文）",
	},

	// Save paper
	save: {
		title: "📥 論文をブックマークに保存",
		usage: "論文を保存するには、arXiv IDまたはURLを入力してください：",
		example: "/save 2301.00001\n/save https://arxiv.org/abs/2301.00001",
		tip: "検索結果から☆保存ボタンで直接保存することもできます！",
		fetching: "🔍 arXivから論文を取得中...",
		success: "⭐ 論文をブックマークに保存しました！",
	},

	// Author search
	author: {
		usage: "使用方法：/author <名前>",
		example: "例：/author Yoshua Bengio",
		prompt: "🔍 検索する著者名を入力してください：",
		searching: "🔍 「{name}」の論文を検索中...",
		results: "{name}の論文",
		noResults: "著者「{name}」の論文が見つかりませんでした。",
	},

	// Similar papers
	similar: {
		usage: "使用方法：/similar <arxiv_id>",
		example: "例：/similar 2301.00001",
		hint: "arXiv IDは論文リンクで確認できます（例：arxiv.org/abs/2301.00001）",
		searching: "🔍 類似論文を検索中...",
		notFound: "❌ ID「{arxivId}」の論文が見つかりませんでした。",
		noResults: "類似の論文が見つかりませんでした。",
		title: "📚 類似論文",
	},

	// Callback messages
	callbacks: {
		tooManyRequests: "リクエストが多すぎます。お待ちください。",
		pleaseStartFirst: "まず/startでボットを起動してください",
		userNotFound: "ユーザーが見つかりません。/startをお試しください。",
		subscriptionNotFound: "購読が見つかりません。",
		couldNotFetchPaper: "論文の詳細を取得できませんでした。",
		clearBookmarksHint:
			"すべてのブックマークを削除するには、専用コマンドを使用してください。",
		intervalUpdated: "✅ 間隔を{hours}時間ごとに更新しました。",
	},

	// Category browsing
	categoryBrowse: {
		loading: "🔍 {category}の最新論文を読み込み中...",
		noResults: "カテゴリー{category}に論文が見つかりませんでした。",
	},

	// Inline query
	inlineQuery: {
		typeToSearch: "検索するには3文字以上入力してください",
		searchDescription: "arXivで研究論文を検索",
		helpMessage:
			"🔍 このボットでarXivの研究論文を検索できます！\n\n@ボット名の後に検索クエリを入力してください。",
		noResults: "「{query}」の論文が見つかりませんでした",
		tryDifferent: "別の検索語をお試しください",
		searchFailed: "検索に失敗しました",
		tryAgain: "エラーが発生しました。もう一度お試しください。",
	},

	// General UI
	ui: {
		errorOccurred: "❌ エラーが発生しました。後でもう一度お試しください。",
		paperCount: "{count}件の論文がブックマークされています。",
		yourSubscriptions: "📬 あなたの購読",
		tapToManage: "トピックをタップして管理または削除できます。",
		settingsHeader: "⚙️ 購読設定",
		intervalLabel: "⏱️ 間隔",
		categoryLabel: "📂 カテゴリー",
		selectFrequency: "⏱️「{topic}」の更新頻度を選択してください：",
		exportPreparing: "📥 {format}エクスポートを準備中...",
		exportSuccess:
			"✅ {format}エクスポートを送信しました！上のファイルを確認してください。",
		bibtexFormat: "BibTeX",
		csvFormat: "CSV",
		forLatex: "LaTeXと引用管理ツール用",
		forSpreadsheets: "スプレッドシート用（Excel、Google Sheets）",
		cancelButton: "❌ キャンセル",
		viewBookmarksButton: "📚 ブックマークを表示",
	},

	// Validation
	validation: {
		invalidArxivId: "❌ 無効なarXiv IDまたはURLです。",
		validFormats: "有効な形式：",
		alreadyBookmarked: "📌 この論文は既にブックマークに保存されています！",
		useBookmarksToView: "/bookmarksで保存した論文を表示できます。",
	},
};

export default ja;
