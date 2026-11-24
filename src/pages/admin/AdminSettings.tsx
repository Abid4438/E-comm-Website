import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../store/useToastStore';
import { Save, Database, Globe, Plus, Trash2, CreditCard } from 'lucide-react';
import { getStoreConfig } from '../../services/apiClient';
import { formatPrice } from '../../utils/formatters';
import { getDeliveryMethods, getPaymentMethods, saveDeliveryMethods, savePaymentMethods } from '../../services/api/ApiStoreSettingsService';
import { DeliveryMethodOption, PaymentMethodOption } from '../../types/payment';

const STORE_SETTINGS_KEY = 'moss_store_settings';

export const AdminSettings: React.FC = () => {
  const [storeName, setStoreName] = useState(() => getStoreConfig().storeName || 'MOSS Lifestyle');
  const [supportEmail, setSupportEmail] = useState(() => getStoreConfig().supportEmail || 'concierge@mosslifestyle.com');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(() => getStoreConfig().freeShippingThreshold);
  const [standardShippingFee, setStandardShippingFee] = useState(() => getStoreConfig().standardShippingFee);
  const [expressShippingFee, setExpressShippingFee] = useState(() => getStoreConfig().expressShippingFee);
  const [overnightShippingFee, setOvernightShippingFee] = useState(() => getStoreConfig().overnightShippingFee);
  const [taxRate, setTaxRate] = useState(() => getStoreConfig().taxRate * 100);
  const [currency, setCurrency] = useState(() => getStoreConfig().currency || 'PKR');
  const [enableCarbonNeutral, setEnableCarbonNeutral] = useState(() => getStoreConfig().enableCarbonNeutral ?? true);
  const [magentoGraphQLEndpoint, setMagentoGraphQLEndpoint] = useState(() => getStoreConfig().magentoGraphQLEndpoint || 'https://demo.magento.com/graphql');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodOption[]>([]);
  const [newDeliveryMethod, setNewDeliveryMethod] = useState('');
  const [newDeliveryTiming, setNewDeliveryTiming] = useState('');
  const [newDeliveryFee, setNewDeliveryFee] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [paymentMethodsLoadFailed, setPaymentMethodsLoadFailed] = useState(false);
  const [paymentMethodsLoaded, setPaymentMethodsLoaded] = useState(false);
  const { showToast } = useToastStore();

  useEffect(() => {
    Promise.all([getPaymentMethods(), getDeliveryMethods()]).then(([payments, deliveries]) => {
      setPaymentMethods(payments);
      setDeliveryMethods(deliveries);
      setPaymentMethodsLoaded(true);
    }).catch(() => {
      setPaymentMethodsLoadFailed(true);
      showToast({ title: 'Checkout Settings Unavailable', message: 'Could not load the saved delivery and payment methods from the server.', type: 'error' });
    });
  }, [showToast]);

  const handleAddPaymentMethod = () => {
    const label = newPaymentMethod.trim();
    if (!label || paymentMethods.some((method) => method.label.toLowerCase() === label.toLowerCase())) return;
    setPaymentMethods((methods) => [...methods, { id: `custom_${crypto.randomUUID()}`, label }]);
    setNewPaymentMethod('');
  };

  const handleAddDeliveryMethod = () => {
    const label = newDeliveryMethod.trim();
    const fee = Number(newDeliveryFee);
    if (!label || !Number.isFinite(fee) || fee < 0 || deliveryMethods.some((method) => method.label.toLowerCase() === label.toLowerCase())) return;
    setDeliveryMethods((methods) => [...methods, {
      id: `delivery_${crypto.randomUUID()}`,
      label,
      timing: newDeliveryTiming.trim(),
      fee,
    }]);
    setNewDeliveryMethod('');
    setNewDeliveryTiming('');
    setNewDeliveryFee('0');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethodsLoadFailed) {
      showToast({ title: 'Settings Not Saved', message: 'Reload the saved delivery and payment methods before changing them.', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all([savePaymentMethods(paymentMethods), saveDeliveryMethods(deliveryMethods)]);
      localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify({
        storeName,
        supportEmail,
        freeShippingThreshold,
        standardShippingFee,
        expressShippingFee,
        overnightShippingFee,
        taxRate: taxRate / 100,
        currency,
        enableCarbonNeutral,
        magentoGraphQLEndpoint,
      }));
    } catch {
      showToast({ title: 'Settings Not Saved', message: 'Could not save configuration. Check administrator access and try again.', type: 'error' });
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    showToast({
      title: 'Settings Saved',
      message: 'Store settings and payment methods updated.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Configuration & Engine
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
          Store Settings
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Storefront Settings */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-serif text-xl font-normal text-charcoal-900 pb-2 border-b border-sand-200">
            <Globe className="w-5 h-5 text-moss-800" />
            <span>General Store Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Concierge Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Free Shipping Threshold ({currency === 'PKR' ? 'Rs' : currency})
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Standard Pakistan Courier ({currency === 'PKR' ? 'Rs' : currency})
              </label>
              <input
                type="number"
                min="0"
                value={standardShippingFee}
                onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Express Courier ({currency === 'PKR' ? 'Rs' : currency})
              </label>
              <input
                type="number"
                min="0"
                value={expressShippingFee}
                onChange={(e) => setExpressShippingFee(Number(e.target.value))}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Priority Courier ({currency === 'PKR' ? 'Rs' : currency})
              </label>
              <input
                type="number"
                min="0"
                value={overnightShippingFee}
                onChange={(e) => setOvernightShippingFee(Number(e.target.value))}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              >
                <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="carbon-toggle"
              checked={enableCarbonNeutral}
              onChange={(e) => setEnableCarbonNeutral(e.target.checked)}
              className="rounded text-moss-900"
            />
            <label htmlFor="carbon-toggle" className="text-xs text-charcoal-700 font-medium">
              Enable Carbon-Neutral Certification Badge and Packaging Guarantee
            </label>
          </div>
        </div>

        {/* Checkout Payment Methods */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-serif text-xl font-normal text-charcoal-900 pb-2 border-b border-sand-200">
            <CreditCard className="w-5 h-5 text-moss-800" />
            <span>Checkout Payment Methods</span>
          </div>
          <p className="text-xs text-charcoal-600">Only the methods listed here appear at checkout. Add or remove methods, then save the configuration.</p>
          {paymentMethodsLoadFailed && <p role="alert" className="text-xs text-red-700">Checkout delivery and payment methods could not be loaded. Refresh this page before editing.</p>}
          <div className="space-y-2">
            {paymentMethods.length === 0 && !paymentMethodsLoadFailed && (
              <p className="text-xs text-charcoal-500">No payment methods added. Customers will see no payment options until you add one.</p>
            )}
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between gap-3 bg-white border border-sand-200 px-3 py-2.5">
                <span className="text-sm text-charcoal-900">{method.label}</span>
                <button
                  type="button"
                  onClick={() => setPaymentMethods((methods) => methods.filter((item) => item.id !== method.id))}
                  disabled={paymentMethodsLoadFailed}
                  aria-label={`Remove ${method.label}`}
                  title={`Remove ${method.label}`}
                  className="text-red-700 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPaymentMethod(); } }}
              maxLength={50}
              placeholder="New method name"
              aria-label="New payment method name"
              className="flex-1 bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPaymentMethod}
              disabled={!newPaymentMethod.trim() || paymentMethods.length >= 20 || paymentMethods.some((method) => method.label.toLowerCase() === newPaymentMethod.trim().toLowerCase())}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Method
            </Button>
          </div>
        </div>

        {/* Checkout Delivery Methods */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-serif text-xl font-normal text-charcoal-900 pb-2 border-b border-sand-200">
            <Globe className="w-5 h-5 text-moss-800" />
            <span>Checkout Delivery Methods</span>
          </div>
          <p className="text-xs text-charcoal-600">These delivery choices appear at checkout. Remove or add methods, then save the configuration.</p>
          {deliveryMethods.length === 0 && !paymentMethodsLoadFailed && (
            <p className="text-xs text-charcoal-500">No delivery methods added. Customers will not be able to place an order until one is added.</p>
          )}
          <div className="space-y-2">
            {deliveryMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between gap-3 bg-white border border-sand-200 px-3 py-2.5">
                <span className="text-sm text-charcoal-900">{method.label} · {method.timing || 'Timing not specified'} · {formatPrice(method.fee, currency)}</span>
                <button type="button" onClick={() => setDeliveryMethods((methods) => methods.filter((item) => item.id !== method.id))}
                  disabled={paymentMethodsLoadFailed} aria-label={`Remove ${method.label}`} title={`Remove ${method.label}`}
                  className="text-red-700 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_auto] gap-2">
            <input value={newDeliveryMethod} onChange={(e) => setNewDeliveryMethod(e.target.value)} maxLength={50} placeholder="Method name" aria-label="New delivery method name" className="bg-white border border-sand-300 p-2.5 text-xs" />
            <input value={newDeliveryTiming} onChange={(e) => setNewDeliveryTiming(e.target.value)} maxLength={100} placeholder="Delivery time (optional)" aria-label="New delivery timing" className="bg-white border border-sand-300 p-2.5 text-xs" />
            <input type="number" min="0" max="10000000" step="1" value={newDeliveryFee} onChange={(e) => setNewDeliveryFee(e.target.value)} placeholder="Fee" aria-label="New delivery fee" className="bg-white border border-sand-300 p-2.5 text-xs" />
            <Button type="button" variant="outline" onClick={handleAddDeliveryMethod} disabled={!newDeliveryMethod.trim() || deliveryMethods.length >= 20 || deliveryMethods.some((method) => method.label.toLowerCase() === newDeliveryMethod.trim().toLowerCase())} leftIcon={<Plus className="w-4 h-4" />}>Add Method</Button>
          </div>
        </div>

        {/* Magento 2 Integration Configuration */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-serif text-xl font-normal text-charcoal-900 pb-2 border-b border-sand-200">
            <Database className="w-5 h-5 text-moss-800" />
            <span>Magento 2 / Headless Backend Connection</span>
          </div>

          <p className="text-xs text-charcoal-600 font-light leading-relaxed">
            The frontend application is structured using a service adapter pattern (<code>IProductService</code>, <code>ICartService</code>, <code>IOrderService</code>). You can switch from local Mock service to live Magento GraphQL by configuring the endpoint below and toggling <code>VITE_USE_MAGENTO=true</code>.
          </p>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Magento GraphQL Endpoint URL
            </label>
            <input
              type="url"
              value={magentoGraphQLEndpoint}
              onChange={(e) => setMagentoGraphQLEndpoint(e.target.value)}
              className="w-full bg-white border border-sand-300 p-2.5 text-xs font-mono text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-sand-200">
          <Button
            type="button"
            variant="dark"
            size="lg"
            onClick={() => window.open('http://localhost:4000/export/db-download', '_blank')}
            leftIcon={<Database className="w-4 h-4" />}
          >
            Download DB
          </Button>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="dark"
            size="lg"
            leftIcon={<Save className="w-4 h-4" />}
            disabled={isSaving || !paymentMethodsLoaded}
          >
            {isSaving ? 'Saving…' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
};
