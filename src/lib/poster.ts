export function posterThumb(src: string) {
  return src
    .replace("/images/posters/", "/images/posters/thumbs/")
    .replace(/\.png$/, ".webp");
}
