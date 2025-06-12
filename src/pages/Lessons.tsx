import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [showFilters, setShowFilters] = useState(false);

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

        {/* Search and Filters */}
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

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Filter Chips - Mobile Scrollable */}
            <div className="w-full lg:flex-1">
              <div className="flex items-center gap-2 mb-4 lg:mb-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-text-cream300 hover:text-text-cream100"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-accent-teal-400 hover:text-accent-teal-300 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className={`space-y-3 lg:space-y-0 lg:flex lg:flex-wrap lg:gap-3 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
                {/* Language Filter */}
                <div className="flex gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {languageOptions.map((lang) => (
                    <FilterChip
                      key={lang.value}
                      label={`${lang.flag} ${lang.label}`}
                      isActive={selectedLanguage === lang.value}
                      onClick={() => setSelectedLanguage(lang.value)}
                    />
                  ))}
                </div>

                {/* Level Filter */}
                <div className="flex gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {levelOptions.map((level) => (
                    <FilterChip
                      key={level}
                      label={level}
                      isActive={selectedLevel === level}
                      onClick={() => setSelectedLevel(level)}
                    />
                  ))}
                </div>

                {/* Genre Filter */}
                <div className="flex gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {genreOptions.map((genre) => (
                    <FilterChip
                      key={genre}
                      label={genre}
                      isActive={selectedGenre === genre}
                      onClick={() => setSelectedGenre(genre)}
                    />
                  ))}
                </div>

                {/* Duration Filter */}
                <div className="flex gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
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