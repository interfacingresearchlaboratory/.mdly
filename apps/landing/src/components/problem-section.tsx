"use client";

export function ProblemSection() {
  return (
    <div className="not-prose my-12 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 w-full items-center">
        {/* Left Column - Text Content */}
        <div className="flex flex-col justify-center p-10">
          <div className="text-5xl md:text-6xl text-[#0101fd]">
            Tool sprawl kills momentum
          </div>
          
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg md:text-xl">
            <p>
              Founders, coders, and designers lose hours every week switching between Notion, Linear, calendars, and review docs.
            </p>
            
            <p className="font-medium text-gray-900 dark:text-gray-100">
              That fragmentation creates real damage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
