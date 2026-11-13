import { projects } from '../../../../ijane/projects.js';
import { archives } from '../../../../ijane/creationArchive.js';

// Device shapes retain the original TV / desktop / phone choreography.
export const PLATFORM_CONFIG = {
    process: { color: '#8a6550', accentColor: '#c49968', label: '创作档案', shape: 'monitor' },
    visual: { color: '#7d6a91', accentColor: '#bca6c6', label: 'Visual studies', shape: 'tv' },
    experience: { color: '#668275', accentColor: '#a0b6a8', label: 'Experiences', shape: 'phone' },
};

export const CONTENT_DATA = [
    ...archives.map((archive, index) => {
        const { id } = archive;
        const project = projects.find(item => item.id === id);
        return {
            id: `process-${id}`,
            platform: 'process',
            device: ['monitor', 'tv', 'phone'][index % 3],
            title: project.title + ' · 创作档案',
            description: archive.question,
            thumbnail: project.cover.src,
            overlay: { type: 'ijane-page', page: 'archive/' + id },
        };
    }),
    ...projects.map((project, index) => ({
        id: project.id,
        platform: ['visual', 'experience'][index % 2],
        title: project.title,
        description: project.summary,
        thumbnail: project.cover.src,
        overlay: { type: 'ijane-project', projectId: project.id },
    })),
];
