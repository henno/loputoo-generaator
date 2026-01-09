export interface ProjectMetadata {
	title: string;
	author: string;
	university?: string;
	program: string;
	worktype: string;
	advisor: string;
	coAdvisor?: string;
	place: string;
	year: string;
	abstract?: string;
	keywords?: string[];
}

export interface ProjectContent {
	markdown: string;
	bibliography: string;
}

export interface ProjectImage {
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	uploadedAt: string;
}

export interface ProjectGeneration {
	type: 'pdf' | 'docx';
	generatedAt: string;
	filename: string;
	success: boolean;
	error?: string;
}

export interface Project {
	id: string;
	schoolId: string;
	createdAt: string;
	updatedAt: string;
	metadata: ProjectMetadata;
	content: ProjectContent;
	images: ProjectImage[];
	generations: ProjectGeneration[];
}

export interface ProjectSummary {
	id: string;
	title: string;
	author: string;
	schoolId: string;
	schoolName: string;
	updatedAt: string;
}
