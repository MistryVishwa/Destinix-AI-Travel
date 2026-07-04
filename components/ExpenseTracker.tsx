
import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, Trash2, Loader2 } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../types';
import { SUPPORTED_CURRENCIES } from '../services/currencyService';
import { formatCurrency } from '../utils/currency';

interface ExpenseTrackerProps {
  userId: string;
}

const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  food: { label: 'Food', icon: '🍽️', color: 'bg-orange-500' },
  transport: { label: 'Transport', icon: '🚗', color: 'bg-blue-500' },
  stay: { label: 'Stay', icon: '🏨', color: 'bg-purple-500' },
  activities: { label: 'Activities', icon: '🎟️', color: 'bg-emerald-500' },
  other: { label: 'Other', icon: '📦', color: 'bg-gray-500' },
};

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ userId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tripLabel, setTripLabel] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}/expenses`);
        if (!res.ok) throw new Error('Failed to load expenses');
        const json = await res.json();
        if (!cancelled) setExpenses(json.data || []);
      } catch {
        if (!cancelled) setError('Could not load expenses.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const totalSpentINR = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amountINR, 0),
    [expenses]
  );

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<ExpenseCategory, number> = {
      food: 0, transport: 0, stay: 0, activities: 0, other: 0,
    };
    for (const e of expenses) {
      breakdown[e.category] += e.amountINR;
    }
    return breakdown;
  }, [expenses]);

  const handleAddExpense = async () => {
    const parsedAmount = parseFloat(amount);
    if (!tripLabel.trim() || !parsedAmount || parsedAmount <= 0) {
      setError('Please fill in a trip label and a valid amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tripLabel: tripLabel.trim(),
          category,
          amount: parsedAmount,
          currency,
          note: note.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to add expense.');

      setExpenses((prev) => [json.data, ...prev]);
      setTripLabel('');
      setAmount('');
      setNote('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense.');
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError('Could not delete that expense.');
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Expense Tracker</h1>
          <p className="text-gray-500">Log spending across trips and see it converted to INR.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Spent</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalSpentINR, 'INR')}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(categoryBreakdown)
          .filter(([, value]) => (value as number) > 0)
          .map(([cat, value]) => {
            const meta = CATEGORY_LABELS[cat as ExpenseCategory];
            return (
              <span
                key={cat}
                className={`${meta.color} text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium`}
              >
                {meta.icon} {meta.label}: {formatCurrency(value as number, 'INR')}
              </span>
            );
          })}
        {totalSpentINR === 0 && !isLoading && (
          <p className="text-gray-500 text-sm">No expenses logged yet.</p>
        )}
      </div>

      {/* Add expense form */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-indigo-400" />
          Log an Expense
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={tripLabel}
            onChange={(e) => setTripLabel(e.target.value)}
            placeholder="Trip label (e.g. Goa Trip)"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, meta]) => (
              <option key={key} value={key}>{meta.icon} {meta.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all sm:col-span-2"
          />
        </div>

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <button
          type="button"
          onClick={handleAddExpense}
          disabled={isSubmitting}
          className="w-full sm:w-auto mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Adding…' : 'Add Expense'}
        </button>
      </div>

      {/* Entry list */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recent Entries</h3>
        {isLoading ? (
          <div className="flex items-center space-x-3 text-gray-500 text-sm py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading expenses...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-[32px] py-12 text-center">
            <p className="text-gray-500 text-sm">No expenses yet. Log your first one above.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-xl">{CATEGORY_LABELS[e.category].icon}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{e.tripLabel}</p>
                    <p className="text-gray-500 text-xs">
                      {formatCurrency(e.amount, e.currency)}
                      {e.currency !== 'INR' && ` (${formatCurrency(e.amountINR, 'INR')})`}
                      {' · '}
                      {new Date(e.createdAt).toLocaleDateString()}
                      {e.note && ` · ${e.note}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(e.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
