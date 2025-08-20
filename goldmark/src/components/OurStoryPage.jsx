import {
  Heart,
  Award,
  Leaf,
  Sparkles,
  Users,
  Globe,
  Star,
  Shield,
} from "lucide-react";

const OurStoryPage = () => {
  const values = [
    {
      title: "Our Mission",
      description:
        "We love jewelry and we love our planet. We combined our passions to bring you sustainable, quality fine jewelry at the best cost possible.",
      content:
        "Our designed partnership was forged out of a shared love for shaping high quality materials into unique, unexpected forms. Our pieces express who we are, where we've been and where we hope to go. Wear them to embark upon your own journey.",
      icon: Heart,
      image:
        "https://static.wixstatic.com/media/84770f_39b9fe6fdd384a7b8c42da18212e96bf~mv2.jpeg/v1/fill/w_1332,h_416,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/asset%20MJ%203.jpeg",
      color: "from-rose-400 to-pink-600",
    },
    {
      title: "Fine Quality",
      description:
        "We work with the world's best jewelers to create fine jewelry at a fair price.",
      content:
        "Every piece in our collection is crafted with meticulous attention to detail, using only the finest materials and time-honored techniques. Our commitment to quality ensures that each piece of jewelry is not just beautiful, but built to last a lifetime.",
      icon: Award,
      image:
        "https://static.wixstatic.com/media/84770f_b92f0eff9e82437992a2aadaa9e726af~mv2.jpeg/v1/fill/w_1332,h_416,fp_0.62_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/asset%20MJ%204.jpeg",
      color: "from-amber-400 to-orange-600",
    },
    {
      title: "Sustainability",
      description:
        "To create true sustainability we trace the impact of our pieces from the origin of the materials all the way to their final destination.",
      content:
        "We believe that beautiful jewelry shouldn't come at the cost of our planet. From responsibly sourced materials to ethical manufacturing practices, we're committed to creating pieces that you can feel good about wearing.",
      icon: Leaf,
      image:
        "https://static.wixstatic.com/media/84770f_0bdd951bc8cb43568ea9f00bcf30f0d5~mv2.jpeg/v1/fill/w_1332,h_416,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/asset%20MJ%205.jpeg",
      color: "from-green-400 to-emerald-600",
    },
  ];

  const stats = [
    { number: "15+", label: "Years of Experience", icon: Star },
    { number: "100%", label: "Handcrafted", icon: Users },
    { number: "50+", label: "Countries Worldwide", icon: Globe },
    { number: "∞", label: "Lifetime Warranty", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <Sparkles className="text-amber-600 mr-4" size={40} />
              <h1 className="text-5xl lg:text-7xl font-serif text-gray-900">
                We Are Goldmark
              </h1>
              <Sparkles className="text-amber-600 ml-4" size={40} />
            </div>
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-12">
              Our designed partnership was forged out of a shared love for
              shaping high quality materials into unique, unexpected forms.
            </p>
            <div className="relative">
              <img
                src="https://static.wixstatic.com/media/c837a6_06a420dc2b7f47a389911449c2f062ac~mv2.jpg/v1/fill/w_822,h_722,fp_0.49_0.40,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/wixagency_Two_models_wearing_gold_necklaces_and_earrings_smilin_59a629e2-8de1-4cef-89a6-a4.jpg"
                alt="Goldmark jewelry craftsmanship"
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Story */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div>
                <h2 className="text-4xl font-serif text-gray-900 mb-6">
                  Our Journey
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our pieces express who we are, where we've been and where we
                  hope to go. Each design tells a story, capturing moments of
                  beauty and transforming them into timeless treasures.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Wear them to embark upon your own journey. Let our jewelry be
                  the companion to your life's most precious moments, from
                  everyday elegance to once-in-a-lifetime celebrations.
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://ext.same-assets.com/1238728203/542897615.jpeg"
                  alt="Jewelry design process"
                  className="w-full rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
                  <div className="flex items-center space-x-3">
                    <Heart className="text-amber-600" size={24} />
                    <span className="font-medium text-gray-900">
                      Crafted with Love
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything we do is guided by our core values of quality,
              sustainability, and craftsmanship.
            </p>
          </div>

          <div className="space-y-20">
            {values.map((value, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="lg:w-1/2">
                  <div className="relative group">
                    <img
                      src={value.image}
                      alt={value.title}
                      className="w-full h-96 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    />
                    <div
                      className={`absolute top-6 left-6 p-3 rounded-full bg-gradient-to-r ${value.color} shadow-lg`}
                    >
                      <value.icon className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2 space-y-6">
                  <div>
                    <h3 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-xl text-amber-700 font-medium mb-6">
                      {value.description}
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {value.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-gray-900 mb-6">
              Our Commitment to Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Numbers that reflect our dedication to quality and our customers
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="text-white" size={32} />
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="py-20 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-8">
              Our Philosophy
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-12">
              We believe that jewelry is more than just an accessory—it's a form
              of self-expression, a way to celebrate life's precious moments,
              and a connection to the artisan traditions that have shaped our
              craft for generations.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Passion
                </h3>
                <p className="text-gray-600">
                  Every piece is created with genuine love and dedication to the
                  craft.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Excellence
                </h3>
                <p className="text-gray-600">
                  We never compromise on quality, ensuring each piece meets our
                  highest standards.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Responsibility
                </h3>
                <p className="text-gray-600">
                  Our commitment to sustainability guides every decision we
                  make.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-serif mb-6">
            Begin Your Journey
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Discover our collections and find the perfect piece that tells your
            story. Each jewelry piece is waiting to become part of your unique
            journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/categories"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-full font-medium hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>Explore Collections</span>
              <Sparkles size={20} />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              <span>Get in Touch</span>
              <Heart size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStoryPage;
