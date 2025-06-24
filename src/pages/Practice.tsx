import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Practice from '../components/ui/practice';
import { useSongData } from '../lib/hooks';

const PracticePage: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const [searchParams] = useSearchParams();
  const practiceType = searchParams.get('type') || undefined;
  
  const { data: songData, isLoading, error } = useSongData(songId);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-dark2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-teal-400 mx-auto mb-4"></div>
          <p className="text-text-cream200">Loading song data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-dark2">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load song data</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-accent-teal-500 hover:bg-accent-teal-400 text-base-dark2 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <Practice 
      songId={songId}
      songData={songData}
      practiceType={practiceType}
      onExit={() => window.history.back()}
    />
  );
};

export default PracticePage;