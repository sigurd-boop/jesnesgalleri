import { useState } from "react";
import gallerier from "../galleryData";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="gallery" className="bg-black p-6 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Utforsk</h1>

      <div className="grid gap-10">
        {gallerier.map((bus, index) => (
          <div
            key={index}
            className="bg-white text-black rounded-xl shadow-lg p-4"
          >
            <h2 className="text-xl font-bold mb-4 capitalize">{bus.name}</h2>

            {/* Big Cover */}
            <div className="overflow-hidden rounded-lg mb-4">
              <img
                src={bus.cover}
                alt={bus.name}
                className="w-full max-h-[300px] object-cover rounded-lg shadow-md mb-4"
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-2">
              {bus.images.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-md">
                  <img
                    src={img}
                    alt={`${bus.name}-${i}`}
                    className="cursor-pointer hover:scale-110 transition-transform duration-300"
                    onClick={() => setSelectedImage(img)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-lightbox-fade"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="preview"
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-xl"
          />
        </div>
      )}
    </section>
  );
}
