import { ChevronRight } from "lucide-react";

const InstagramGallery = () => {
  const instagramImages = [
    "https://ext.same-assets.com/1238728203/1917970084.jpeg",
    "https://ext.same-assets.com/1238728203/1912352774.jpeg",
    "https://ext.same-assets.com/1238728203/467511712.jpeg",
    "https://ext.same-assets.com/1238728203/2056056175.jpeg",
    "https://ext.same-assets.com/1238728203/804688487.jpeg",
  ];

  return (
    <section className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Follow us on Instagram
          </h2>
          <p className="text-gray-300">@goldmark</p>
        </div>

        {/* Instagram Grid */}
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {instagramImages.map((image, index) => (
              <div
                key={image}
                className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 group cursor-pointer"
              >
                <img
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Scroll Arrow */}
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all duration-300">
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        {/* View More Link */}
        <div className="text-center mt-8">
          <a
            href="https://instagram.com/goldmark"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-white hover:text-amber-300 transition-colors"
          >
            <span className="mr-2">View more on Instagram</span>
            <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;
