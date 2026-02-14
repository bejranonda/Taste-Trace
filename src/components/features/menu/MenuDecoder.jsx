/**
 * MenuDecoder Component - Translate menu items and convert prices
 */
import React, { useState } from 'react';
import { Languages, DollarSign, Sparkles, AlertCircle } from 'lucide-react';
import { Modal, Spinner, ErrorMessage } from '../../shared';
import { menuApi } from '../../../services/api';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' }
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
];

export function MenuDecoder({ isOpen, onClose, restaurant, dishes, t }) {
  const [menuText, setMenuText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Parse menu text into items
  const parseMenuText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      // Try to extract price from end of line
      const priceMatch = line.match(/(\d+)\s*(?:THB|฿|B)?\s*$/i);
      return {
        name: priceMatch ? line.replace(priceMatch[0], '').trim() : line.trim(),
        price: priceMatch ? parseInt(priceMatch[1]) : 0
      };
    });
  };

  // Translate menu
  const handleTranslate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use existing dishes if available, otherwise parse text
      const items = dishes?.length > 0
        ? dishes.map(d => ({ name: d.name, price: d.price, isSignature: d.isSignature }))
        : parseMenuText(menuText);

      if (items.length === 0) {
        setError(new Error('Please enter menu items to translate'));
        setLoading(false);
        return;
      }

      const response = await menuApi.decode(items, targetLang, targetCurrency, restaurant?.id);
      setResults(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Use restaurant dishes as defaults
  const useRestaurantDishes = () => {
    if (dishes?.length > 0) {
      setMenuText(dishes.map(d => `${d.name} ${d.price}฿`).join('\n'));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Menu Decoder"
      icon="🍽️"
      size="lg"
    >
      <div className="space-y-4">
        {!results ? (
          <>
            {/* Language & Currency selectors */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Currency</label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Menu input */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Menu Items (one per line)</label>
              <textarea
                value={menuText}
                onChange={(e) => setMenuText(e.target.value)}
                placeholder="ไข่เจียวปู 1000&#10;ผัดขี้เมา 500&#10;ผัดไทย 400"
                className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 font-thai"
              />
            </div>

            {/* Quick fill from restaurant */}
            {dishes?.length > 0 && !menuText && (
              <button
                onClick={useRestaurantDishes}
                className="text-xs text-orange-500 hover:text-orange-600 underline"
              >
                Use restaurant menu ({dishes.length} items)
              </button>
            )}

            {/* Translate button */}
            <button
              onClick={handleTranslate}
              disabled={loading || (!menuText && !dishes?.length)}
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages size={18} />
                  Translate Menu
                </>
              )}
            </button>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="space-y-2">
              {results.items?.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    item.isMustTry || item.isSignature
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{item.original}</p>
                      <p className="font-medium text-gray-900">{item.translated}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {item.price.convertedSymbol}{item.price.converted}
                      </p>
                      <p className="text-xs text-gray-400">
                        ฿{item.price.original}
                      </p>
                    </div>
                  </div>
                  {(item.isMustTry || item.isSignature) && (
                    <div className="flex items-center gap-1 mt-2 text-yellow-600 text-xs">
                      <Sparkles size={12} />
                      Must Try
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <p>Exchange rate: 1 THB = {results.exchangeRate?.toFixed(4)} {targetCurrency}</p>
              <p>Source: {results.dataSource === 'database' ? 'Cached' : 'AI Translation'}</p>
            </div>

            <button
              onClick={() => setResults(null)}
              className="w-full text-sm text-orange-500 hover:text-orange-600 underline py-2"
            >
              Translate another menu
            </button>
          </>
        )}

        {error && <ErrorMessage error={error} onRetry={handleTranslate} />}
      </div>
    </Modal>
  );
}

export default MenuDecoder;
