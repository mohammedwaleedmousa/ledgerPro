type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div className={`rounded-3xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}