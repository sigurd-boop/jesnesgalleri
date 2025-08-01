interface MasonryGalleryProps {
  images: string[];
  onSelect?: (src: string) => void;
}

export default function MasonryGallery({ images, onSelect }: MasonryGalleryProps) {
  return (
    <div className="columns-2 sm:columns-3 gap-4 [column-fill:_balance]">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="gallery"
          className="w-full mb-4 rounded-lg hover:opacity-80 transition cursor-pointer"
          onClick={() => onSelect?.(src)}
        />
      ))}
    </div>
  );
}
