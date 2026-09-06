import Image from "next/image";

export function FoodImage({ src, alt = "", sizes = "(max-width: 700px) 100vw, 340px", priority = false, loading }: { src: string; alt?: string; sizes?: string; priority?: boolean; loading?: "eager" | "lazy" }) {
  return <Image className="food-photo" src={src} alt={alt} fill sizes={sizes} priority={priority} loading={priority ? "eager" : loading} />;
}
