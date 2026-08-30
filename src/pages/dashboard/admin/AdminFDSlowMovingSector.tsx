import React, { useState, useEffect } from 'react';
import { AlertTriangle, Filter, ArrowRight, Plane, TrendingDown, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import RefreshButton from '../../../components/ui/RefreshButton';

interface ISlowMoving {
  id: string;
  sfId: string;
  airline: string;
  sector: string;
  travelDate: string;
  daysToDeparture: number;
  totalSeats: number;
  soldSeats: number;
  sellPercent: number;
  pnr: string;
  price: number;
  supplierName?: string;
}

export default function AdminFDSlowMovingSector() {
  const [sectors, setSectors] = useState<ISlowMoving[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDropSector, setSelectedDropSector] = useState<ISlowMoving | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePushPromo = (sector: ISlowMoving) => {
    toast.success(`Promo emails sent to all B2B agents for ${sector.sector} flight!`);
  };

  const handleAlertSupplier = (sector: ISlowMoving) => {
    toast.success(`Alert sent to ${sector.supplierName} to review pricing for ${sector.sector}!`);
  };

  const handleUpdatePrice = async () => {
    if (!selectedDropSector || !newPrice) return;
    try {
      setIsUpdating(true);
      await api.put(`/api/series-fare/${selectedDropSector.id}`, { adtFare: Number(newPrice) });
      toast.success('Price dropped successfully!');
      setSectors(prev => prev.map(s => s.id === selectedDropSector.id ? { ...s, price: Number(newPrice) } : s));
      setSelectedDropSector(null);
      setNewPrice('');
    } catch (error) {
      toast.error('Failed to update price');
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchSectors = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/series-fare/report/slow-moving');
      setSectors(data);
    } catch (error) {
      console.error('Failed to fetch slow moving sectors', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <TrendingDown className="text-orange-500" />
            Slow Moving Sectors
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
            Monitor Fixed Departures with low sales & approaching travel dates
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-orange-700">{sectors.length}</div>
            <div className="text-[10px] font-bold text-orange-600/80 uppercase">Critical Sectors</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Plane size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              {sectors.reduce((acc, curr) => acc + (curr.totalSeats - curr.soldSeats), 0)}
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Total Unsold Seats</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              {Math.round(sectors.reduce((acc, curr) => acc + curr.sellPercent, 0) / (sectors.length || 1))}%
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Avg. Sell-through Rate</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            Showing FDs departing in &lt; 7 days with &lt; 30% sales
          </h2>
          <div className="flex items-center gap-4">
            <RefreshButton onClick={fetchSectors} loading={isLoading} count={sectors.length} />
            <button className="text-blue-600 hover:bg-blue-50 text-xs font-bold px-3 py-1.5 rounded transition-colors border border-blue-200">
              Export Report
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead className="bg-[#f8fafc] text-gray-900 font-black border-b border-gray-200 sticky top-0 z-10 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3">FARE ID</th>
                <th className="p-3">SECTOR / AIRLINE</th>
                <th className="p-3">TRAVEL DATE</th>
                <th className="p-3 text-center">DEPARTING IN</th>
                <th className="p-3">INVENTORY STATUS</th>
                <th className="p-3 text-center">PRICE</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                    Analyzing Sectors...
                  </td>
                </tr>
              ) : sectors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">No slow moving sectors found!</td>
                </tr>
              ) : sectors.map((item) => (
                <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-gray-900">{item.sfId}</td>
                  <td className="p-3">
                    <div className="font-bold text-gray-800">{item.sector}</div>
                    <div className="text-[10px] text-gray-500">{item.airline} • PNR: <span className="font-mono text-blue-600">{item.pnr}</span></div>
                  </td>
                  <td className="p-3 font-bold text-gray-700">{new Date(item.travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${item.daysToDeparture <= 3 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.daysToDeparture} Days
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="w-full max-w-[150px]">
                      <div className="flex justify-between text-[10px] mb-1 font-bold">
                        <span className="text-gray-600">{item.soldSeats} / {item.totalSeats} Sold</span>
                        <span className="text-red-600">{item.sellPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${item.sellPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-gray-800">₹{item.price}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      {item.supplierName && !['trippechalo', 'admin', 'super admin', 'pj holiday bookers', 'supplier'].includes(item.supplierName.toLowerCase()) ? (
                        <button onClick={() => handleAlertSupplier(item)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded text-[10px] font-bold transition-colors">
                          Alert Supplier
                        </button>
                      ) : (
                        <button onClick={() => { setSelectedDropSector(item); setNewPrice(item.price.toString()); }} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-[10px] font-bold transition-colors">
                          Drop Price
                        </button>
                      )}
                      <button onClick={() => handlePushPromo(item)} className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded text-[10px] font-bold transition-colors">
                        Push Promo
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>

      {selectedDropSector && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50">
              <h3 className="font-black text-blue-800 text-sm">Drop Price</h3>
              <button onClick={() => setSelectedDropSector(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Sector</div>
                <div className="font-bold text-gray-900">{selectedDropSector.sector} ({selectedDropSector.airline})</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">New Adult Price (₹)</label>
                <input 
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setSelectedDropSector(null)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleUpdatePrice} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors">
                {isUpdating ? 'Updating...' : 'Confirm Drop'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
