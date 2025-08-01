// Grab all cover images
const coverFiles = import.meta.glob("./images/*/cover.{jpg,png,webp}", {
  eager: true,
});
// Grab all images
const allImages = import.meta.glob("./images/*/*.{jpg,png,webp}", {
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
  const cover = (coverFiles[path] as { default: string }).default;

  // Get all other images for this bus
  const relatedImages = Object.keys(allImages)
    .filter(
      (imgPath) => imgPath.includes(busName) && !imgPath.includes("cover")
    )
    .map((imgPath) => (allImages[imgPath] as { default: string }).default);

  gallerier.push({
    name: busName,
    cover,
    images: relatedImages,
  });
}

export default gallerier;
