import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Receipt, AlertCircle, CheckCircle, Car } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface VehicleCategory {
  id: string;
  name: string;
  base_rate: number;
  creation_fee: number;
}

interface TollPass {
  id: string;
  vehicle_number: string;
  category_id: string;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'expired' | 'cancelled';
  vehicle_categories?: {
    name: string;
    base_rate: number;
  };
}

const VEHICLE_CATEGORIES: VehicleCategory[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Car', base_rate: 10, creation_fee: 100 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Motorcycle', base_rate: 5, creation_fee: 50 },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Bus', base_rate: 20, creation_fee: 200 },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Truck', base_rate: 25, creation_fee: 250 },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Heavy Vehicle', base_rate: 30, creation_fee: 300 }
];

export function ReceiptGeneration() {
  const { user } = useAuth();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [existingPass, setExistingPass] = useState<TollPass | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [searchResults, setSearchResults] = useState<TollPass[]>([]);

  useEffect(() => {
    if (vehicleNumber.length >= 3) {
      searchPasses();
    } else {
      setSearchResults([]);
    }
  }, [vehicleNumber]);

  useEffect(() => {
    calculateTotal();
  }, [selectedCategory, existingPass]);

  async function searchPasses() {
    try {
      const { data, error } = await supabase
        .from('toll_passes')
        .select(`
          *,
          vehicle_categories (
            name,
            base_rate
          )
        `)
        .ilike('vehicle_number', `%${vehicleNumber}%`)
        .eq('status', 'active');

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error('Error searching passes:', err);
    }
  }

  function calculateTotal() {
    if (!selectedCategory) return;
    
    const category = VEHICLE_CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return;

    let total = category.base_rate;
    if (!existingPass) {
      total += category.creation_fee;
    }

    setTotalAmount(total);
  }

  async function handlePassSelection(pass: TollPass) {
    setExistingPass(pass);
    setVehicleNumber(pass.vehicle_number);
    setSelectedCategory(pass.category_id);
    setSearchResults([]);
  }

  async function createNewPass() {
    if (!user || !selectedCategory || !vehicleNumber) return;

    try {
      setLoading(true);
      setError(null);

      const { data: pass, error: passError } = await supabase
        .from('toll_passes')
        .insert([{
          vehicle_number: vehicleNumber,
          category_id: selectedCategory,
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          status: 'active',
          created_by: user.id
        }])
        .select()
        .single();

      if (passError) throw passError;
      setExistingPass(pass);
      setSuccess('Pass created successfully!');
    } catch (err) {
      console.error('Error creating pass:', err);
      setError('Failed to create pass');
    } finally {
      setLoading(false);
    }
  }

  async function generateReceipt() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Generate receipt number using database function
      const { data: receiptNumberData, error: receiptNumberError } = await supabase
        .rpc('generate_receipt_number');

      if (receiptNumberError) throw receiptNumberError;
      
      const receiptNumber = receiptNumberData;

      // Create transaction record with receipt number
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          pass_id: existingPass?.id || null,
          amount: totalAmount,
          processed_by: user.id,
          notes: `Receipt for vehicle ${vehicleNumber}`,
          receipt_number: receiptNumber
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Generate PDF receipt
      const receiptElement = document.getElementById('receipt-preview');
      if (receiptElement) {
        const canvas = await html2canvas(receiptElement);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${receiptNumber}.pdf`);
      }

      setSuccess('Receipt generated successfully!');
      setReceiptGenerated(true);
    } catch (err) {
      console.error('Error generating receipt:', err);
      setError('Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Receipt</h1>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-green-700">{success}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Vehicle Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Number
              </label>
              <div className="mt-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter vehicle number..."
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm">
                  {searchResults.map((pass) => (
                    <button
                      key={pass.id}
                      onClick={() => handlePassSelection(pass)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{pass.vehicle_number}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {pass.vehicle_categories?.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Category Selection */}
            {!existingPass && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {VEHICLE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - Base Rate: ${category.base_rate}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fee Breakdown */}
            {selectedCategory && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Rate:</span>
                    <span>${VEHICLE_CATEGORIES.find(c => c.id === selectedCategory)?.base_rate}</span>
                  </div>
                  {!existingPass && (
                    <div className="flex justify-between">
                      <span>Creation Fee:</span>
                      <span>${VEHICLE_CATEGORIES.find(c => c.id === selectedCategory)?.creation_fee}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span>${totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!existingPass && selectedCategory && vehicleNumber && (
                <button
                  onClick={createNewPass}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Pass
                </button>
              )}

              {(existingPass || (selectedCategory && vehicleNumber)) && !receiptGenerated && (
                <button
                  onClick={generateReceipt}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Bill Paid & Generate Receipt
                </button>
              )}
            </div>

            {/* Receipt Preview */}
            {(existingPass || selectedCategory) && (
              <div id="receipt-preview" className="mt-8 border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Toll Receipt</h2>
                  <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Vehicle Number:</span>
                    <span>{vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Vehicle Category:</span>
                    <span>
                      {VEHICLE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Base Rate:</span>
                    <span>
                      ${VEHICLE_CATEGORIES.find(c => c.id === selectedCategory)?.base_rate}
                    </span>
                  </div>
                  {!existingPass && (
                    <div className="flex justify-between">
                      <span className="font-medium">Creation Fee:</span>
                      <span>
                        ${VEHICLE_CATEGORIES.find(c => c.id === selectedCategory)?.creation_fee}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span>${totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}