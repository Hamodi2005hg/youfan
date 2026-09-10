import React from 'react';

export const StatsSection: React.FC = () => {
  const stats = [
    { label: 'Total Users', value: '2,907,974' },
    { label: 'Total Publications', value: '5,373,647' },
    { label: 'Partners Earns', value: '$5,000,000+' },
    { label: 'YoStar', value: '100%' },
  ];

  return (
    <section className="w-full max-w-[1280px] mx-auto px-5 md:px-10 mb-24 md:mb-32">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {stats.map((stat, i) => (
          <div key={i} className="border-l-4 border-[#CDD2E9] pl-5 py-1">
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-black leading-none mb-3">
              {stat.value}
            </p>
            <p className="text-sm md:text-lg font-medium text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
