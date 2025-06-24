import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Practice from '@/components/ui/practice';
import { useSongData, useUserProfile } from '@/lib/hooks';

export function PracticePage () {
  const { songId } = useParams<{ songId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const practiceType = searchParams.get('type') || undefined;
  
  const { data: songData, isLoading: songLoading, error: songError } = useSongData(songId);
  const { profile, isLoading: profileLoading } = useUserProfile();
  
  const isLoading = songLoading || profileLoading;

  // Handle navigation back to song detail or lessons
  const handleExit = () => {
    if (songId) {
      navigate(`/lessons/${songId}`);
    } else {
      navigate('/lessons');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-teal-400 mx-auto mb-4"></div>
          <p className="text-text-cream200 text-lg">Loading practice session...</p>
          <p className="text-text-cream400 text-sm mt-2">Preparing your personalized content</p>
        </div>
      </div>
    );
  }

  // Error state
  if (songError || !songData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-6">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-cream100 mb-2">
              Unable to Load Practice Session
            </h2>
            <p className="text-text-cream300 mb-4">
              {songError || 'The requested song could not be found.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleExit}
                className="w-full button-gradient-primary text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lessons
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full border-accent-teal-500/30 text-accent-teal-400 hover:bg-accent-teal-500/10"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No song ID provided
  if (!songId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-dark2 via-base-dark3 to-base-dark2 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-accent-teal-500/20 border border-accent-teal-500/30 rounded-xl p-6">
            <AlertCircle className="w-12 h-12 text-accent-teal-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-cream100 mb-2">
              No Song Selected
            </h2>
            <p className="text-text-cream300 mb-4">
              Please select a song from the lessons page to start practicing.
            </p>
            <Button 
              onClick={() => navigate('/lessons')}
              className="w-full button-gradient-primary text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Songs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the practice component
  return (
    <Practice 
      songId={songId}
      songData={songData}
      practiceType={practiceType}
      userProfile={profile}
      onExit={handleExit}
    />
  );
};

