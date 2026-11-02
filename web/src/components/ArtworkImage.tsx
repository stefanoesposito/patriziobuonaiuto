import Image from "next/image";
import dimensions from "@/lib/image-dimensions.json";
export function ArtworkImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) return null;
  const match = src.match(/-(\d+)x(\d+)\.[a-z]+$/i);
  const size =
    (dimensions as Record<string, number[]>)[src] ||
    (match ? [Number(match[1]), Number(match[2])] : [1000, 1100]);
  return (
    <Image
      src={src}
      alt={alt}
      width={size[0]}
      height={size[1]}
      sizes="(max-width: 720px) 90vw, (max-width: 1100px) 45vw, 35vw"
      className={className}
      style={{ objectFit: "contain", width: "100%", height: "auto" }}
      priority={priority}
    />
  );
}
