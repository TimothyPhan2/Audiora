import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Music, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { SongCard } from '@/components/ui/song-card';
import { FilterChip } from '@/components/ui/filter-chip';
import { mockLessonsData, genreOptions, languageOptions, levelOptions, durationOptions } from '@/lib/mockLessonsData';

export function Lessons() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and search logic
  const filteredSongs = useMemo(() => {
    return mockLessonsData.filter(song => {
      const matchesSearch = searchQuery === '' || 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLanguage = selectedLanguage === 'all' || song.language === selectedLanguage;
      const matchesLevel = selectedLevel === 'All' || song.level === selectedLevel.toLowerCase();
      const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre.toLowerCase();
      
      const matchesDuration = selectedDuration === 'All' || (() => {
        const duration = song.duration;
        const minutes = parseInt(duration.split(':')[0]);
        switch (selectedDuration) {
          case 'Short (< 3 min)': return minutes < 3;
          case 'Medium (3-4 min)': return minutes >= 3 && minutes <= 4;
          case 'Long (> 4 min)': return minutes > 4;
          default: return true;
        }
      })();

      return matchesSearch && matchesLanguage && matchesLevel && matchesGenre && matchesDuration;
    });
  }, [searchQuery, selectedLanguage, selectedLevel, selectedGenre, selectedDuration]);

  const handleStartLesson = (songId: string) => {
    navigate(`/lessons/${songId}`);
  };

  const clearAllFilters = () => {
    setSelectedLanguage('all');
    setSelectedLevel('All');
    setSelectedGenre('All');
    setSelectedDuration('All');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedLanguage !== 'all' || selectedLevel !== 'All' || 
                          selectedGenre !== 'All' || selectedDuration !== 'All' || searchQuery !== '';

  const activeFilterCount = [
    selectedLanguage !== 'all',
    selectedLevel !== 'All',
    selectedGenre !== 'All',
    selectedDuration !== 'All'
  ].filter(Boolean).length;

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
            {/* Desktop Filters - Hidden on Mobile */}
            <div className="hidden lg:flex flex-1 flex-col gap-4">
              {/* Filter Header with Clear All */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-cream200">Filter by:</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-accent-teal-400 hover:text-accent-teal-300 text-xs h-auto p-1"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Organized Filter Groups */}
              <div className="space-y-3">
                {/* Language Filters */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-cream300 uppercase tracking-wide">Language</label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((lang) => (
                      <FilterChip
                        key={lang.value}
                        label={`${lang.flag} ${lang.label}`}
                        isActive={selectedLanguage === lang.value}
                        onClick={() => setSelectedLanguage(lang.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Level Filters */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-cream300 uppercase tracking-wide">Proficiency Level</label>
                  <div className="flex flex-wrap gap-2">
                    {levelOptions.map((level) => (
                      <FilterChip
                        key={level}
                        label={level}
                        isActive={selectedLevel === level}
                        onClick={() => setSelectedLevel(level)}
                      />
                    ))}
                  </div>
                </div>

                {/* Genre Filters */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-cream300 uppercase tracking-wide">Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {genreOptions.map((genre) => (
                      <FilterChip
                        key={genre}
                        label={genre}
                        isActive={selectedGenre === genre}
                        onClick={() => setSelectedGenre(genre)}
                      />
                    ))}
                  </div>
                </div>

                {/* Duration Filters */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-cream300 uppercase tracking-wide">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((duration) => (
                      <FilterChip
                        key={duration}
                        label={duration}
                        isActive={selectedDuration === duration}
                        onClick={() => setSelectedDuration(duration)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Button - Shown only on Mobile */}
            <div className="lg:hidden w-full flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="bg-base-dark3/60 border-accent-teal-500/30 text-text-cream200 hover:bg-accent-teal-500/10 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-accent-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
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
                  Clear All
                </Button>
              )}
            </div>

            {/* View Toggle and Results Count */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-cream400">
                Showing {filteredSongs.length} lessons
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

        {/* Mobile Filter Sheet */}
        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetContent side="bottom" className="bg-base-dark2 border-accent-teal-500/20 max-h-[80vh]">
            <SheetHeader className="pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-text-cream100">Filter Lessons</SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
                  className="text-text-cream400 hover:text-text-cream200 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </SheetHeader>
            
            <div className="space-y-6 overflow-y-auto max-h-[50vh] pb-4">
              {/* Language Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Language</label>
                <div className="grid grid-cols-2 gap-2">
                  {languageOptions.map((lang) => (
                    <FilterChip
                      key={lang.value}
                      label={`${lang.flag} ${lang.label}`}
                      isActive={selectedLanguage === lang.value}
                      onClick={() => setSelectedLanguage(lang.value)}
                      className="justify-center"
                    />
                  ))}
                </div>
              </div>

              {/* Level Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Proficiency Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {levelOptions.map((level) => (
                    <FilterChip
                      key={level}
                      label={level}
                      isActive={selectedLevel === level}
                      onClick={() => setSelectedLevel(level)}
                      className="justify-center"
                    />
                  ))}
                </div>
              </div>

              {/* Genre Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Genre</label>
                <div className="grid grid-cols-3 gap-2">
                  {genreOptions.map((genre) => (
                    <FilterChip
                      key={genre}
                      label={genre}
                      isActive={selectedGenre === genre}
                      onClick={() => setSelectedGenre(genre)}
                      className="justify-center text-xs"
                    />
                  ))}
                </div>
              </div>

              {/* Duration Filters */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-cream200">Duration</label>
                <div className="grid grid-cols-1 gap-2">
                  {durationOptions.map((duration) => (
                    <FilterChip
                      key={duration}
                      label={duration}
                      isActive={selectedDuration === duration}
                      onClick={() => setSelectedDuration(duration)}
                      className="justify-center"
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
                  Clear All
                </Button>
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 button-gradient-primary text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredSongs.length === 0 ? (
            <div className="text-center py-16">
              <Music className="w-16 h-16 text-text-cream400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-cream200 mb-2">No lessons found</h3>
              <p className="text-text-cream400 mb-4">Try adjusting your search or filters</p>
              <Button onClick={clearAllFilters} className="button-gradient-primary">
                Clear Filters
              </Button>
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
      </div>
    </div>
  );
}