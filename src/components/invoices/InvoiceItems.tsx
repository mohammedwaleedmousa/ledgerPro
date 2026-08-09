import { Plus, Trash2 } from "lucide-react";

const items = [
  {
    name: "Laptop Pro",
    quantity: 2,
    price: "$1200",
  },
];


export default function InvoiceItems() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          المنتجات
        </h2>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">
          <Plus size={16}/>
          إضافة منتج
        </button>
      </div>


      <div className="space-y-3">

        {items.map((item)=>(
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
          >

            <div>
              <p className="font-medium">
                {item.name}
              </p>

              <p className="text-sm text-gray-400">
                الكمية: {item.quantity}
              </p>
            </div>


            <div className="flex items-center gap-4">

              <span className="font-semibold">
                {item.price}
              </span>


              <Trash2
                size={18}
                className="cursor-pointer text-red-500"
              />

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}