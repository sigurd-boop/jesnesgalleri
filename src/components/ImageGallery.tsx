interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {images.map((src, i) => (
        <div
          key={i}
          className="rounded-xl shadow-lg overflow-hidden bg-white hover:scale-105 hover:shadow-2xl transition-all duration-300"
        >
          <img
            src={src}
            alt={`Bilde ${i + 1}`}
            className="w-full h-auto object-cover"
          />
        </div>
      ))}
    </div>
  );
}
