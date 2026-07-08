import React, { useState } from "react";
import { useExpenses } from "../../hooks/collaboration/useExpenses";
import { formatCurrency } from "../../utils/currency";
import { Plus, CreditCard, DollarSign, Users, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface GroupExpenseTrackerProps {
  groupId: string;
}

export const GroupExpenseTracker: React.FC<GroupExpenseTrackerProps> = ({ groupId }) => {
  const { expenses, summary, loading, addExpense } = useExpenses(groupId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addExpense(title.trim(), Number(amount));
      setTitle("");
      setAmount("");
      setShowAddForm(false);
    } catch (err) {
      alert("Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Group Expense Tracker</h2>
          <p className="text-gray-400">Keep budget details transparent and see who owes what.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] px-6 py-3.5 rounded-xl font-bold transition-all text-white text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Add Expense Form Box */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl max-w-xl"
        >
          <h3 className="text-lg font-bold text-white mb-6">Record New Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dinner on Tuesday, Gas refuel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                  Amount paid (INR)
                </label>
                <input
                  type="number"
                  required
                  min={0.01}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all placeholder:text-gray-600"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center space-x-1"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5" />
                )}
                <span>Record Expense</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Summary Widgets Row */}
      {loading && summary.totalExpenses === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-28 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
          <div className="h-28 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Group Expenses</p>
              <h3 className="text-2xl font-bold text-white font-mono mt-1">
                {formatCurrency(summary.totalExpenses, "INR")}
              </h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Average Individual Share</p>
              <h3 className="text-2xl font-bold text-white font-mono mt-1">
                {formatCurrency(summary.averageShare, "INR")}
              </h3>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl flex items-center space-x-4 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Transactions</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {expenses.length} Recorded
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Member Balances Table */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl h-fit">
          <h3 className="text-xl font-bold text-white mb-6">Member Balances</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="pb-4">Member</th>
                  <th className="pb-4 text-right">Paid</th>
                  <th className="pb-4 text-right">Net Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summary.memberSummary?.map((m: any) => (
                  <tr key={m.userId} className="text-sm">
                    <td className="py-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{m.name}</p>
                        <p className="text-[10px] text-gray-500">{m.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono text-gray-300">
                      {formatCurrency(m.paid, "INR")}
                    </td>
                    <td className={`py-4 text-right font-mono font-bold ${
                      m.net > 0.01 
                        ? "text-emerald-400" 
                        : m.net < -0.01 
                        ? "text-rose-400" 
                        : "text-gray-500"
                    }`}>
                      {m.net > 0.01 ? "+" : ""}
                      {formatCurrency(m.net, "INR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suggested settlements */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl h-fit">
            <h3 className="text-xl font-bold text-white mb-6">Settle Debts</h3>
            {summary.transfers?.length > 0 ? (
              <div className="space-y-4">
                {summary.transfers.map((t: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between text-sm hover:border-indigo-500/40 transition-all"
                  >
                    <div>
                      <span className="text-indigo-400 font-bold">{t.fromName}</span>
                      <span className="text-gray-400"> owes </span>
                      <span className="text-purple-400 font-bold">{t.toName}</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(t.amount, "INR")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center text-gray-500">
                <AlertCircle className="w-8 h-8 text-gray-600 mb-3" />
                <p className="text-xs">All accounts are settled! No transfers required.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Individual Expense Records List */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white mb-6">Payment Timeline</h3>
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all text-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                    {exp.payer.avatar ? (
                      <img src={exp.payer.avatar} alt={exp.payer.name} className="w-full h-full object-cover" />
                    ) : (
                      exp.payer.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{exp.title}</h4>
                    <p className="text-xs text-gray-500">
                      Paid by {exp.payer.name} &bull; {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(exp.amount, "INR")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic text-center py-10">No expenses recorded yet.</p>
        )}
      </div>

    </div>
  );
};
export default GroupExpenseTracker;
