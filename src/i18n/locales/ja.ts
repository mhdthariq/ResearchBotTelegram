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
		tip: "💡 ヒント：より良い結果を得るには具体的な用語を使用してください。",
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
	},

	// History
	history: {
		title: "📜 検索履歴",
		empty:
			"📜 検索履歴はまだありません。\n\n/searchで論文を検索してみましょう！",
		cleared: "📜 検索履歴を正常にクリアしました。",
		clearConfirm: "検索履歴をすべて削除してもよろしいですか？",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 購読",
		empty:
			"📭 まだ購読がありません。\n\n/subscribe <トピック>を使用して、関心のある研究トピックの定期更新を受け取りましょう。",
		created:
			"✅ '{topic}'の購読に成功しました！\n\n新しい論文の更新を受け取ります。",
		deleted: "🗑️ 購読を正常に削除しました",
		updated: "✅ 購読設定を更新しました",
		prompt:
			"📬 どのトピックを購読しますか？\n\n例：/subscribe machine learning\nカテゴリー指定：/subscribe [cs.AI] neural networks",
		interval: "通知間隔",
		manage: "管理",
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
};

export default ja;
