type Props = {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger";
};

export default function Badge({ children, variant = "success" }: Props) {
  const styles = {
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}