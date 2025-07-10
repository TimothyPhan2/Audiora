import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Music, Loader2, ChevronDown } from 'lucide-react'; // Add ChevronDown
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { SongCard } from '@/components/ui/song-card';
import { FilterChip } from '@/components/ui/filter-chip';
import { getSongs, SongWithExtras, filterSongs } from '@/lib/api';
import { languageOptions } from '@/lib/mockLessonsData';
import { useAuthStore } from '@/stores/authStore';

export function Lessons() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Initialize language filter with user's preference
  const userPreferredLanguage = user?.learning_languages?.[0] || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(userPreferredLanguage);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showOtherLanguages, setShowOtherLanguages] = useState(false); // Add this state

  // Songs data state
  const [songs, setSongs] = useState<SongWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update selectedLanguage when user changes
  useEffect(() => {
    if (user?.learning_languages?.[0]) {
      setSelectedLanguage(user.learning_languages[0]);
    }
  }, [user]);

  useEffect(() => {
    if (selectedLanguage === userPreferredLanguage || selectedLanguage === 'all') {
      setShowOtherLanguages(false);
    }
  }, [selectedLanguage, userPreferredLanguage]);

  // Fetch songs from database on component mount
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        const songsData = await getSongs();
        setSongs(songsData);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Simplified filter logic - only language and search
  const filteredSongs = useMemo(() => {
    return filterSongs(songs, {
      searchQuery,
      language: selectedLanguage,
      level: 'All', // Default values for removed filters
      genre: 'All',
      duration: 'All'
    });
  }, [songs, searchQuery, selectedLanguage]);

  const handleStartLesson = (songId: string) => {
    navigate(`/lessons/${songId}`);
  };

  const clearAllFilters = () => {
    setSelectedLanguage(userPreferredLanguage);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedLanguage !== userPreferredLanguage || searchQuery !== '';

  // Separate languages into primary and others
  const primaryLanguage = languageOptions.find(lang => lang.value === userPreferredLanguage);
  const otherLanguages = languageOptions.filter(lang =>
    lang.value !== userPreferredLanguage && lang.value !== 'all'
  );
  const allLanguagesOption = languageOptions.find(lang => lang.value === 'all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2">
      <div className="container-center py-8 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Browse Lessons
          </h1>
          <p className="text-lg text-text-cream300 max-w-2xl mx-auto">
            Learn languages through music with our curated collection of songs
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-cream400 w-5 h-5" />
            <Input
              placeholder="Search songs, artists, or lyrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-base-dark3/60 border-accent-teal-500/30 focus:border-accent-teal-400 text-text-cream100 placeholder:text-text-cream400/60 text-lg"
            />
            <Music className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent-teal-400 w-5 h-5" />
          </div>

          {/* Desktop Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Desktop Language Filters - Modified */}
            <div className="hidden lg:flex flex-1 flex-col gap-4">
              {/* Filter Header with Clear All */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-cream200">Language Selection:</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-accent-teal-400 hover:text-accent-teal-300 text-xs h-auto p-1"
                  >
                    Reset to My Language
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Quick Browse Section */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-cream300 uppercase tracking-wide">Quick Browse</label>
                  <div className="flex gap-2">
                    {allLanguagesOption && (
                      <FilterChip
                        key={allLanguagesOption.value}
                        label={`${allLanguagesOption.flag} ${allLanguagesOption.label}`}
                        isActive={selectedLanguage === allLanguagesOption.value}
                        onClick={() => setSelectedLanguage(allLanguagesOption.value)}
                        className={selectedLanguage === allLanguagesOption.value ? 'ring-2 ring-accent-teal-400' : ''}
                      />
                    )}
                  </div>
                </div>

                {/* Primary Learning Language */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-text-cream300 uppercase tracking-wide">My Learning Language</label>
                    <span className="text-xs bg-accent-teal-500/20 text-accent-teal-400 px-2 py-1 rounded border border-accent-teal-500/30">
                      Primary
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* ONLY primary language here */}
                    {primaryLanguage && (
                      <FilterChip
                        key={primaryLanguage.value}
                        label={`${primaryLanguage.flag} ${primaryLanguage.label}`}
                        isActive={selectedLanguage === primaryLanguage.value}
                        onClick={() => setSelectedLanguage(primaryLanguage.value)}
                        className={selectedLanguage === primaryLanguage.value ? 'ring-2 ring-accent-teal-400' : ''}
                      />
                    )}
                  </div>
                </div>

                {/* Other Languages (Collapsible) */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowOtherLanguages(!showOtherLanguages)}
                    className="flex items-center gap-2 text-xs text-text-cream400 hover:text-text-cream200 transition-colors"
                  >
                    <span>Explore other languages</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showOtherLanguages ? 'rotate-180' : ''}`} />
                  </button>

                  {showOtherLanguages && (
                    <div className="flex flex-wrap gap-2 opacity-70">
                      {otherLanguages.map((lang) => (
                        <FilterChip
                          key={lang.value}
                          label={`${lang.flag} ${lang.label}`}
                          isActive={selectedLanguage === lang.value}
                          onClick={() => setSelectedLanguage(lang.value)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Context-aware nudging */}
              {selectedLanguage !== userPreferredLanguage && selectedLanguage !== 'all' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300">
                      💡 You're browsing {languageOptions.find(l => l.value === selectedLanguage)?.label} songs.
                    </span>
                    <button
                      onClick={() => setSelectedLanguage(userPreferredLanguage)}
                      className="text-yellow-400 hover:text-yellow-300 underline ml-2"
                    >
                      Return to {primaryLanguage?.label}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Filter Button - Keep existing but update text */}
            <div className="lg:hidden w-full flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="bg-base-dark3/60 border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {selectedLanguage === userPreferredLanguage
                  ? `${primaryLanguage?.flag} ${primaryLanguage?.label}`
                  : 'Language Filter'
                }
                {selectedLanguage !== userPreferredLanguage && selectedLanguage !== 'all' && (
                  <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-accent-teal-400 hover:text-accent-teal-300 text-sm"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* View Toggle and Results Count */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-cream400">
                {loading ? 'Loading...' : `Showing ${filteredSongs.length} lessons`}
              </div>
              <div className="flex items-center gap-1 bg-base-dark3/60 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-accent-teal-500 text-white' : 'text-text-cream400 hover:text-text-cream200'}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-accent-teal-500 text-white' : 'text-text-cream400 hover:text-text-cream200'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Filter Sheet - Update with hierarchical structure */}
        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetContent side="bottom" className="bg-base-dark2 border-accent-teal-500/20 max-h-[70vh]">
            <SheetHeader className="pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-text-cream100">Select Language</SheetTitle>
              </div>
            </SheetHeader>

            <div className="space-y-4 overflow-y-auto max-h-[40vh] pb-4">
              {/* Quick Browse Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Quick Browse</label>
                <div className="grid grid-cols-1 gap-3">
                  {allLanguagesOption && (
                    <FilterChip
                      key={allLanguagesOption.value}
                      label={`${allLanguagesOption.flag} ${allLanguagesOption.label}`}
                      isActive={selectedLanguage === allLanguagesOption.value}
                      onClick={() => setSelectedLanguage(allLanguagesOption.value)}
                      className="justify-center py-3"
                    />
                  )}
                </div>
              </div>

              {/* Primary Language Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-text-cream200">My Learning Language</label>
                  <span className="text-xs bg-accent-teal-500/20 text-accent-teal-400 px-2 py-1 rounded">
                    Primary
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {primaryLanguage && (
                    <FilterChip
                      key={primaryLanguage.value}
                      label={`${primaryLanguage.flag} ${primaryLanguage.label}`}
                      isActive={selectedLanguage === primaryLanguage.value}
                      onClick={() => setSelectedLanguage(primaryLanguage.value)}
                      className={`justify-center py-3 ${selectedLanguage === primaryLanguage.value ? 'ring-2 ring-accent-teal-400' : ''}`}
                    />
                  )}
                </div>
              </div>

              {/* Other Languages Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream300">Explore Other Languages</label>
                <div className="grid grid-cols-2 gap-3 opacity-70">
                  {otherLanguages.map((lang) => (
                    <FilterChip
                      key={lang.value}
                      label={`${lang.flag} ${lang.label}`}
                      isActive={selectedLanguage === lang.value}
                      onClick={() => setSelectedLanguage(lang.value)}
                      className="justify-center py-3 text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>

            <SheetFooter className="pt-4 border-t border-accent-teal-500/20">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex-1 bg-transparent border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 button-gradient-primary text-white"
                >
                  Apply
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Loading, Error, and Results sections remain the same */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="flex items-center gap-3 text-text-cream200">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading songs...</span>
            </div>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Songs</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="button-gradient-primary"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredSongs.length === 0 ? (
              <div className="text-center py-16">
                <Music className="w-16 h-16 text-text-cream400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-cream200 mb-2">No lessons found</h3>
                <p className="text-text-cream400 mb-4">
                  {songs.length === 0
                    ? "No songs available at the moment"
                    : "Try adjusting your search or language filter"
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearAllFilters} className="button-gradient-primary">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredSongs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SongCard
                      song={song}
                      progress={song.progress}
                      onStartLesson={handleStartLesson}
                      className={viewMode === 'list' ? 'flex flex-row items-center' : ''}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}