import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User } from "../../types";
import { getGroupDetails } from "../../services/collaboration/groupService";
import { inviteMember } from "../../services/collaboration/invitationService";
import { useGroups } from "../../hooks/collaboration/useGroups";

import { SharedItinerary } from "./SharedItinerary";
import { DestinationSuggestions } from "./DestinationSuggestions";
import { DiscussionBoard } from "./DiscussionBoard";
import { SharedBookings } from "./SharedBookings";
import { GroupExpenseTracker } from "./GroupExpenseTracker";
import { InviteMemberModal } from "./InviteMemberModal";

import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, MessageSquare, MapPin, CreditCard, 
  Users, Trash2, ArrowLeft, Plus, Mail, Compass, Loader2
} from "lucide-react";

interface GroupDashboardProps {
  user: User;
  tab?: "dashboard" | "itinerary" | "discussions" | "expenses" | "bookings";
}

export const GroupDashboard: React.FC<GroupDashboardProps> = ({ user, tab = "dashboard" }) => {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteGroup } = useGroups();

  const [group, setGroup] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string>("VIEWER");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tab);

  const loadGroupDetails = async () => {
    if (!groupId) return;
    try {
      const data = await getGroupDetails(groupId);
      setGroup(data);

      // Resolve current user's role
      const member = data.members.find((m: any) => m.userId === user.id);
      if (member) {
        setUserRole(member.role);
      } else {
        setUserRole("VIEWER");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load group details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupDetails();
  }, [groupId, user.id]);

  // Sync tab selection from routing props
  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleInvite = async (email: string) => {
    if (!groupId) return;
    await inviteMember(groupId, email);
    // Reload group details to update the invitations list
    loadGroupDetails();
  };

  const handleDeleteGroup = async () => {
    if (!groupId || !window.confirm("Are you sure you want to permanently delete this group? All data will be lost.")) return;
    try {
      await deleteGroup(groupId);
      navigate("/groups");
    } catch (err: any) {
      alert(err.message || "Failed to delete group");
    }
  };

  const handleTabChange = (targetTab: string) => {
    setActiveTab(targetTab);
    const subRoute = targetTab === "dashboard" ? "" : `/${targetTab}`;
    navigate(`/groups/${groupId}${subRoute}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-40 pb-24 bg-gray-950 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-gray-400 font-medium">Fetching group details...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen pt-40 pb-24 bg-gray-950 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-12 max-w-lg">
          <h3 className="text-3xl font-serif font-bold text-white mb-4">Access Denied</h3>
          <p className="text-gray-400 mb-8">{error || "The requested group could not be found or you do not have permission to view it."}</p>
          <button
            onClick={() => navigate("/groups")}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-white font-bold transition-all mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to groups</span>
          </button>
        </div>
      </div>
    );
  }

  const isOwner = userRole === "OWNER";
  const isEditor = userRole === "EDITOR";
  const canEdit = isOwner || isEditor;

  const tabs = [
    { id: "dashboard", label: "Overview", icon: <Compass className="w-4 h-4" /> },
    { id: "itinerary", label: "Itinerary", icon: <Calendar className="w-4 h-4" /> },
    { id: "suggestions", label: "Suggestions", icon: <MapPin className="w-4 h-4" /> },
    { id: "discussions", label: "Discussion", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "bookings", label: "Bookings", icon: <CreditCard className="w-4 h-4" /> },
    { id: "expenses", label: "Expenses", icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-950 pt-28 pb-24 text-gray-100">
      
      {/* Header Panel */}
      <div className="bg-gradient-to-b from-black/40 to-transparent border-b border-white/5 pb-8 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <button
            onClick={() => navigate("/groups")}
            className="inline-flex items-center space-x-2 text-indigo-400 hover:text-white font-bold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
                  {group.name}
                </h1>
                <span className="text-[10px] bg-indigo-600/30 border border-indigo-500/50 text-indigo-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {userRole} Role
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <p>Owner: <span className="text-gray-200 font-medium">{group.owner.name}</span></p>
                <div className="h-4 w-px bg-white/10 hidden md:block" />
                <p>Members: <span className="text-gray-200 font-medium">{group.members.length} active</span></p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canEdit && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-2 bg-indigo-600/10 border border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-600/20 px-6 py-3.5 rounded-2xl text-indigo-400 hover:text-white font-bold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite Member</span>
                </button>
              )}

              {isOwner && (
                <button
                  onClick={handleDeleteGroup}
                  className="flex items-center space-x-2 bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 px-6 py-3.5 rounded-2xl text-gray-400 hover:text-red-400 font-bold text-sm transition-all"
                  title="Delete Entire Group"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Group</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex space-x-1.5 bg-white/5 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl overflow-x-auto no-scrollbar max-w-max">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id)}
              className={`relative flex items-center space-x-2 px-6 py-3.5 rounded-[20px] text-xs font-bold transition-all min-w-max ${
                activeTab === tabItem.id 
                  ? "text-white" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {activeTab === tabItem.id && (
                <motion.div
                  layoutId="activeGroupTab"
                  className="absolute inset-0 bg-indigo-600 rounded-[20px] shadow-lg shadow-indigo-600/20"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{tabItem.icon}</span>
              <span className="relative z-10">{tabItem.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-[fadeIn_0.4s_ease-out]">
            
            {/* Overview Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
                <h3 className="text-2xl font-serif font-bold text-white mb-4">Co-Trip Details</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Welcome to the trip planning dashboard! Below is the current outline of your travels. Use the tabs above to collaborate on details.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between h-32">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Itinerary Activities</p>
                    <button
                      onClick={() => handleTabChange("itinerary")}
                      className="text-indigo-400 text-sm font-bold flex items-center hover:underline self-start"
                    >
                      Map activities &rarr;
                    </button>
                  </div>
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between h-32">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Shared Expenses</p>
                    <button
                      onClick={() => handleTabChange("expenses")}
                      className="text-indigo-400 text-sm font-bold flex items-center hover:underline self-start"
                    >
                      View expenses &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Panel Right Column */}
            <div className="space-y-8">
              
              {/* Group Members List */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Group Companions ({group.members.length})</span>
                </h3>
                <div className="space-y-4">
                  {group.members.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white overflow-hidden shrink-0">
                          {m.user.avatar ? (
                            <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                          ) : (
                            m.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{m.user.name}</p>
                          <p className="text-[10px] text-gray-500">{m.user.email}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-gray-400 uppercase tracking-widest font-mono">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invitations list inside overview */}
              {group.invitations?.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-indigo-400" />
                    <span>Sent Invitations</span>
                  </h3>
                  <div className="space-y-3">
                    {group.invitations.map((inv: any) => (
                      <div key={inv.id} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                        <span className="text-gray-300 font-medium truncate max-w-[180px]">{inv.email}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          inv.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {activeTab === "itinerary" && (
          <SharedItinerary groupId={groupId!} userRole={userRole} />
        )}

        {activeTab === "suggestions" && (
          <DestinationSuggestions groupId={groupId!} currentUser={user} userRole={userRole} />
        )}

        {activeTab === "discussions" && (
          <DiscussionBoard groupId={groupId!} currentUser={user} />
        )}

        {activeTab === "bookings" && (
          <SharedBookings groupId={groupId!} userRole={userRole} />
        )}

        {activeTab === "expenses" && (
          <GroupExpenseTracker groupId={groupId!} />
        )}

      </div>

      {/* Invite Modal Overlay */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteMemberModal
            groupId={groupId!}
            onClose={() => setShowInviteModal(false)}
            onInvite={handleInvite}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
export default GroupDashboard;
