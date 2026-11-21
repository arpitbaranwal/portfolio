import contextEngineImg from '$lib/assets/projects/context_engine.jpg';
import shikshamapImg from '$lib/assets/projects/shikshamap.png';
import imagiImg from '$lib/assets/projects/imagi.png';
import carepalImg from '$lib/assets/projects/carepal.jpg';

export interface Project {
	id: string;
	title: string;
	description: string;
	tags: string[];
	previewType: 'terminal' | 'dashboard' | 'studio' | 'chat';
	previewImage?: string; // Optional: drop path or image import to override dark UI preview
	codeUrl?: string; // #TODO: Paste your GitHub repository URL here
	liveUrl?: string; // #TODO: Paste your live demo or paper URL here; if empty, the button hides automatically
	liveLabel?: string; // Optional custom label: 'Live' (default), 'Paper', 'Demo'
	docsUrl?: string; // #TODO: Optional documentation link
}

export const projects: Project[] = [
	{
		id: 'context-engine',
		title: 'CONTEXT ENGINE',
		description:
			'hybrid RAG and OS-style working memory engine using custom BM25F, FAISS, and RRF — 22.97ms avg latency and 99.72% token reduction across 1,118 pages.',
		tags: ['python', 'rag-architecture', 'faiss', 'bm25f', 'gemini-api'],
		previewType: 'terminal',
		previewImage: contextEngineImg,
		codeUrl: 'https://github.com/arpitbaranwal/Context_Management_Engine',
		liveUrl: '', // #TODO: 'https://arxiv.org'
		liveLabel: 'Paper'
	},
	{
		id: 'shikshamap',
		title: 'SHIKSHAMAP',
		description:
			'GeoAI educational welfare platform analyzing 52 districts in Madhya Pradesh via a weighted Learning Poverty Index and Random Forest model (R² = 0.86).',
		tags: ['python', 'scikit-learn', 'fastapi', 'react', 'sql'],
		previewType: 'dashboard',
		previewImage: shikshamapImg,
		codeUrl: 'https://github.com/arpitbaranwal/sikshamap',
		liveUrl: '', // #TODO: 'https://shikshamap.vercel.app'
		liveLabel: 'Live'
	},
	{
		id: 'imagi',
		title: 'IMAGI',
		description:
			'text-to-image synthesis pipeline powered by Stable Diffusion and GAN architectures for high-fidelity prompt-driven visual generation.',
		tags: ['python', 'pytorch', 'stable-diffusion', 'huggingface', 'gans'],
		previewType: 'studio',
		previewImage: imagiImg,
		codeUrl: 'https://github.com/arpitbaranwal/Imagi',
		liveUrl: '', // #TODO: Left empty so Live button is hidden automatically
		liveLabel: 'Live'
	},
	{
		id: 'carepal',
		title: 'CAREPAL',
		description:
			'lightweight RAG customer support assistant with automated web scraping, local vector retrieval, evaluation suite, and out-of-scope escalation.',
		tags: ['python', 'rag-architecture', 'streamlit', 'faiss', 'gemini-api'],
		previewType: 'chat',
		previewImage: carepalImg,
		codeUrl: 'https://github.com/arpitbaranwal/carepal-support-assistant',
		liveUrl: '', // #TODO: 'https://carepal.streamlit.app'
		liveLabel: 'Live'
	}
];
