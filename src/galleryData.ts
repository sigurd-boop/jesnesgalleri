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

const placeholders: Russebuss[] = [
  {
    name: "prosjekt1",
    cover: "https://picsum.photos/id/1015/600/400",
    images: [
      "https://picsum.photos/id/1016/400/300",
      "https://picsum.photos/id/1018/400/300",
      "https://picsum.photos/id/1020/400/300",
    ],
  },
  {
    name: "prosjekt2",
    cover: "https://picsum.photos/id/1021/600/400",
    images: [
      "https://picsum.photos/id/1022/400/300",
      "https://picsum.photos/id/1023/400/300",
      "https://picsum.photos/id/1024/400/300",
    ],
  },
];

gallerier.push(...placeholders);

export default gallerier;
