const BestSellers = () => {
  const products = [
    {
      id: 1,
      name: "Pearl Stud Earrings",
      price: "$125.00",
      image: "https://ext.same-assets.com/1238728203/654226175.jpeg",
      hoverImage: "https://ext.same-assets.com/1238728203/3361564994.jpeg"
    },
    {
      id: 2,
      name: "Wave Bangle",
      price: "$115.00",
      image: "https://ext.same-assets.com/1238728203/542897615.jpeg",
      hoverImage: "https://ext.same-assets.com/1238728203/2086380595.jpeg"
    },
    {
      id: 3,
      name: "Collar Necklace",
      price: "$165.00",
      image: "https://ext.same-assets.com/1238728203/3957704093.jpeg",
      hoverImage: "https://ext.same-assets.com/1238728203/179942575.jpeg"
    },
    {
      id: 4,
      name: "Golden Loop Earrings",
      price: "$100.00",
      image: "https://ext.same-assets.com/1238728203/3478848801.jpeg",
      hoverImage: "https://ext.same-assets.com/1238728203/1833856914.jpeg"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900">Best Sellers</h2>
          <button className="text-gray-700 hover:text-gray-900 transition-colors underline text-sm">
            Shop All
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              {/* Product Image */}
              <div className="relative overflow-hidden mb-4 aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                />
                <img
                  src={product.hoverImage}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </div>

              {/* Product Info */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600">
                  <span className="text-sm">Price</span>
                  <span className="ml-1 font-medium">{product.price}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
