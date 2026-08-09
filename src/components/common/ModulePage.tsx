import { CheckCircle2 } from "lucide-react";

type Props = {
  title: string;
  description: string;
  capabilities: string[];
};

export default function ModulePage({ title, description, capabilities }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-500">{description}</p>
      </header>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">هيكل الوحدة جاهز</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">سيتم ربط الوظائف بقاعدة البيانات في مرحلة الوحدات</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {capabilities.map((capability) => (
            <div key={capability} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-gray-700">
              <CheckCircle2 size={19} className="shrink-0 text-blue-600" aria-hidden="true" />
              <span>{capability}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
