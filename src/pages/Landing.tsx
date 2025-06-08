import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { AILanguageLearningHero } from '@/components/ui/ai-language-learning-hero';
import { Music, Brain, BookMarked, ListChecks, GraduationCap } from 'lucide-react';
import { landingFeatures, learningSteps } from '@/lib/mockData';

export function Landing() {
  // Feature sections with IntersectionObserver for animations
  const [stepsRef, stepsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [songSectionRef, songSectionInView] = useInView({ threshold: 0.2, triggerOnce: true });
  
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
                  className={`card transform transition-all duration-700 delay-${index * 150} ${
                    stepsInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
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
                  className={`card transform transition-all duration-700 delay-${index * 150} ${
                    featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
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
          
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${songSectionInView ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Song Cards - These would be dynamic in the real app */}
            <div className="card-gradient backdrop-blur-sm rounded-xl group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden mb-4">
                <img 
                  src="https://images.pexels.com/photos/1001850/pexels-photo-1001850.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Despacito by Luis Fonsi" 
                  className="w-full h-48 object-cover rounded-md transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-white text-sm">Spanish • Beginner</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 text-white">Despacito</h3>
                <p className="text-text-cream300 mb-3">Luis Fonsi</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-cream400">Pop</span>
                <Button variant="ghost" size="sm" className="text-accent-teal-400 hover:text-accent-teal-300">
                  Learn Now
                </Button>
              </div>
              </div>
            </div>
            
            <div className="card-gradient backdrop-blur-sm rounded-xl group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden mb-4">
                <img 
                  src="https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="La Vie En Rose by Edith Piaf" 
                  className="w-full h-48 object-cover rounded-md transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-white text-sm">French • Intermediate</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 text-white">La Vie En Rose</h3>
                <p className="text-text-cream300 mb-3">Edith Piaf</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-cream400">Classic</span>
                <Button variant="ghost" size="sm" className="text-accent-teal-400 hover:text-accent-teal-300">
                  Learn Now
                </Button>
              </div>
              </div>
            </div>
            
            <div className="card-gradient backdrop-blur-sm rounded-xl group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden mb-4">
                <img 
                  src="https://images.pexels.com/photos/4087996/pexels-photo-4087996.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Je Veux by Zaz" 
                  className="w-full h-48 object-cover rounded-md transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <p className="text-white text-sm">French • Advanced</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 text-white">Je Veux</h3>
                <p className="text-text-cream300 mb-3">Zaz</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-cream400">Jazz</span>
                <Button variant="ghost" size="sm" className="text-accent-teal-400 hover:text-accent-teal-300">
                  Learn Now
                </Button>
              </div>
              </div>
            </div>
          </div>
          
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