import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../../api/settingsApi';
import toast from 'react-hot-toast';
import { Loader2, Shield, Trash2, X } from 'lucide-react';

const PERMISSIONS_LIST = [
  "SEARCH FLIGHT", "FLIGHTS", "HOTELS", "FIXED DEP.", "GROUP BOOKING", "IMPORT PNR", "FD MAKER",
  "FD CHECKER", "FD GRID VIEW", "MANAGE FIXED DEP.", "FD REPORT", "HISTORY", "QUEUES", "BOOKING HISTORY",
  "CAXN HISTORY", "BOOKING QUEUE", "CAXN QUEUE", "VERIFIED CANCELLATION QUEUE", "PAX CALENDAR",
  "USER MANAGEMENT", "ACCOUNT MANAGEMENT", "COMMISSION MANAGEMENT", "SUPPLIER MANAGEMENT",
  "STATIC - PAGE MANAGEMENT", "REPORTS", "MARKUP MANAGEMENT", "SETTINGS", "QUERY / FEEDBACK",
  "CHANGE PASSWORD", "CHANGE ROLE", "CHANGE MARKUP", "ASSIGN CREDIT", "VIEW LEDGER", "DEBIT NOTE",
  "CREDIT NOTE", "PASSENGER CALENDAR", "DEBIT NOTE TRANSACTION", "FLIGHT SALES", "FLIGHT CAXN",
  "PG REPORT", "SSR REPORT", "OUTSTANDING", "AGENT ACTIVATION", "FAILED TRANSACTION",
  "SUPPLIER USER MAPPING", "CREDIT NOTE TRANSACTION", "ADD BANK", "VIEW BANK", "RAISE PAYMENT",
  "PAYMENT QUEUE", "SMS & EMAILS", "ROLE MASTER", "PG USER MAPPING", "EDIT FOOTER LINKS",
  "PENDING USERS", "MANAGE USERS", "MANAGE COMPANY", "INVOICE REPORT", "USER SETTINGS",
  "USER PROFILE", "COMMISSION PLAN REPORT", "PROMO CODE", "MANAGE CORPORATE CODE", "JOURNAL ENTRY",
  "Top-up", "BONUS POINT", "REDEEM BONUS POINTS", "CUSTOMER BONUS DETAILS", "SEARCH HOTEL",
  "HOTEL BOOKING HISTORY", "HOTEL BOOKING TRANS", "PG CHARGES", "OFFLINE BOOKING", "FIXED DEPARTURES",
  "HOTEL BOOKING QUEUE", "HOTEL CAXN HISTORY", "CUSTOM FARE RULE", "CR QUEUE", "RCVD PAY REQ",
  "FAILED TRANSACTION PG REPORT", "MANAGE GGNFARE", "MANAGE GGN MARKUP", "GGN FARE", "TBA LIST",
  "MANAGE BOOKINGS", "FD ARCHIVE", "RESCHEDULE QUEUE", "RESCHEDULE HISTORY", "SLOW MOVING SECTOR",
  "FD_MSP_ACCESS", "FD_BUYINGPRICE_ACCESS", "FD_CXN_ACCESS", "FD_MODIFY_ACCESS", "SECTORWISE SALES",
  "HOLIDAYS PACKAGES", "HOTEL TYPE", "HOLIDAYS HOTEL", "PACKAGE LIST", "HOLIDAYS", "HOLIDAYS INQUIRY",
  "DAY-WISE SECTOR SALES", "USER SUPPLIER REPORT", "VIEW GROUP BOOKING LIST", "ADD GROUP BOOKING",
  "SUPPLIER MANAGEMENTS", "SUPPLIER SEC DATE MAP", "CBT", "CBT GROUP MASTER", "CBT LEVEL MASTER",
  "CBT RAISE REQUEST", "CBT REQUEST LIST", "FD_MARKET_FARE_ACCESS", "FD_APPROVE_ACCESS",
  "FD_PUPULATESECTOR_ACCESS", "SALES ANALYSIS", "TRAIN", "CUG", "CUG API LIST", "CUG SUPPLIER LIST",
  "CUG REQUEST LIST", "CAROUSEL_ACCESS", "HOTEL SERIES", "HOTEL SERIES MAKER", "CBT HOTEL REQUEST LIST",
  "BANNER_IMAGE_ACCESS", "HOTEL_MARKUP_ACCESS", "HOLIDAYS_APPROVE_ACCESS", "MFS REPORT", "CUG SUPPLIERS",
  "CUG PARTNER SUPPLIERS", "DOMAIN_CACHE_CLEARANCE_ACCESS", "NEGO_ACCESS", "NEGO LIST", "VISA",
  "VISA MANAGEMENTS", "VISA ENQUIRY LIST", "MANAGE VISA", "SHOW_ADDMKP_BTN_ON_TKT",
  "SHOW_SEND_MAIL_BTN_ON_TKT", "SHOW_ADD_RMK_BTN_ON_TKT", "SHOW_FARE_RULE_BTN_ON_TKT",
  "SHOW_CHECK_BOX_ON_TKT", "SHOW_PAX_DTLS_BTN_ON_TKT", "CUG ENABLED MY SUPPLIERS",
  "CUG_SUPPLIER_ENABLE_ACCESS", "ADD VEHICLE TYPE", "ALL VEHICLE LIST", "USER FARE QUOTE REPORTS",
  "FAILED HOTEL TRANSACTION"
];

