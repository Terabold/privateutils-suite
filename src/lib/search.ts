import Fuse, { IFuseOptions } from 'fuse.js';
import { Tool } from '@/types/tool';

const fuseOptions: IFuseOptions<Tool> = {
  keys: [
    { name: 'title', weight: 1.0 },
    { name: 'tags', weight: 0.7 },
    { name: 'description', weight: 0.4 },
  ],
  threshold: 0.4, // Balanced sensitivity: 0.0 is perfect match, 1.0 is everything
  includeScore: true,
  shouldSort: true,
  distance: 100, // Search distance from matches
};

let fuse: Fuse<Tool> | null = null;

export const searchTools = (tools: Tool[], query: string): Tool[] => {
  if (!query.trim()) return tools;

  if (!fuse) {
    fuse = new Fuse(tools, fuseOptions);
  } else {
    // Optionally update collection if tools changed (rare for this app)
    fuse.setCollection(tools);
  }

  const results = fuse.search(query);
  return results.map(result => result.item);
};
