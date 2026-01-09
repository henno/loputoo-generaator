export interface SchoolFormatting {
	documentClass: 'report' | 'article' | 'book';
	fontSize: '10pt' | '11pt' | '12pt';
	paperSize: 'a4paper' | 'letterpaper';
	margins: {
		top: string;
		bottom: string;
		left: string;
		right: string;
	};
	font: {
		main: string;
		mono: string;
	};
	lineSpacing: number;
	paragraphSpacing: string;
	firstLineIndent: string;
}

export interface SchoolTitlePage {
	template: string;
	showUniversity: boolean;
	showProgram: boolean;
	showAdvisor: boolean;
	showPlace: boolean;
	showYear: boolean;
	logoPath?: string;
}

export interface SchoolHeadersFooters {
	headerContent: string;
	footerContent: string;
	pageNumberPosition: 'header-right' | 'header-center' | 'footer-right' | 'footer-center';
	firstPageDifferent: boolean;
}

export interface SchoolTableOfContents {
	enabled: boolean;
	depth: number;
	title: string;
}

export interface SchoolSections {
	topLevelDivision: 'chapter' | 'section' | 'part';
	numberSections: boolean;
	unnumberedSections: string[];
}

export interface SchoolBibliography {
	sectionTitle: string;
}

export interface SchoolCrossref {
	figureTitle: string;
	tableTitle: string;
	titleDelim: string;
	figPrefix: string[];
	tblPrefix: string[];
	secPrefix: string[];
}

export interface SchoolLanguage {
	documentLang: string;
	hyphenation: string;
}

export interface School {
	id: string;
	name: string;
	shortName: string;
	createdAt: string;
	updatedAt: string;
	formatting: SchoolFormatting;
	titlePage: SchoolTitlePage;
	headersFooters: SchoolHeadersFooters;
	tableOfContents: SchoolTableOfContents;
	sections: SchoolSections;
	bibliography: SchoolBibliography;
	crossref: SchoolCrossref;
	language: SchoolLanguage;
}

export interface SchoolSummary {
	id: string;
	name: string;
	shortName: string;
}

export const defaultSchoolSettings: Omit<School, 'id' | 'name' | 'shortName' | 'createdAt' | 'updatedAt'> = {
	formatting: {
		documentClass: 'report',
		fontSize: '12pt',
		paperSize: 'a4paper',
		margins: { top: '2cm', bottom: '2cm', left: '3cm', right: '1.5cm' },
		font: { main: 'Times New Roman', mono: 'Courier New' },
		lineSpacing: 1.5,
		paragraphSpacing: '0pt',
		firstLineIndent: '1.25cm'
	},
	titlePage: {
		template: '',
		showUniversity: true,
		showProgram: true,
		showAdvisor: true,
		showPlace: true,
		showYear: true
	},
	headersFooters: {
		headerContent: '',
		footerContent: '',
		pageNumberPosition: 'footer-center',
		firstPageDifferent: true
	},
	tableOfContents: {
		enabled: true,
		depth: 2,
		title: 'Sisukord'
	},
	sections: {
		topLevelDivision: 'chapter',
		numberSections: true,
		unnumberedSections: ['sissejuhatus', 'kokkuvõte', 'summary', 'kasutatud allikad', 'lühendite loetelu']
	},
	bibliography: {
		sectionTitle: 'Kasutatud allikad'
	},
	crossref: {
		figureTitle: 'Joonis',
		tableTitle: 'Tabel',
		titleDelim: '.',
		figPrefix: ['joonis', 'joonised'],
		tblPrefix: ['tabel', 'tabelid'],
		secPrefix: ['peatükk', 'peatükid']
	},
	language: {
		documentLang: 'et',
		hyphenation: 'estonian'
	}
};