export default function AdminRoleMaster() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [isMenuAccessOpen, setIsMenuAccessOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    roleCode: '',
    roleDesc: '',
    isDefault: false
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await settingsApi.getRoles();
      setRoles(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.roleCode || !formData.roleDesc) {
      toast.error('Please fill code and description');
      return;
    }
    try {
      if (editId) {
        await settingsApi.updateRole(editId, formData);
        toast.success('Role updated successfully');
      } else {
        await settingsApi.createRole(formData);
        toast.success('Role created successfully');
      }
      setFormData({ roleCode: '', roleDesc: '', isDefault: false });
      setEditId(null);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${editId ? 'update' : 'create'} role`);
    }
  };

  const handleEdit = (role: any) => {
    setFormData({ roleCode: role.roleCode, roleDesc: role.roleDesc, isDefault: role.isDefault });
    setEditId(role._id);
    setActiveMenuDropdown(null);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#1e3a8a]" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Role Master</h1>
            <p className="text-slate-500 text-sm mt-1">Manage system roles and descriptions</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">Role Code</label>
            <input 
              type="text" 
              placeholder="E.G. SUPER_ADMIN"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a]"
              value={formData.roleCode}
              onChange={(e) => setFormData({...formData, roleCode: e.target.value})}
            />
          </div>
          <div className="flex-1 min-w-[300px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">Role Description</label>
            <input 
              type="text" 
              placeholder="e.g. TRC Admin"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1e3a8a]"
              value={formData.roleDesc}
              onChange={(e) => setFormData({...formData, roleDesc: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <input 
              type="checkbox" 
              id="isDefault" 
              className="w-4 h-4 text-[#1e3a8a] rounded border-slate-300 focus:ring-[#1e3a8a]"
              checked={formData.isDefault}
              onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
            />
            <label htmlFor="isDefault" className="text-sm font-bold text-slate-700 cursor-pointer">Default</label>
          </div>
          <div className="flex gap-2 mt-5">
            <button 
              onClick={handleSave}
              className="bg-[#1e3a8a] hover:bg-[#172554] text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm"
            >
              {editId ? 'Update' : 'Save'}
            </button>
            <button 
              onClick={() => {
                setFormData({ roleCode: '', roleDesc: '', isDefault: false });
                setEditId(null);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-lg font-bold transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e3a8a] text-white">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-tl-lg">#</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Role Id</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Created By</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Role Code</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Role Description</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-tr-lg">Manage</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, idx) => (
                <tr key={role._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-semibold text-slate-700">{idx + 1}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-bold">{role.roleId || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-700">{role.createdBy?.name || 'System'}</td>
                  <td className="py-3 px-4 text-sm font-bold text-[#1e3a8a]">{role.roleCode}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{role.roleDesc}</td>
                  <td className="py-3 px-4 relative">
                    <button 
                      onClick={() => setActiveMenuDropdown(activeMenuDropdown === role._id ? null : role._id)}
                      className="bg-[#4285f4] hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors"
                    >
                      Select
                    </button>
                    {activeMenuDropdown === role._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuDropdown(null)} />
                        <div className="absolute right-4 top-10 w-36 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-2 overflow-hidden">
                          <button 
                            onClick={() => handleEdit(role)} 
                            className="w-full text-left px-4 py-2 text-sm text-[#4285f4] hover:bg-gray-50 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedRole(role);
                              setTempPermissions(role.permissions || []);
                              setIsMenuAccessOpen(true);
                              setActiveMenuDropdown(null);
                            }} 
                            className="w-full text-left px-4 py-2 text-sm text-[#4285f4] hover:bg-gray-50 font-medium transition-colors"
                          >
                            Menu access
                          </button>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button 
                            onClick={() => {
                              setDeleteConfirmId(role._id);
                              setActiveMenuDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">No roles found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isMenuAccessOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-[#4285f4] text-white px-5 py-4">
              <h2 className="text-lg font-medium">{selectedRole.roleDesc}</h2>
              <button onClick={() => setIsMenuAccessOpen(false)} className="text-white hover:text-blue-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1 bg-white">
              <label className="flex items-center border-b border-gray-100 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors sticky top-0 z-10">
                <input 
                  type="checkbox" 
                  className="mr-3 w-4 h-4 rounded border-gray-300 text-[#4285f4] focus:ring-[#4285f4]" 
                  checked={tempPermissions.length === PERMISSIONS_LIST.length}
                  onChange={(e) => {
                    if (e.target.checked) setTempPermissions([...PERMISSIONS_LIST]);
                    else setTempPermissions([]);
                  }}
                />
                <span className="text-sm font-bold text-gray-700">Select All</span>
              </label>
              
              <div className="divide-y divide-gray-100">
                {PERMISSIONS_LIST.map((perm) => (
                  <label key={perm} className="flex items-center p-3 hover:bg-blue-50/50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 rounded border-gray-300 text-[#4285f4] focus:ring-[#4285f4]" 
                      checked={tempPermissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) setTempPermissions([...tempPermissions, perm]);
                        else setTempPermissions(tempPermissions.filter(p => p !== perm));
                      }}
                    />
                    <span className="text-[13px] text-gray-700 font-medium">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setIsMenuAccessOpen(false)} 
                className="px-5 py-2 bg-[#6c757d] hover:bg-[#5a6268] text-white rounded font-medium text-sm transition-colors shadow-sm"
              >
                Close
              </button>
              <button 
                onClick={async () => {
                  try {
                    await settingsApi.updateRole(selectedRole._id, { permissions: tempPermissions });
                    toast.success('Permissions updated successfully');
                    setIsMenuAccessOpen(false);
                    fetchRoles();
                  } catch (err) {
                    toast.error('Failed to update permissions');
                  }
                }} 
                className="px-5 py-2 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white rounded font-medium text-sm transition-colors shadow-sm"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Role?</h3>
              <p className="text-sm text-gray-500 font-medium">Are you sure you want to delete this role? This action cannot be undone.</p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await settingsApi.deleteRole(deleteConfirmId);
                    toast.success('Role deleted successfully');
                    setDeleteConfirmId(null);
                    fetchRoles();
                  } catch (err) {
                    toast.error('Failed to delete role');
                  }
                }} 
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
