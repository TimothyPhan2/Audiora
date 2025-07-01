// In-memory cache for translations
export const translationCache = new Map<string, string>();

// Debug function to track API usage
let apiCallCount = 0;
export function logTranslationStats() {
  console.log(`🔍 Translation Stats:
    - API Calls Made: ${apiCallCount}
    - Cache Size: ${translationCache.size}
    - Cache Keys: ${Array.from(translationCache.keys()).slice(0, 5).join(', ')}...
  `);
}

export function incrementApiCallCount() {
  apiCallCount++;
}

// Unicode-safe cache key generation
export function getCacheKey(type: string, content: string, language: string): string {
  // Create a simple hash from the content for cache key
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `translation_${type}_${language}_${Math.abs(hash).toString(36).slice(0, 10)}`;
} 