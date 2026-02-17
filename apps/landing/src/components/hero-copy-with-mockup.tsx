import { cn } from "@editor/ui/utils";

interface HeroCopyWithMockupProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  id?: string;
}

export function HeroCopyWithMockup({ left, right, className, id }: HeroCopyWithMockupProps) {
  return (
    <div
      id={id}
      className={cn(
        id && "scroll-mt-14",
        "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] border-t border-b border-border",
        className
      )}
    >
      <div
        className={cn(
          "pl-6 md:pl-0 pr-6 lg:pr-[max(0px,calc((100vw-80rem)/2))] flex flex-col md:grid md:grid-cols-[1fr_minmax(240px,28rem)] gap-8 md:gap-12 items-stretch w-full"
        )}
      >
        <div className="border-x border-t md:border-0 md:border-r w-full text-left flex flex-col min-w-0 h-[65vh] min-h-[320px] md:h-auto md:min-h-[85vh] md:max-h-[85vh] overflow-hidden md:border-r border-border order-2 md:order-1">
          {left}
        </div>
        <div className=" w-full min-h-[400px] md:min-h-[85vh] max-h-[85vh] flex flex-col order-1 md:order-2">
          {right}
        </div>
      </div>
    </div>
  );
}
