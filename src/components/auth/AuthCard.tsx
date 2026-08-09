type Props = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export default function AuthCard({ children, title, description }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>

        <p className="mt-2 text-gray-500">
          {description}
        </p>

        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
}