/**
 * Indonesian Translations (Bahasa Indonesia)
 */

import type { Translations } from "../types";

export const id: Translations = {
	// General
	welcome:
		"👋 Selamat datang di Research Bot!\n\nSaya membantu Anda menemukan dan mengikuti makalah penelitian terbaru dari arXiv.\n\nGunakan /help untuk melihat perintah yang tersedia.",
	help: "📚 Perintah yang Tersedia",
	error: "❌ Terjadi kesalahan",
	success: "✅ Berhasil",
	loading: "⏳ Memuat...",
	cancel: "Operasi dibatalkan",

	// Commands
	commands: {
		start: "Mulai bot dan lihat pesan selamat datang",
		help: "Tampilkan semua perintah yang tersedia",
		search: "Cari makalah penelitian berdasarkan topik",
		more: "Muat lebih banyak hasil dari pencarian saat ini",
		bookmarks: "Lihat makalah yang disimpan",
		history: "Lihat riwayat pencarian terbaru",
		stats: "Lihat statistik pribadi Anda",
		categories: "Jelajahi makalah berdasarkan kategori arXiv",
		author: "Cari makalah berdasarkan nama penulis",
		export: "Ekspor bookmark sebagai BibTeX",
		subscribe: "Berlangganan topik penelitian untuk pembaruan",
		subscriptions: "Lihat dan kelola langganan Anda",
		unsubscribe: "Hapus langganan topik",
		similar: "Temukan makalah serupa",
	},

	// Search
	search: {
		prompt:
			"🔍 Topik apa yang ingin Anda cari?\n\nKetik kueri pencarian Anda atau gunakan:\n/search [topik]",
		noResults:
			"🔍 Tidak ada makalah ditemukan.\n\nCoba kata kunci berbeda atau periksa ejaan Anda.",
		results: "📄 Ditemukan {count} makalah untuk '{topic}'",
		loadMore: "Muat Lebih Banyak",
		newSearch: "🔍 Pencarian Baru",
		tip: '💡 Tips: Gunakan istilah spesifik seperti "transformer attention mechanism" daripada hanya "AI"',
		searching: "🔍 Mencari makalah...",
		noMorePapers: "📭 Tidak ada makalah lagi untuk topik ini.",
		useSearchFirst: "Gunakan /search terlebih dahulu untuk mencari makalah.",
		loadingMore: '📚 Memuat lebih banyak makalah untuk "{topic}"...',
	},

	// Papers
	papers: {
		title: "Judul",
		authors: "Penulis",
		published: "Diterbitkan",
		abstract: "Abstrak",
		categories: "Kategori",
		viewPdf: "📄 PDF",
		viewArxiv: "🔗 arXiv",
		moreAuthors: "+{count} lainnya",
		similarPapers: "📚 Makalah Serupa",
		noSimilarFound: "Tidak ada makalah serupa ditemukan.",
	},

	// Bookmarks
	bookmarks: {
		title: "🔖 Bookmark Anda",
		empty:
			"📚 Belum ada bookmark.\n\nSimpan makalah dari hasil pencarian untuk melihatnya di sini!",
		added: "✅ Makalah ditambahkan ke bookmark!",
		removed: "🗑️ Bookmark dihapus",
		exists: "📌 Makalah ini sudah di-bookmark",
		exportTitle: "📚 Ekspor BibTeX",
		exportEmpty:
			"📚 Tidak ada bookmark untuk diekspor.\n\nSimpan beberapa makalah terlebih dahulu!",
		total: "{count} total",
		searchButton: "🔍 Cari",
		clearAllButton: "🗑️ Hapus Semua",
		alreadyBookmarked:
			"📌 Makalah ini sudah ada di bookmark Anda!\n\nGunakan /bookmarks untuk melihat makalah yang disimpan.",
		couldNotLoad: "❌ Tidak dapat memuat bookmark Anda. Silakan coba lagi.",
		viewBookmarks: "📚 Lihat Bookmark",
		saveButton: "☆ Simpan",
		savedButton: "⭐ Tersimpan",
	},

	// History
	history: {
		title: "📜 Riwayat Pencarian",
		empty:
			"📜 Belum ada riwayat pencarian.\n\nMulai dengan /search untuk menemukan makalah!",
		cleared: "📜 Riwayat pencarian dihapus.",
		clearConfirm:
			"Apakah Anda yakin ingin menghapus seluruh riwayat pencarian?",
		recentSearches: "🕐 Pencarian Terbaru",
		tapToSearch: "Ketuk pencarian untuk menjalankannya lagi:",
		fullHistory: "📜 Riwayat Lengkap",
		clearHistory: "🗑️ Hapus Riwayat",
		newSearch: "🔍 Pencarian Baru",
		noHistory: "📜 Belum ada riwayat pencarian.",
		startSearching: "Mulai dengan /search!",
	},

	// Subscriptions
	subscriptions: {
		title: "📬 Langganan Anda",
		empty:
			"📭 Anda belum memiliki langganan.\n\nGunakan /subscribe <topik> untuk mendapatkan pembaruan berkala tentang topik penelitian yang Anda minati.",
		created:
			"✅ Berhasil berlangganan '{topic}'!\n\nAnda akan menerima pembaruan tentang makalah baru.",
		deleted: "🗑️ Langganan berhasil dihapus",
		updated: "✅ Pengaturan langganan diperbarui",
		prompt:
			"📬 Topik apa yang ingin Anda langgani?\n\nContoh: /subscribe machine learning\nKategori opsional: /subscribe [cs.AI] neural networks",
		interval: "Interval notifikasi",
		manage: "Kelola",
		addSubscription: "➕ Tambah Langganan",
		noSubscriptions: "📭 Anda tidak memiliki langganan.",
		useSubscribe: "Gunakan /subscribe <topik> untuk mendapatkan pembaruan.",
		settings: "⚙️ Pengaturan Langganan",
		topic: "📌 Topik",
		category: "📂 Kategori",
		selectToRemove: "Pilih langganan untuk dihapus:",
	},

	// Errors
	errors: {
		apiError:
			"❌ Kesalahan mengambil makalah dari arXiv.\n\nSilakan coba lagi nanti.",
		rateLimited:
			"⏳ Terlalu banyak permintaan. Silakan tunggu {seconds} detik sebelum mencoba lagi.",
		invalidCommand:
			"❓ Perintah tidak dikenal.\n\nGunakan /help untuk melihat semua perintah yang tersedia.",
		invalidInput:
			"❌ Input tidak valid.\n\nSilakan periksa input Anda dan coba lagi.",
		notFound: "❌ Tidak ditemukan.",
		unauthorized: "🔒 Anda tidak memiliki izin untuk melakukan tindakan ini.",
		tryAgain: "Silakan coba lagi nanti.",
		couldNotProcess: "❌ Tidak dapat memproses permintaan. Silakan coba lagi.",
		couldNotFetch: "❌ Tidak dapat mengambil detail makalah.",
		couldNotSave: "❌ Tidak dapat menyimpan makalah. Silakan coba lagi.",
		couldNotExport: "❌ Tidak dapat mengekspor bookmark. Silakan coba lagi.",
		couldNotSend:
			"❌ Tidak dapat mengirim file ekspor. Silakan coba lagi nanti.",
		invalidExportFormat: "❌ Format ekspor tidak valid.",
	},

	// Buttons
	buttons: {
		previous: "⬅️ Sebelumnya",
		next: "➡️ Selanjutnya",
		bookmark: "🔖 Bookmark",
		unbookmark: "🗑️ Hapus Bookmark",
		details: "📋 Detail",
		similar: "🔗 Makalah Serupa",
		bibtex: "📝 BibTeX",
		back: "⬅️ Kembali",
		confirm: "✅ Konfirmasi",
		settings: "⚙️ Pengaturan",
		search: "🔍 Cari",
		searchPapers: "🔍 Cari Makalah",
		loadMore: "📚 Muat Lagi",
		abstract: "📖 Abstrak",
		pdf: "📄 PDF",
	},

	// Stats
	stats: {
		title: "📊 Statistik Anda",
		searches: "🔍 Total Pencarian",
		uniqueQueries: "📝 Kueri Unik",
		bookmarksCount: "🔖 Makalah Tersimpan",
		subscriptionsCount: "📬 Langganan Aktif",
	},

	// Categories
	categories: {
		title: "📂 Kategori arXiv",
		select: "Pilih kategori untuk menjelajahi makalah terbaru:",
		browseByCategory: "📂 Jelajahi berdasarkan Kategori",
	},

	// Time
	time: {
		hours: "jam",
		days: "hari",
		weeks: "minggu",
	},

	// Language settings
	language: {
		title: "🌐 Pengaturan Bahasa",
		current: "Bahasa saat ini: {language}",
		select: "Pilih bahasa pilihan Anda:",
		changed: "✅ Bahasa diubah ke {language}",
		unavailable: "❌ Bahasa ini belum tersedia. Menggunakan Bahasa Inggris.",
	},

	// Main menu
	menu: {
		welcome: "Selamat datang di AI Research Assistant!",
		description:
			"Saya membantu Anda menemukan makalah penelitian terbaru dari arXiv.",
		whatICan: "Yang bisa saya lakukan:",
		searchDesc: "Mencari makalah tentang topik apa pun",
		bookmarkDesc: "Menyimpan makalah untuk nanti",
		historyDesc: "Melihat riwayat pencarian Anda",
		exportDesc: "Mengekspor sitasi (BibTeX)",
		useButtons: "Gunakan tombol di bawah atau ketik perintah langsung!",
		currentLanguage: "Bahasa saat ini:",
		searchPapers: "Cari Makalah",
		myBookmarks: "Bookmark Saya",
		history: "Riwayat",
		help: "Bantuan",
	},

	// Help page
	helpPage: {
		title: "📖 Bantuan & Perintah",
		searchCommands: "Perintah Pencarian:",
		searchTopic: "/search [topik] - Cari makalah",
		searchAuthor: "/author [nama] - Cari berdasarkan penulis",
		browseCategory: "/category - Jelajahi berdasarkan kategori",
		findSimilar: "/similar [arxiv_id] - Temukan makalah serupa",
		historyBookmarks: "Riwayat & Bookmark:",
		viewBookmarks: "/bookmarks - Lihat makalah tersimpan",
		savePaper: "/save [arxiv_id] - Simpan makalah berdasarkan ID atau URL",
		viewHistory: "/history - Riwayat pencarian",
		viewStats: "/stats - Statistik Anda",
		exportBibtex: "/export - Ekspor bookmark sebagai BibTeX",
		subscriptionsTitle: "Langganan:",
		subscribeTopic: "/subscribe [topik] - Dapatkan pembaruan tentang topik",
		manageSubscriptions: "/subscriptions - Kelola langganan",
		unsubscribeTopic: "/unsubscribe [id] - Hapus langganan",
		loadMore: "/more - Muat lebih banyak hasil",
	},

	// Export
	export: {
		title: "📥 Ekspor Bookmark",
		cancelled: "Ekspor dibatalkan.",
		selectFormat: "Pilih format ekspor:",
		generating: "Membuat ekspor...",
		downloadReady: "Ekspor Anda siap!",
		fileCaption: "📚 Bookmark Anda ({count} makalah)",
	},

	// Save paper
	save: {
		title: "📥 Simpan Makalah ke Bookmark",
		usage: "Untuk menyimpan makalah, berikan ID atau URL arXiv:",
		example: "/save 2301.00001\n/save https://arxiv.org/abs/2301.00001",
		tip: "Anda juga dapat menyimpan makalah langsung dari hasil pencarian menggunakan tombol ☆ Simpan!",
		fetching: "🔍 Mengambil makalah dari arXiv...",
		success: "⭐ Makalah disimpan ke bookmark!",
	},

	// Author search
	author: {
		usage: "Penggunaan: /author <nama>",
		example: "Contoh: /author Yoshua Bengio",
		prompt: "🔍 Masukkan nama penulis untuk dicari:",
		searching: '🔍 Mencari makalah oleh "{name}"...',
		results: "Makalah oleh {name}",
		noResults: 'Tidak ada makalah ditemukan untuk penulis "{name}".',
	},

	// Similar papers
	similar: {
		usage: "Penggunaan: /similar <arxiv_id>",
		example: "Contoh: /similar 2301.00001",
		hint: "Anda dapat menemukan ID arXiv di tautan makalah (contoh: arxiv.org/abs/2301.00001)",
		searching: "🔍 Mencari makalah serupa...",
		notFound: '❌ Tidak dapat menemukan makalah dengan ID "{arxivId}".',
		noResults: "Tidak ada makalah serupa ditemukan.",
		title: "📚 Makalah Serupa",
	},

	// Callback messages
	callbacks: {
		tooManyRequests: "Terlalu banyak permintaan. Silakan tunggu.",
		pleaseStartFirst: "Silakan mulai bot terlebih dahulu dengan /start",
		userNotFound:
			"Pengguna tidak ditemukan. Silakan coba /start terlebih dahulu.",
		subscriptionNotFound: "Langganan tidak ditemukan.",
		couldNotFetchPaper: "Tidak dapat mengambil detail makalah.",
		clearBookmarksHint:
			"Untuk menghapus semua bookmark, gunakan perintah khusus.",
		intervalUpdated: "✅ Interval diperbarui menjadi setiap {hours} jam.",
	},

	// Category browsing
	categoryBrowse: {
		loading: "🔍 Memuat makalah terbaru di {category}...",
		noResults: "Tidak ada makalah ditemukan di kategori {category}.",
	},

	// Inline query
	inlineQuery: {
		typeToSearch: "Ketik minimal 3 karakter untuk mencari",
		searchDescription: "Cari makalah penelitian di arXiv",
		helpMessage:
			"🔍 Gunakan bot ini untuk mencari makalah penelitian di arXiv!\n\nCukup ketik @NamaBotAnda diikuti dengan kueri pencarian Anda.",
		noResults: 'Tidak ada makalah ditemukan untuk "{query}"',
		tryDifferent: "Coba istilah pencarian yang berbeda",
		searchFailed: "Pencarian gagal",
		tryAgain: "Terjadi kesalahan. Silakan coba lagi.",
	},

	// General UI
	ui: {
		errorOccurred: "❌ Terjadi kesalahan. Silakan coba lagi nanti.",
		paperCount: "Anda memiliki {count} makalah yang di-bookmark.",
		yourSubscriptions: "📬 Langganan Anda",
		tapToManage: "Ketuk topik untuk mengelola atau menghapusnya.",
		settingsHeader: "⚙️ Pengaturan Langganan",
		intervalLabel: "⏱️ Interval",
		categoryLabel: "📂 Kategori",
		selectFrequency: '⏱️ Pilih frekuensi pembaruan untuk "{topic}":',
		exportPreparing: "📥 Menyiapkan ekspor {format}...",
		exportSuccess: "✅ Ekspor {format} terkirim! Periksa file di atas.",
		bibtexFormat: "BibTeX",
		csvFormat: "CSV",
		forLatex: "Untuk LaTeX dan manajer sitasi",
		forSpreadsheets: "Untuk spreadsheet (Excel, Google Sheets)",
		cancelButton: "❌ Batal",
		viewBookmarksButton: "📚 Lihat Bookmark",
	},

	// Validation
	validation: {
		invalidArxivId: "❌ ID atau URL arXiv tidak valid.",
		validFormats: "Format yang valid:",
		alreadyBookmarked: "📌 Makalah ini sudah ada di bookmark Anda!",
		useBookmarksToView:
			"Gunakan /bookmarks untuk melihat makalah yang disimpan.",
	},
};

export default id;
