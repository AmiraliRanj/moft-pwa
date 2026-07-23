import Image from "next/image";

export function FoodImage({ src, alt = "", sizes = "(max-width: 700px) 100vw, 340px", priority = false }: { src: string; alt?: string; sizes?: string; priority?: boolean }) {
  return <Image className="food-photo" src={src} alt={alt} fill sizes={sizes} priority={priority} />;
}
