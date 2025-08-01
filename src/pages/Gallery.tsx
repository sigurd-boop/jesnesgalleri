import { useState } from "react";
import gallerier from "../galleryData";
import MasonryGallery from "../components/MasonryGallery";
import IconCircle from "../components/IconCircle";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="gallery" className="bg-black p-6 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Utforsk</h1>

      <div className="grid gap-16">
        {gallerier.map((bus, index) => (
          <div key={index} className="bg-white text-black rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-center capitalize">
              {bus.name}
            </h2>
            <MasonryGallery
              images={[bus.cover, ...bus.images]}
              onSelect={(img) => setSelectedImage(img)}
            />
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

      <div className="mt-16 flex justify-center">
        <IconCircle />
      </div>
    </section>
  );
}
