export default function PageWrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-[1080px] mx-auto px-5 pt-7 pb-20 relative z-[1] ${className}`}>
      {children}
    </div>
  );
}
