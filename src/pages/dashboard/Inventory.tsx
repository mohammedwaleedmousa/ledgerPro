import InventoryHeader from "../../components/inventory/InventoryHeader";
import InventoryStats from "../../components/inventory/InventoryStats";
import InventoryTable from "../../components/inventory/InventoryTable";
import StockAlert from "../../components/inventory/StockAlert";

export default function Inventory() {
  return (
    <div className="space-y-6">
      <InventoryHeader />

      <InventoryStats />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <InventoryTable />
        </div>

        <StockAlert />
      </div>
    </div>
  );
}