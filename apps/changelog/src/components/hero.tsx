interface HeroProps {
  imageUrl: string;
}

export function Hero({ imageUrl }: HeroProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      <img
        src={imageUrl}
        alt="Hero"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
