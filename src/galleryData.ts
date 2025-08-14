// Grab all cover images
interface ImageModule {
  default: string;
}

const coverFiles = import.meta.glob<ImageModule>("./images/*/cover.{jpg,png,webp}", {
  eager: true,
});
// Grab all images
const allImages = import.meta.glob<ImageModule>("./images/*/*.{jpg,png,webp}", {
  eager: true,
});

interface Russebuss {
  name: string;
  cover: string;
  images: string[];
}

const gallerier: Russebuss[] = [];

for (const path in coverFiles) {
  const parts = path.split("/");
  const busName = parts[parts.length - 2]; // Folder name
  const cover = coverFiles[path].default;

  // Get all other images for this bus
  const relatedImages = Object.keys(allImages)
    .filter(
      (imgPath) => imgPath.includes(busName) && !imgPath.includes("cover")
    )
    .map((imgPath) => allImages[imgPath].default);

  gallerier.push({
    name: busName,
    cover,
    images: relatedImages,
  });
}

export default gallerier;
