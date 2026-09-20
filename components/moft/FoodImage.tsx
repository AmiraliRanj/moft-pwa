import Image from "next/image";

export function FoodImage({
  src,
  alt = "",
  sizes = "(max-width: 700px) 100vw, 340px",
  priority = false,
  loading,
  className = "object-cover",
}: {
  src: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  className?: string;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image className={className} src={src} alt={alt} fill sizes={sizes} priority={priority} loading={priority ? "eager" : loading} />
    </div>
  );
}

