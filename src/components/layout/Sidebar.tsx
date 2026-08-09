import {
  LayoutDashboard,
  FileText,
  Wallet,
  Users,
  Package,
  Bot,
  BarChart3,
  Settings,
  CreditCard,
  Boxes
} from "lucide-react";

const sections = [
  {
    title: "الرئيسية",
    items: [
      { name: "لوحة التحكم", icon: LayoutDashboard }
    ]
  },
  {
    title: "الإدارة المالية",
    items: [
      { name: "الفواتير", icon: FileText },
      { name: "المصروفات", icon: Wallet },
      { name: "المعاملات", icon: CreditCard },
      { name: "التقارير", icon: BarChart3 }
    ]
  },
  {
    title: "الأعمال",
    items: [
      { name: "العملاء", icon: Users },
      { name: "المنتجات", icon: Package },
      { name: "المخزون", icon: Boxes }
    ]
  },
  {
    title: "الذكاء",
    items: [
      { name: "المساعد الذكي", icon: Bot }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white border-l border-gray-100 p-5 flex flex-col">

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-600">
          LedgerPro
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          AI Finance Platform
        </p>
      </div>


      <nav className="flex-1 space-y-7">

        {sections.map(section => (
          <div key={section.title}>

            <p className="text-xs text-gray-400 mb-3">
              {section.title}
            </p>


            <div className="space-y-1">

              {section.items.map(item => {

                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    className="
                    w-full flex items-center gap-3
                    px-4 py-3 rounded-xl
                    text-gray-600
                    hover:bg-blue-50
                    hover:text-blue-600
                    transition
                    "
                  >
                    <Icon size={20}/>
                    <span>{item.name}</span>
                  </button>
                );

              })}

            </div>

          </div>
        ))}

      </nav>


      <div className="
      mt-auto
      p-4
      rounded-2xl
      bg-gradient-to-br
      from-blue-600
      to-indigo-600
      text-white
      ">

        <p className="font-semibold">
          Upgrade Pro
        </p>

        <p className="text-sm opacity-80 mt-2">
          Unlock AI financial insights
        </p>


        <button className="
        mt-4
        bg-white
        text-blue-600
        px-4 py-2
        rounded-xl
        text-sm
        ">
          Upgrade
        </button>

      </div>


    </aside>
  );
}