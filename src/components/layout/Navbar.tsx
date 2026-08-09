import { Search, Bell } from "lucide-react";

export default function Navbar() {

  return (
    <header className="
    h-20
    bg-white/80
    backdrop-blur
    border-b
    border-gray-100
    px-8
    flex
    items-center
    justify-between
    ">


      <div className="
      flex
      items-center
      gap-3
      bg-gray-50
      rounded-xl
      px-4
      py-2
      w-96
      ">

        <Search size={18}/>

        <span className="text-gray-400">
          ابحث في النظام...
        </span>

      </div>


      <div className="flex items-center gap-5">

        <Bell size={22}/>


        <div className="
        flex
        items-center
        gap-3
        ">

          <div className="
          w-10
          h-10
          rounded-full
          bg-blue-600
          text-white
          flex
          items-center
          justify-center
          ">
            م
          </div>


          <div>
            <p className="font-semibold">
              محمد
            </p>

            <p className="text-xs text-gray-400">
              Owner
            </p>

          </div>

        </div>


      </div>


    </header>
  );
}