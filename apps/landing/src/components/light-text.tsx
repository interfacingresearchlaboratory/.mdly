interface LightTextProps {
  children: React.ReactNode;
  className?: string;
}

export function LightText({ children, className }: LightTextProps) {
  return (
    <div className={`text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg md:text-xl [&>p]:text-lg [&>p]:md:text-xl [&>p]:text-gray-600 [&>p]:dark:text-gray-400 [&>ul]:inline-block [&>ul]:text-left [&>ul]:my-4 [&>li]:text-lg [&>li]:md:text-xl [&>li]:text-gray-600 [&>li]:dark:text-gray-400 [&>h2]:text-gray-900 [&>h2]:dark:text-gray-100 [&>h3]:text-gray-900 [&>h3]:dark:text-gray-100 ${className || ""}`}>
      {children}
    </div>
  );
}
