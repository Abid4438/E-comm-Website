import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../store/useToastStore';
import { Save, ShieldCheck, Database, Globe } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [storeName, setStoreName] = useState('MOSS Lifestyle');
  const [supportEmail, setSupportEmail] = useState('concierge@mosslifestyle.com');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(100);
  const [taxRate, setTaxRate] = useState(8.0);
  const [currency, setCurrency] = useState('USD');
  const [enableCarbonNeutral, setEnableCarbonNeutral] = useState(true);
  const [magentoGraphQLEndpoint, setMagentoGraphQLEndpoint] = useState('https://demo.magento.com/graphql');
  const { showToast } = useToastStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      title: 'Settings Saved',
      message: 'Store configuration parameters updated.',
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
                Free Shipping Threshold ($)
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
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              >
                <option value="USD">USD ($) - United States Dollar</option>
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
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
