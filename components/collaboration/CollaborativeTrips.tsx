import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Compass, Sparkles, Mail, Check, X, ArrowRight, Loader2, Users } from "lucide-react";
import { useGroups } from "../../hooks/collaboration/useGroups";
import { useInvitations } from "../../hooks/collaboration/useInvitations";
import { syncUser } from "../../services/collaboration/groupService";
import { CreateGroupModal } from "./CreateGroupModal";
import { User } from "../../types";

interface CollaborativeTripsProps {
  user: User;
}

export const CollaborativeTrips: React.FC<CollaborativeTripsProps> = ({ user }) => {
  const navigate = useNavigate();
  const { groups, loading: groupsLoading, createGroup, deleteGroup, fetchGroups } = useGroups();
  const { invitations, loading: invitesLoading, acceptInvite, declineInvite, fetchInvitations } = useInvitations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [syncing, setSyncing] = useState(true);

  // Sync mock user details to PostgreSQL on mount
  useEffect(() => {
    const performSync = async () => {
      try {
        await syncUser(user.name, user.avatar, user.id);
      } catch (err) {
        console.error("Failed to sync user context with PostgreSQL backend:", err);
      } finally {
        setSyncing(false);
      }
    };
    performSync();
  }, [user]);

  const handleCreateGroup = async (name: string) => {
    return await createGroup(name);
  };

  const handleAcceptInvite = async (inviteId: string) => {
    await acceptInvite(inviteId);
    // Refresh invites and group lists via React state instead of full page reload
    fetchInvitations();
    fetchGroups();
  };

  const handleDeclineInvite = async (inviteId: string) => {
    await declineInvite(inviteId);
    fetchInvitations();
  };

  if (syncing || groupsLoading || invitesLoading) {
    return (
      <div className="min-h-screen pt-40 pb-24 bg-gray-950 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-gray-400 font-medium">Entering collaborative travel universe...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-32 pb-24 text-gray-100 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-[fadeIn_0.5s_ease-out]">
          <div>
            <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Cooperative Travel
            </h2>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
              Collaborative Trips
            </h1>
            <p className="text-gray-400 max-w-xl">
              Plan itineraries, suggest places, vote on destinations, track group expenses, and make reservations together in real-time.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 text-white"
          >
            <Plus className="w-5 h-5" />
            <span>Create Trip Group</span>
          </button>
        </div>

        {/* Invitations Section */}
        {invitations.length > 0 && (
          <section className="mb-16 animate-[fadeIn_0.6s_ease-out]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <span>Pending Invitations ({invitations.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-indigo-500/30 transition-all group"
                >
                  <div className="mb-6">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-2">INVITATION</span>
                    <h4 className="text-xl font-bold text-white mb-1">{invite.tripGroup.name}</h4>
                    <p className="text-sm text-gray-400">
                      Invited by: <span className="text-gray-300 font-medium">{invite.tripGroup.owner.name}</span>
                    </p>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-white font-bold text-sm transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-gray-300 font-bold text-sm transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Groups List */}
        <section className="animate-[fadeIn_0.7s_ease-out]">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>My Active Travel Groups</span>
          </h3>

          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="group bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl hover:bg-white/10 hover:border-indigo-500/50 hover:-translate-y-2 cursor-pointer transition-all flex flex-col justify-between h-[280px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                        <Compass className="w-6 h-6 animate-pulse" />
                      </div>
                      <span className="text-[10px] bg-indigo-600 text-white font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {group.ownerId === user.id ? "Owner" : "Collaborator"}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Started by: {group.ownerId === user.id ? "You" : group.owner.name}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-6">
                    <div className="flex items-center -space-x-2">
                      {group.members.slice(0, 4).map((m: any) => (
                        <div
                          key={m.id}
                          className="w-8 h-8 rounded-full border-2 border-gray-950 overflow-hidden bg-indigo-600 flex items-center justify-center text-xs font-bold text-white"
                          title={m.user.name}
                        >
                          {m.user.avatar ? (
                            <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                          ) : (
                            m.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>

                    <span className="text-indigo-400 text-sm font-bold flex items-center space-x-1 group-hover:underline">
                      <span>Open Dashboard</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 bg-white/5 border border-white/10 border-dashed rounded-[40px] text-center flex flex-col items-center justify-center max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 text-indigo-400">
                <Compass className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">No collaborative trips yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm">
                Create a group or accept a pending invitation to start mapping paths with your friends.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Plan a Group Journey
              </button>
            </div>
          )}
        </section>

        {/* Modals */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateGroupModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleCreateGroup}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
export default CollaborativeTrips;
