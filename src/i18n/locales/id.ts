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
		tip: "💡 Tips: Gunakan istilah spesifik untuk hasil yang lebih baik.",
		searching: "🔍 Mencari makalah...",
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
	},

	// History
	history: {
		title: "📜 Riwayat Pencarian",
		empty:
			"📜 Belum ada riwayat pencarian.\n\nMulai dengan /search untuk menemukan makalah!",
		cleared: "📜 Riwayat pencarian berhasil dihapus.",
		clearConfirm:
			"Apakah Anda yakin ingin menghapus seluruh riwayat pencarian?",
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
};

export default id;
