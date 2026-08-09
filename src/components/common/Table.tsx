type Props = {
  children: React.ReactNode;
};

export default function Table({ children }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
      <table className="w-full text-right">
        {children}
      </table>
    </div>
  );
}