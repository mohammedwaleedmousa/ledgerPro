type Props = {
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
};

export default function Table({ children, minWidth = "720px", className = "" }: Props) {
  return (
    <div className={`max-w-full overflow-x-auto rounded-[18px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)] ${className}`}>
      <table className="w-full text-right" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}
