const Categories = () => {
  const categories = [
    {
      id: 1,
      name: "Rings",
      image: "https://ext.same-assets.com/1238728203/2442032724.jpeg",
      link: "#rings",
    },
    {
      id: 2,
      name: "Earrings",
      image: "https://ext.same-assets.com/1238728203/3707858008.jpeg",
      link: "#earrings",
    },
    {
      id: 3,
      name: "Necklaces",
      image: "https://ext.same-assets.com/1238728203/2793049852.jpeg",
      link: "#necklaces",
    },
    {
      id: 4,
      name: "Bracelets",
      image: "https://ext.same-assets.com/1238728203/1863269298.jpeg",
      link: "#bracelets",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="space-y-16">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`flex items-center ${
                index % 2 === 1 ? "flex-row-reverse" : ""
              }`}
            >
              {/* Category Name */}
              <div className="w-full md:w-1/3 px-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 hover:text-amber-700 transition-colors cursor-pointer">
                  <a href={category.link}>{category.name}</a>
                </h2>
              </div>

              {/* Category Image */}
              <div className="w-full md:w-2/3 px-4">
                <div className="relative overflow-hidden group cursor-pointer">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-64 md:h-96 lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
