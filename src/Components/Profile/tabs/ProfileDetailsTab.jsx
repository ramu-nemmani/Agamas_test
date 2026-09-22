import { useState } from "react";
import { Pen, Save, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileDetailsTab({ onProfileUpdate }) {
  const { user, updateUserProfile } = useAuth();

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: editName,
        phone: editPhone
      });
      setIsEditing(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setIsEditing(false);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-normal text-[#001e2d] mb-2">Profile Details</h2>
          <p className="text-[#001e2d]/70 text-sm">Manage your personal information.</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
          >
            <Pen className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#001e2d]/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#001e2d]/70 mb-1">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-[#001e2d] text-base"
            />
          ) : (
            <p className="text-base font-medium text-[#001e2d]/80">{user?.name || "Not provided"}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#001e2d]/70 mb-1">Email Address</label>
          <p className="text-base font-medium text-[#001e2d]/50">{user?.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#001e2d]/70 mb-1">Phone Number</label>
          {isEditing ? (
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-[#001e2d] text-base"
              placeholder="Enter phone number"
            />
          ) : (
            <p className="text-base font-medium text-[#001e2d]/80">{user?.phone || "Not provided"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
