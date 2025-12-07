'use client';

export default function PortalCard({ title, description, icon: Icon, color, onClick, delay = 0 }) {
  const colorClasses = {
    purple: 'border-purple-500 hover:shadow-purple-200',
    blue: 'border-blue-500 hover:shadow-blue-200',
    green: 'border-green-500 hover:shadow-green-200',
    orange: 'border-orange-500 hover:shadow-orange-200',
  };

  const iconColorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  const textColorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent ${colorClasses[color]} animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${iconColorClasses[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className={`flex items-center font-semibold ${textColorClasses[color]}`}>
        Enter Portal →
      </div>
    </div>
  );
}
