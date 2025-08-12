import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://i.pinimg.com/1200x/7c/e4/6c/7ce46c91f3702761a0539c415bea0133.jpg')`,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light mb-8 tracking-wide text-white">
          Elegance & Luxury
        </h1>

        {/* Shop All Button */}
        <div className="absolute bottom-20 right-20 hidden lg:block">
          <button className="group bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 rounded-full p-6 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Shop All</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </button>
        </div>

        {/* Mobile Shop All Button */}
        <div className="lg:hidden mt-8">
          <button className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 px-8 py-3 rounded-full transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Shop All</span>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
