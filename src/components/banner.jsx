import { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// You can replace these with your own images
const slides = [
  {
    id: 1,
    image:
      "https://tse4.mm.bing.net/th/id/OIP.bejxI8d5ZWP9yaRqgotXbgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
    title: "Expert Market Analysis",
  },
  {
    id: 2,
    image:
      "https://a.espncdn.com/combiner/i?img=/photo/2024/0225/r1296029_1296x729_16-9.jpg",
    title: "Winning Sports Betting Picks",
  },
  {
    id: 3,
    image:
      "https://tse2.mm.bing.net/th/id/OIP.yMH9xnk8rKm5fhmZcbd59gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
    title: "Your Path to Financial Success",
  },
];

export const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  // Slider settings
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    beforeChange: (current, next) => setCurrentIndex(next),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          dots: true,
          customPaging: (i) => (
            <div
              className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                currentIndex === i ? "bg-white" : "bg-white/40"
              }`}
            />
          ),
        },
      },
    ],
  };

  // Manual slide navigation
  const goToSlide = (index) => {
    sliderRef.current.slickGoTo(index);
  };

  return (
    <div className="relative">
      <Slider ref={sliderRef} {...settings}>
        {slides.map((slide) => (
          <div key={slide.id} className="relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-44 md:h-56 lg:h-64 rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center p-4 md:p-6 lg:p-8 bg-black/20">
              <h2 className="font-clash font-semibold text-white text-lg md:text-xl lg:text-2xl w-1/2">
                {slide.title}
              </h2>
            </div>
          </div>
        ))}
      </Slider>

      {/* Custom pagination for desktop */}
      <div className="hidden md:flex absolute bottom-4 left-1/2 transform -translate-x-1/2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full mx-1 transition-colors ${
              currentIndex === index ? "bg-white" : "bg-white/40"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
