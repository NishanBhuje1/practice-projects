import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Award, Heart, Star } from "lucide-react";
import { products } from "../data/products";

const CategoriesPage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: "Rings",
      slug: "rings",
      description:
        "Elegant rings for every occasion, from everyday elegance to special celebrations",
      image: "https://ext.same-assets.com/1238728203/2442032724.jpeg",
      productCount: products.filter((p) => p.category === "rings").length,
      featured: true,
      highlights: ["Wedding Bands", "Engagement Rings", "Statement Rings"],
      color: "from-amber-400 to-orange-600",
    },
    {
      id: 2,
      name: "Earrings",
      slug: "earrings",
      description:
        "Stunning earrings to frame your face with timeless beauty and modern style",
      image: "https://ext.same-assets.com/1238728203/3707858008.jpeg",
      productCount: products.filter((p) => p.category === "earrings").length,
      featured: false,
      highlights: ["Studs", "Hoops", "Drop Earrings"],
      color: "from-rose-400 to-pink-600",
    },
    {
      id: 3,
      name: "Necklaces",
      slug: "necklaces",
      description:
        "Beautiful necklaces that make a statement and complete any ensemble",
      image: "https://ext.same-assets.com/1238728203/2793049852.jpeg",
      productCount: products.filter((p) => p.category === "necklaces").length,
      featured: true,
      highlights: ["Pendants", "Chains", "Statement Pieces"],
      color: "from-emerald-400 to-teal-600",
    },
    {
      id: 4,
      name: "Bracelets",
      slug: "bracelets",
      description:
        "Delicate and bold bracelets to adorn your wrists with sophistication",
      image: "https://ext.same-assets.com/1238728203/1863269298.jpeg",
      productCount: products.filter((p) => p.category === "bracelets").length,
      featured: false,
      highlights: ["Tennis Bracelets", "Bangles", "Chain Bracelets"],
      color: "from-purple-400 to-indigo-600",
    },
  ];

  const handleCategoryClick = (categorySlug) => {
    navigate(`/products?category=${categorySlug}`);
  };

  const handleViewAll = () => {
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="text-amber-600 mr-3" size={32} />
              <h1 className="text-5xl lg:text-6xl font-serif text-gray-900">
                Our Categories
              </h1>
              <Sparkles className="text-amber-600 ml-3" size={32} />
            </div>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Discover our carefully curated collection of fine jewelry, each
              piece crafted with passion and designed to celebrate life's
              special moments.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Award className="mr-2" size={16} />
                Premium Quality
              </div>
              <div className="flex items-center">
                <Heart className="mr-2" size={16} />
                Handcrafted
              </div>
              <div className="flex items-center">
                <Star className="mr-2" size={16} />
                Lifetime Warranty
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`relative group cursor-pointer transform hover:-translate-y-2 transition-all duration-500 ${
                category.featured ? "lg:col-span-2" : ""
              }`}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500">
                {/* Image Section */}
                <div
                  className={`relative overflow-hidden ${
                    category.featured ? "h-64 lg:h-80" : "h-64"
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Featured Badge */}
                  {category.featured && (
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${category.color}`}
                      >
                        Featured Collection
                      </span>
                    </div>
                  )}

                  {/* Product Count */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-800 rounded-full">
                      {category.productCount} Products
                    </span>
                  </div>

                  {/* Hover Content */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <div className="flex items-center space-x-2 text-sm font-medium mb-1">
                          {category.highlights.map((highlight, idx) => (
                            <span
                              key={idx}
                              className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs"
                            >
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="text-white" size={20} />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`font-serif text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${
                        category.color
                      } group-hover:bg-clip-text transition-all duration-300 ${
                        category.featured ? "text-4xl lg:text-5xl" : "text-3xl"
                      }`}
                    >
                      {category.name}
                    </h2>
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${category.color} opacity-20 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}
                    >
                      <ArrowRight className="text-white" size={20} />
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-4">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {category.highlights.slice(0, 3).map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-amber-600 group-hover:text-amber-700">
                      Explore Collection →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="text-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-12">
          <h3 className="text-3xl font-serif text-gray-900 mb-4">
            Can't Decide? Browse Everything
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our complete collection of fine jewelry. From classic pieces
            to contemporary designs, find the perfect piece that speaks to your
            style.
          </p>
          <button
            onClick={handleViewAll}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-full font-medium hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span>View All Products</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              {
                number: products.length,
                label: "Total Products",
                icon: Sparkles,
              },
              { number: "4", label: "Categories", icon: Award },
              { number: "100%", label: "Handcrafted", icon: Heart },
              { number: "∞", label: "Lifetime Warranty", icon: Star },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-center mb-3">
                  <stat.icon
                    className="text-amber-600 group-hover:text-amber-700 transition-colors"
                    size={32}
                  />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
