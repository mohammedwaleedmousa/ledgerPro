import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoiceForm from "../../components/invoices/InvoiceForm";
import InvoiceItems from "../../components/invoices/InvoiceItems";
import InvoiceSummary from "../../components/invoices/InvoiceSummary";
import PageHeader from "../../components/common/PageHeader";
import { useErp } from "../../context/ErpContext";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, isProductionApiConfigured } from "../../lib/api";
import { appPaths } from "../../routes/navigation";
import type { Customer, InvoiceInput, InvoiceStatus, PaymentMethod, Product } from "../../types/erp";

type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

type BootstrapResult = {
  settings: {
    taxRate: number;
  };
};

type PostedInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string;
  total: number;
};

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const erp = useErp();
  const isProductionMode = user?.mode === "supabase";

  const [productionCustomers, setProductionCustomers] = useState<Customer[]>([]);
  const [productionProducts, setProductionProducts] = useState<Product[]>([]);
  const [productionTaxRate, setProductionTaxRate] = useState<number | null>(null);
  const [loadingProductionData, setLoadingProductionData] = useState(isProductionMode);

  const customers = isProductionMode ? productionCustomers : erp.customers;
  const products = isProductionMode ? productionProducts : erp.products;
  const defaultTaxRate = isProductionMode ? (productionTaxRate ?? 0) : erp.settings.taxRate;

  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(defaultTaxRate);
  const [items, setItems] = useState<InvoiceInput["items"]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isProductionMode) {
      setTaxRate(erp.settings.taxRate);
      return;
    }

    let active = true;

    async function loadProductionData() {
      setLoadingProductionData(true);
      setError(null);
      try {
        if (!isProductionApiConfigured) {
          throw new Error("واجهة LedgerPro الخلفية غير مهيأة. أضف VITE_API_URL أولًا.");
        }

        const [bootstrap, customersResult, productsResult] = await Promise.all([
          apiRequest<BootstrapResult>("/erp/bootstrap"),
          apiRequest<PageResult<Customer>>("/erp/customers?limit=100&page=1"),
          apiRequest<PageResult<Product>>("/erp/products?limit=100&page=1"),
        ]);

        if (!active) return;
        setProductionCustomers(customersResult.items.filter((customer) => customer.status === "active"));
        setProductionProducts(productsResult.items.filter((product) => product.isActive));
        setProductionTaxRate(bootstrap.settings.taxRate);
        setTaxRate(bootstrap.settings.taxRate);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "تعذر تحميل بيانات الفاتورة من الخادم.");
        }
      } finally {
        if (active) setLoadingProductionData(false);
      }
    }

    void loadProductionData();
    return () => {
      active = false;
    };
  }, [erp.settings.taxRate, isProductionMode]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);
  const taxAmount = subtotal * (Math.max(0, taxRate) / 100);
  const total = subtotal + taxAmount;

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      if (isProductionMode) {
        if (status === "draft") {
          throw new Error("حفظ المسودات على الخادم سيُضاف في المرحلة التالية. اختر حالة غير مسودة لترحيل الفاتورة الآن.");
        }

        const result = await apiRequest<PostedInvoiceResult>("/invoices/post", {
          method: "POST",
          body: JSON.stringify({
            customerId,
            issueDate,
            paymentMethod,
            taxRate,
            notes,
            items,
          }),
        });

        navigate(appPaths.invoiceDetails(result.invoiceId), { replace: true });
        return;
      }

      erp.createInvoice({ customerId, issueDate, paymentMethod, status, notes, taxRate, items });
      navigate(appPaths.invoices, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ الفاتورة.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="إنشاء فاتورة"
        description={isProductionMode ? "ترحيل الفاتورة يتم عبر الخادم داخل معاملة محاسبية واحدة آمنة." : "اختر العميل والمنتجات؛ يحسب النظام الضريبة والإجمالي ويحدّث المخزون تلقائياً."}
        eyebrow="المبيعات"
      />

      {isProductionMode && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[11px] font-medium text-emerald-800">
          وضع الإنتاج مفعل — البيانات تُقرأ من PostgreSQL، وترحيل الفاتورة يتم عبر NestJS.
        </div>
      )}

      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-[11px] text-rose-700">{error}</div>}

      {loadingProductionData ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">جارٍ تحميل العملاء والمنتجات من الخادم...</div>
      ) : (
        <>
          <InvoiceForm customers={customers} customerId={customerId} issueDate={issueDate} paymentMethod={paymentMethod} status={status} notes={notes} onCustomerChange={setCustomerId} onIssueDateChange={setIssueDate} onPaymentMethodChange={setPaymentMethod} onStatusChange={setStatus} onNotesChange={setNotes} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2"><InvoiceItems products={products} items={items} onItemsChange={setItems} /></div>
            <InvoiceSummary subtotal={subtotal} taxRate={taxRate} taxAmount={taxAmount} total={total} saving={saving} onTaxRateChange={setTaxRate} onSave={() => void handleSave()} />
          </div>
        </>
      )}
    </div>
  );
}
