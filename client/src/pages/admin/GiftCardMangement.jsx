import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Eye, ToggleLeft, ToggleRight, Calendar, Tag, Percent, DollarSign, Users } from 'lucide-react';

const GiftCardManagement = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discount: '',
    minimumPurchase: '',
    validTill: '',
    maxUsage: ''
  });
  const [errors, setErrors] = useState({});

  // API base URL - adjust according to your setup
  const API_BASE = '/api/v1/giftcards';

  // Fetch gift cards
  const fetchGiftCards = async (page = 1, search = '', active = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (search) params.append('search', search);
      if (active !== 'all') params.append('active', active);

      const response = await fetch(`${API_BASE}?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setGiftCards(result.data);
        setTotalPages(result.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCards(currentPage, searchTerm, filterActive);
  }, [currentPage, searchTerm, filterActive]);

  // Handle form submission
  const handleSubmit = async () => {
    setErrors({});

    // Basic validation
    if (!formData.code || !formData.discount || !formData.validTill) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }

    if (formData.discountType === 'percentage' && parseFloat(formData.discount) > 100) {
      setErrors({ general: 'Percentage discount cannot exceed 100%' });
      return;
    }

    if (new Date(formData.validTill) <= new Date()) {
      setErrors({ general: 'Valid till date must be in the future' });
      return;
    }

    try {
      const url = modalMode === 'edit' ? `${API_BASE}/${selectedCard._id}` : API_BASE;
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          discount: parseFloat(formData.discount),
         minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
          maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchGiftCards(currentPage, searchTerm, filterActive);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    }
  };

  // Delete gift card
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gift card?')) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        fetchGiftCards(currentPage, searchTerm, filterActive);
      }
    } catch (error) {
      console.error('Error deleting gift card:', error);
    }
  };

  // Toggle gift card status
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/toggle`, {
        method: 'PATCH',
      });

      const result = await response.json();
      if (result.success) {
        fetchGiftCards(currentPage, searchTerm, filterActive);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discount: '',
      minimumPurchase: '',
      validTill: '',
      maxUsage: ''
    });
    setErrors({});
    setSelectedCard(null);
  };

  // Open modal
  const openModal = (mode, card = null) => {
    setModalMode(mode);
    setSelectedCard(card);
    
    if (mode === 'edit' && card) {
      setFormData({
        code: card.code,
        discountType: card.discountType,
        discount: card.discount.toString(),
        minimumPurchase: card.minimumPurchase.toString(),
        validTill: new Date(card.validTill).toISOString().split('T')[0],
        maxUsage: card.maxUsage ? card.maxUsage.toString() : ''
      });
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if gift card is expired
  const isExpired = (validTill) => {
    return new Date(validTill) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Card Management</h1>
          <p className="text-gray-600">Create and manage gift cards for your store</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search gift cards..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Filter */}
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterActive}
                onChange={(e) => {
                  setFilterActive(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Cards</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => openModal('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Gift Card
            </button>
          </div>
        </div>

        {/* Gift Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {giftCards.map((card) => (
              <div key={card._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Card Header */}
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{card.code}</h3>
                      <p className="text-blue-100 text-sm">
                        {card.discountType === 'percentage' ? `${card.discount}% OFF` : `₹${card.discount} OFF`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.active ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Active</span>
                      ) : (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">Inactive</span>
                      )}
                      {isExpired(card.validTill) && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">Expired</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Min Purchase: ₹{card.minimumPurchase}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Valid Till: {formatDate(card.validTill)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        Used: {card.usageCount} / {card.maxUsage || '∞'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* <button
                      onClick={() => openModal('view', card)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button> */}
                    <button
                      onClick={() => openModal('edit', card)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(card._id)}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded text-sm transition-colors"
                    >
                      {card.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(card._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {modalMode === 'create' ? 'Create Gift Card' : 
                   modalMode === 'edit' ? 'Edit Gift Card' : 'Gift Card Details'}
                </h2>

                {modalMode === 'view' ? (
                  // View Mode
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center">
                      <h3 className="text-2xl font-bold">{selectedCard.code}</h3>
                      <p className="text-lg">
                        {selectedCard.discountType === 'percentage' 
                          ? `${selectedCard.discount}% OFF` 
                          : `₹${selectedCard.discount} OFF`}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <p className={selectedCard.active ? 'text-green-600' : 'text-red-600'}>
                          {selectedCard.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <p>{selectedCard.discountType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Min Purchase:</span>
                        <p>₹{selectedCard.minimumPurchase}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Valid Till:</span>
                        <p>{formatDate(selectedCard.validTill)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Usage:</span>
                        <p>{selectedCard.usageCount} / {selectedCard.maxUsage || '∞'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <p>{formatDate(selectedCard.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Create/Edit Form
                  <div className="space-y-4">
                    {errors.general && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {errors.general}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gift Card Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., WELCOME20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Type *
                        </label>
                        <select
                          required
                          value={formData.discountType}
                          onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="amount">Fixed Amount</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Value *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          max={formData.discountType === 'percentage' ? 100 : undefined}
                          value={formData.discount}
                          onChange={(e) => setFormData({...formData, discount: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={formData.discountType === 'percentage' ? '20' : '500'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Purchase Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minimumPurchase}
                        onChange={(e) => setFormData({...formData, minimumPurchase: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid Till *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.validTill}
                        onChange={(e) => setFormData({...formData, validTill: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Usage (leave empty for unlimited)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxUsage}
                        onChange={(e) => setFormData({...formData, maxUsage: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {modalMode === 'create' ? 'Create' : 'Update'}
                      </button>
                    </div>
                  </div>
                )}

                {modalMode === 'view' && (
                 <div className="space-y-4">
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center">
    <h3 className="text-2xl font-bold">{selectedCard?.code || 'N/A'}</h3>
    <p className="text-lg">
      {selectedCard?.discountType === 'percentage' 
        ? `${selectedCard?.discount || 0}% OFF` 
        : `₹${selectedCard?.discount || 0} OFF`}
    </p>
  </div>
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span className="font-medium text-gray-700">Status:</span>
      <p className={selectedCard?.active ? 'text-green-600' : 'text-red-600'}>
        {selectedCard?.active ? 'Active' : 'Inactive'}
      </p>
    </div>
    <div>
      <span className="font-medium text-gray-700">Type:</span>
      <p>{selectedCard?.discountType || 'N/A'}</p>
    </div>
    <div>
      <span className="font-medium text-gray-700">Min Purchase:</span>
      <p>₹{selectedCard?.minimumPurchase || 0}</p>
    </div>
    <div>
      <span className="font-medium text-gray-700">Valid Till:</span>
      <p>{selectedCard?.validTill ? formatDate(selectedCard.validTill) : 'N/A'}</p>
    </div>
    <div>
      <span className="font-medium text-gray-700">Usage:</span>
      <p>{selectedCard?.usageCount || 0} / {selectedCard?.maxUsage || '∞'}</p>
    </div>
    <div>
      <span className="font-medium text-gray-700">Created:</span>
      <p>{selectedCard?.createdAt ? formatDate(selectedCard.createdAt) : 'N/A'}</p>
    </div>
  </div>
</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardManagement;