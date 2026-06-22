import React, { useState } from "react";
import { useItinerary } from "../../hooks/collaboration/useItinerary";
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SharedItineraryProps {
  groupId: string;
  userRole: string; // "OWNER" | "EDITOR" | "VIEWER"
}

export const SharedItinerary: React.FC<SharedItineraryProps> = ({ groupId, userRole }) => {
  const { itinerary, loading, addItem, updateItem, deleteItem } = useItinerary(groupId);
  const [activeDay, setActiveDay] = useState<number | "All">("All");
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dayNumber, setDayNumber] = useState(1);

  const canEdit = userRole === "OWNER" || userRole === "EDITOR";

  // Compute unique days in the itinerary
  const uniqueDays = Array.from(new Set(itinerary.map((item) => item.dayNumber as number))).sort((a: number, b: number) => a - b);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !canEdit) return;

    try {
      await addItem(title, description, dayNumber);
      setTitle("");
      setDescription("");
      setDayNumber(1);
      setShowAddForm(false);
    } catch (err) {
      alert("Failed to add itinerary item");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !canEdit) return;

    try {
      await updateItem(editingItem.id, title, description, dayNumber);
      setTitle("");
      setDescription("");
      setDayNumber(1);
      setEditingItem(null);
    } catch (err) {
      alert("Failed to update itinerary item");
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setDayNumber(item.dayNumber);
  };

  const handleDelete = async (itemId: string) => {
    if (!canEdit || !window.confirm("Are you sure you want to remove this item?")) return;
    try {
      await deleteItem(itemId);
    } catch (err) {
      alert("Failed to delete itinerary item");
    }
  };

  // Filtered itinerary list
  const filteredItinerary = activeDay === "All" 
    ? itinerary 
    : itinerary.filter((item) => item.dayNumber === activeDay);

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Itinerary Planner</h2>
          <p className="text-gray-400">Coordinate daily activities, times, and maps together.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingItem(null);
              setTitle("");
              setDescription("");
              setDayNumber(1);
              setShowAddForm(true);
            }}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] px-6 py-3.5 rounded-xl font-bold transition-all text-white text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* Day Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
        <button
          onClick={() => setActiveDay("All")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-w-max border ${
            activeDay === "All"
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
          }`}
        >
          All Days
        </button>
        {uniqueDays.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-w-max border ${
              activeDay === day
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Day {day}
          </button>
        ))}
        {uniqueDays.length === 0 && (
          <span className="text-sm text-gray-500 italic">No days added yet</span>
        )}
      </div>

      {/* Form overlay for Add/Edit */}
      <AnimatePresence>
        {(showAddForm || editingItem) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddForm(false);
                setEditingItem(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0d1117]/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl z-10"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {editingItem ? "Edit Activity" : "Add Activity"}
              </h3>
              <form onSubmit={editingItem ? handleEditSubmit : handleAddSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Activity Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Visit Eiffel Tower, Lunch at Seine"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Day Number</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={dayNumber}
                    onChange={(e) => setDayNumber(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Details / Notes</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide timings, address, reservation numbers, etc."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-28 transition-all resize-none placeholder:text-gray-600 text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    className="px-5 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Itinerary Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredItinerary.length > 0 ? (
        <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8 py-2">
          {filteredItinerary.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl hover:border-indigo-500/20 transition-all"
            >
              {/* Timeline marker */}
              <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-gray-950 shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform" />

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Day {item.dayNumber}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">ID: #{item.id.slice(-6)}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-sm text-gray-400 leading-relaxed max-w-2xl whitespace-pre-wrap">
                      {item.description}
                    </p>
                  )}
                </div>

                {canEdit && (
                  <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-start">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-indigo-500/30 hover:bg-white/10 transition-all"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 bg-white/5 border border-white/10 border-dashed rounded-[32px] text-center max-w-2xl mx-auto flex flex-col items-center">
          <Calendar className="w-10 h-10 text-gray-600 mb-4" />
          <h4 className="text-lg font-bold text-white mb-1">No activities listed</h4>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            {canEdit 
              ? "Start building the perfect itinerary by adding your first daily event."
              : "The group owner has not added any activities to this itinerary yet."}
          </p>
          {canEdit && (
            <button
              onClick={() => {
                setEditingItem(null);
                setTitle("");
                setDescription("");
                setDayNumber(1);
                setShowAddForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
            >
              Add First Activity
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default SharedItinerary;
