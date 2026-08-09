type Props = {
  children: React.ReactNode;
};

export default function Table({ children }: Props) {
  return (
    <div className="max-w-full overflow-x-auto rounded-3xl border border-gray-100 bg-white">
      <table className="w-full min-w-[720px] text-right">
        {children}
      </table>
    </div>
  );
}
