import React, { useState } from 'react';
import { X, Save, UserCog, Shield } from 'lucide-react';

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (roles: string[]) => Promise<void>;
}

const AVAILABLE_ROLES = [
  { id: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full system access', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'SUB_ADMIN', label: 'TRC Admin', description: 'Administrative access', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'B2B_AGENT', label: 'TRC B2B', description: 'B2B Agent access', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'SUPPLIER_AGENT', label: 'Supplier Agent', description: 'Supplier access', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'USER', label: 'Normal User', description: 'Basic B2C user access', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

export default function ManageRolesModal({ isOpen, onClose, user, onSave }: ManageRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user?.roles?.length ? user.roles : user?.role ? [user.role] : []);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const toggleRole = (roleId: string) => {
    const singleRoles = ['SUPER_ADMIN', 'SUB_ADMIN', 'USER'];

    if (singleRoles.includes(roleId)) {
      setSelectedRoles([roleId]);
    } else {
      setSelectedRoles(prev => {
        let newRoles = prev.filter(r => !singleRoles.includes(r));
        if (newRoles.includes(roleId)) {
          newRoles = newRoles.filter(r => r !== roleId);
        } else {
          newRoles.push(roleId);
        }
        return newRoles;
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedRoles);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-[#0c1a40] to-blue-900 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <UserCog size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">Manage Access</h2>
              <p className="text-xs text-blue-200 font-medium">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">Select Roles</p>
          
          <div className="space-y-3">
            {AVAILABLE_ROLES.map(role => {
              const isSelected = selectedRoles.includes(role.id);
              return (
                <div 
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected ? `${role.color} shadow-sm` : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-current bg-current text-white' : 'border-gray-300'
                  }`}>
                    {isSelected && <Shield size={12} className="text-white fill-current" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${isSelected ? 'text-current' : 'text-gray-800'}`}>{role.label}</h4>
                    <p className={`text-xs font-semibold ${isSelected ? 'opacity-80' : 'text-gray-400'}`}>{role.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || selectedRoles.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0c1a40] hover:bg-[#0c1a40]/90 text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Roles'}
          </button>
        </div>
      </div>
    </div>
  );
}
