type Props = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  onClick?: () => void;
};

export default function Button({ children, variant = "primary", className = "", onClick }: Props) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-sm font-medium transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}