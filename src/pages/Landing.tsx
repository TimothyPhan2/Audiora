import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { AILanguageLearningHero } from '@/components/ui/ai-language-learning-hero';
import { Music, Brain, BookMarked, ListChecks, GraduationCap, Loader2 } from 'lucide-react';
import { landingFeatures, learningSteps } from '@/lib/mockData';
import { SongCard } from '@/components/ui/song-card';
import { getSongs, SongWithExtras } from '@/lib/api';

export function Landing() {
  const navigate = useNavigate();
  // Feature sections with IntersectionObserver for animations
  const [stepsRef, stepsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [songSectionRef, songSectionInView] = useInView({ threshold: 0.2, triggerOnce: true });
  // State for songs
  const [songs, setSongs] = useState<SongWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch songs from database
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        const songsData = await getSongs();
        setSongs(songsData.slice(0, 3)); // Only take first 3 songs
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleStartLesson = (songId: string) => {
    navigate(`/lessons/${songId}`);
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <AILanguageLearningHero />

      {/* How It Works Section */}
      <section className="py-20 bg-base-dark2">
        <div className="container-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-accent-teal-400 to-accent-persian-500 bg-clip-text text-transparent">
              How Audiora Works
            </h2>
            <p className="text-lg text-text-cream300 max-w-2xl mx-auto">
              Three simple steps to start learning your target language through music
            </p>
          </div>

          <div
            ref={stepsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {learningSteps.map((step, index) => {
              const IconComponent = {
                'Music': Music,
                'Brain': Brain,
                'GraduationCap': GraduationCap
              }[step.icon] || Music;

              return (
                <div key={step.id}
                  className={`card transform transition-all duration-700 delay-${index * 150} ${stepsInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                >
                  <div className="card-gradient backdrop-blur-sm p-6 rounded-xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-accent-teal-500/20 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="w-8 h-8 text-accent-teal-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-text-cream100">{step.title}</h3>
                    <p className="text-text-cream300">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 bg-base-dark2">
        <div className="container-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-accent-teal-400 to-accent-persian-500 bg-clip-text text-transparent">
              Powerful Features for Effective Learning
            </h2>
            <p className="text-lg text-text-cream300 max-w-2xl mx-auto">
              Everything you need to master a new language through music
            </p>
          </div>

          <div
            ref={featuresRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {landingFeatures.map((feature, index) => {
              const IconComponent = {
                'Music': Music,
                'Brain': Brain,
                'BookMarked': BookMarked,
                'ListChecks': ListChecks
              }[feature.icon] || Music;

              return (
                <div
                  key={feature.id}
                  className={`card transform transition-all duration-700 delay-${index * 150} ${featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                >
                  <div className="card-gradient backdrop-blur-sm p-6 rounded-xl flex items-start">
                    <div className="w-12 h-12 bg-accent-teal-500/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-accent-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-text-cream100">{feature.title}</h3>
                      <p className="text-text-cream300">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Song Discovery Section */}
      <section
        ref={songSectionRef}
        className="py-20 bg-base-dark2"
      >
        <div className="container-center">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-accent-teal-400 to-accent-persian-500 bg-clip-text text-transparent">
              Discover Songs in Your Target Language
            </h2>
            <p className="text-lg text-text-cream300 max-w-2xl mx-auto">
              Browse our extensive library of songs across different languages, genres, and difficulty levels.
            </p>
          </div>


          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-text-cream200">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading songs...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
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
            </div>
          )}

          {/* Songs Grid */}
          {!loading && !error && songs.length > 0 && (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${songSectionInView ? 'opacity-100' : 'opacity-0'}`}
            >
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`transform transition-all duration-700 delay-${index * 150} ${songSectionInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                >
                  <SongCard
                    song={song}
                    progress={song.progress}
                    onStartLesson={handleStartLesson}
                  />
                </div>
              ))}
            </div>
          )}

          {/* No Songs State */}
          {!loading && !error && songs.length === 0 && (
            <div className="text-center py-16">
              <Music className="w-16 h-16 text-text-cream400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-cream200 mb-2">No songs available</h3>
              <p className="text-text-cream400">
                Songs will appear here once they are added to the database.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/signup">
              <Button className="button-gradient-primary text-white px-8">
                Explore All Songs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient text-white relative overflow-hidden">
        <div className="container-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Learning Languages Through Music Today
          </h2>
          <p className="text-lg text-text-cream200 max-w-2xl mx-auto mb-8">
            Experience the future of language learning with our AI-powered music platform.
          </p>
          <Link to="/signup">
            <Button className="button-gradient-primary text-white font-medium px-8 py-6 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}