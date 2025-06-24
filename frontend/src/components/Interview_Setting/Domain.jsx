import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';


const domains = [
  {
    id: 1,
    name: 'Software Engineering',
    description: 'Master coding interviews and technical challenges',
    image: '/domain/software.jpg',
    skills: ['Algorithms', 'System Design'],
  },
  {
    id: 2,
    name: 'Data Science',
    description: 'Excel in data analysis and machine learning interviews',
    image: '/domain/data.jpg',
    skills: ['ML', 'Statistics', 'Python'],
  },
  {
    id: 3,
    name: 'Product Management',
    description: 'Develop strategic thinking and product insights',
    image: '/domain/product.jpg',
    skills: ['Strategy', 'UX', 'Business'],
  },
  {
    id: 4,
    name: 'UX Design',
    description: 'Create compelling user experience design solutions',
    image: '/domain/designer.jpg',
    skills: ['UI/UX', 'Prototyping',],
  }
];

const DomainCard = ({ domain }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/interview-setting', { state: { domain: domain.name } });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
    >
      <div className="relative overflow-hidden rounded-xl bg-darkblue/40">
        
        
        
        {/* Card Content */}
        <div className="relative z-10 flex flex-col">
          {/* Image */}
          <div className="h-48 overflow-hidden">
            <img 
              src={domain.image}
              alt={domain.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Text Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white">{domain.name}</h3>
              <ChevronRight 
                className="text-white transform group-hover:translate-x-1 transition-transform" 
                size={22} 
              />
            </div>
            
            <p className="text-zinc-400 mb-4">{domain.description}</p>
            
            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2">
              {domain.skills.map((skill) => (
                <span 
                  key={skill}
                  className="px-3 py-1 bg-darkblue/70 text-white text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

const Domain = () => {
  return (
    <div className="w-full max-w-3xl mx-auto p-8">
      <div className="text-center my-12">
        <h2 className="text-2xl text-white mb-3">Choose Your Domain</h2>
        <p className="text-gray-400">Select a domain to begin your interview preparation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
    </div>
  );
};

export default Domain;
