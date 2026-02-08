export default function StoreBanner() {
  return (
    <div className="store-banner relative w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://i.imgur.com/8pXvn3I.png)' }}
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4">
        <div className="text-center max-w-[1200px] mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg">
            Kelani Cosmetics
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/95 mb-2 md:mb-3 drop-shadow-md">
            Tu tienda integral de productos de belleza, cuidado del cabello y la piel
          </p>
          <p className="text-base md:text-lg lg:text-xl text-white/90 drop-shadow-md">
            Pelucas, cuidado capilar, aceites, cremas, champús y productos de estilizado
          </p>
        </div>
      </div>
    </div>
  );
}
