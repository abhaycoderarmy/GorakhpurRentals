import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Image, Bold, Italic, List, Eye, Users, Mail, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';

const NewsletterAdmin = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isLoading, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState('all');
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0,
    unverifiedUsers: 0,
    validEmails: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Fetch user statistics from API
  const fetchUserStats = async () => {
    setIsLoadingStats(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/newsletter/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }

      const stats = await response.json();
      setUserStats({
        totalUsers: stats.totalUsers,
        verifiedUsers: stats.verifiedUsers,
        adminUsers: stats.adminUsers,
        unverifiedUsers: stats.unverifiedUsers,
        validEmails: stats.validEmails || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to load user statistics. Please check your connection.');
      setUserStats({
        totalUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0,
        unverifiedUsers: 0,
        validEmails: 0
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  // FIXED: Handle image upload properly
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // 5MB limit
        setUploadingImage(true);
        
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const token = localStorage.getItem('token');
          const response = await fetch('/api/v1/newsletter/upload-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const result = await response.json();
          
          // Add uploaded image to state
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: result.imageUrl,
            filename: result.filename,
            originalName: result.originalName || file.name,
            size: file.size
          }]);
          
          setSuccess('Image uploaded successfully!');
          setTimeout(() => setSuccess(''), 3000);
          
        } catch (error) {
          console.error('Image upload error:', error);
          setError('Failed to upload image: ' + error.message);
        }
        
        setUploadingImage(false);
      } else {
        setError('Please select valid image files under 5MB');
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  // FIXED: Insert server-uploaded images instead of base64
  const insertImageToEditor = (imageUrl, altText = 'Newsletter Image') => {
    const imageHtml = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
    
    if (editorRef.current) {
      // Insert at cursor position
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          const fragment = range.createContextualFragment(imageHtml);
          range.deleteContents();
          range.insertNode(fragment);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // Fallback: append to end
          editorRef.current.innerHTML += imageHtml;
        }
      } else {
        // Fallback: append to end
        editorRef.current.innerHTML += imageHtml;
      }
      
      setBody(editorRef.current.innerHTML);
    }
  };

  const formatText = (command) => {
    const editor = editorRef.current;
    if (editor) {
      editor.focus();
      document.execCommand(command, false, null);
      setBody(editor.innerHTML);
    }
  };

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Please fill in both subject and message body');
      return;
    }

    if (userStats.totalUsers === 0) {
      setError('No users found in the database. Please ensure users are registered.');
      return;
    }

    const recipientCount = getRecipientCount();

    if (recipientCount === 0) {
      setError(`No ${selectedUsers} users found to send newsletter to.`);
      return;
    }

    const confirmSend = window.confirm(
      `Are you sure you want to send this newsletter to ${recipientCount} ${selectedUsers} users?`
    );

    if (!confirmSend) return;

    setSending(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the body content as-is (no complex processing needed)
      const emailBody = body;

      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          body: emailBody,
          recipientType: selectedUsers
        })
      });

      const result = await response.json();

      if (response.ok) {
        const successMessage = `Newsletter sent successfully!\n\nStats:\n- Total Recipients: ${result.stats.totalRecipients}\n- Successfully Sent: ${result.stats.successCount}\n- Failed: ${result.stats.failureCount}\n- Success Rate: ${result.stats.successRate}`;
        
        setSuccess(successMessage);
        
        // Clear form on success
        setSubject('');
        setBody('');
        setUploadedImages([]);
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        
        // Refresh user stats
        fetchUserStats();
      } else {
        throw new Error(result.error || 'Failed to send newsletter');
      }
    } catch (error) {
      console.error('Newsletter sending error:', error);
      setError('Error sending newsletter: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const generateEmailPreview = () => {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Gorakhpur Rentals</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your trusted rental partner</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin-bottom: 20px; font-size: 24px; font-weight: 600;">${subject}</h2>
          <div style="color: #4a5568; line-height: 1.6; font-size: 16px;">
            ${body}
          </div>
        </div>
        <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; margin: 0; font-size: 14px;">© 2025 Gorakhpur Rentals. All rights reserved.</p>
          <div style="margin-top: 15px;">
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 14px;">Visit Website</a>
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 14px;">Contact Us</a>
          </div>
        </div>
      </div>
    `;
  };

  const getRecipientCount = () => {
    switch (selectedUsers) {
      case 'verified':
        return userStats.verifiedUsers;
      case 'unverified':
        return userStats.unverifiedUsers;
      case 'all':
      default:
        return userStats.totalUsers;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Mail className="mr-3 text-blue-600" size={32} />
                Newsletter Management
              </h1>
              <p className="text-gray-600 mt-2">Send customized newsletters to your registered users</p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
            
            {/* User Stats */}
            <div className="flex items-center space-x-6">
              <button
                onClick={fetchUserStats}
                disabled={isLoadingStats}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Refresh Stats"
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingStats ? 'animate-spin' : ''}`} />
              </button>
              
              {isLoadingStats ? (
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-400">Loading...</div>
                  <div className="text-sm text-gray-400">User Stats</div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalUsers}</div>
                    <div className="text-sm text-gray-500">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{userStats.verifiedUsers}</div>
                    <div className="text-sm text-gray-500">Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{userStats.unverifiedUsers}</div>
                    <div className="text-sm text-gray-500">Unverified</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Newsletter Composer */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Send className="mr-2 text-blue-600" size={20} />
              Compose Newsletter
            </h2>

            {/* Recipient Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Send to:</label>
              <select 
                value={selectedUsers} 
                onChange={(e) => setSelectedUsers(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoadingStats}
              >
                <option value="all">All Users ({userStats.totalUsers})</option>
                <option value="verified">Verified Users Only ({userStats.verifiedUsers})</option>
                <option value="unverified">Unverified Users ({userStats.unverifiedUsers})</option>
              </select>
              
              {getRecipientCount() === 0 && !isLoadingStats && (
                <p className="text-sm text-red-600 mt-1">
                  No {selectedUsers} users found in the database.
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter newsletter subject..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="border border-gray-300 rounded-t-md p-3 bg-gray-50 flex flex-wrap gap-2 mb-0">
              <button
                onClick={() => formatText('bold')}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => formatText('insertUnorderedList')}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <div className="border-l border-gray-300 mx-2"></div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded hover:bg-gray-200 transition-colors flex items-center"
                title="Upload Image"
              >
                <Upload size={16} className="mr-1" />
                Image
              </button>
            </div>

            {/* Message Body Editor */}
            <div className="mb-6">
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setBody(e.target.innerHTML)}
                className="w-full min-h-64 px-4 py-3 border border-gray-300 border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '200px' }}
                suppressContentEditableWarning={true}
                placeholder="Write your newsletter content here..."
              />
            </div>

            {/* Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Uploaded Images */}
           {uploadedImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Image className="mr-2" size={16} />
                  Uploaded Images ({uploadedImages.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => insertImageToEditor(image.url, image.originalName)}
                        title="Click to insert into newsletter"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                        {image.originalName.length > 20 ? image.originalName.substring(0, 20) + '...' : image.originalName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Eye className="mr-2" size={18} />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              
              <button
                onClick={handleSendNewsletter}
                disabled={isLoading || !subject.trim() || !body.trim() || getRecipientCount() === 0 || isLoadingStats}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="mr-2" size={18} />
                )}
                {isLoading ? 'Sending...' : `Send to ${getRecipientCount()} Users`}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Eye className="mr-2 text-green-600" size={20} />
              Email Preview
            </h2>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b">
                <strong>To:</strong> {selectedUsers === 'all' ? 'All Users' : selectedUsers === 'verified' ? 'Verified Users' : 'Unverified Users'} 
                ({getRecipientCount()})
              </div>
              <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b">
                <strong>Subject:</strong> {subject || 'Newsletter Subject'}
              </div>
              <div 
                className="p-4 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ 
                  __html: subject || body ? generateEmailPreview() : '<div class="text-gray-400 text-center py-8">Preview will appear here...</div>' 
                }}
              />
            </div>

            {/* Real-time Stats & Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">📊 Current Stats</h3>
              <div className="text-sm text-blue-700 space-y-1 mb-3">
                <p>• Total registered users: <strong>{userStats.totalUsers}</strong></p>
                <p>• Verified users: <strong>{userStats.verifiedUsers}</strong></p>
                <p>• Unverified users: <strong>{userStats.unverifiedUsers}</strong></p>
                <p>• Selected audience: <strong>{getRecipientCount()} users</strong></p>
              </div>
              
              <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Quick Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Keep subject lines under 50 characters for better open rates</li>
                <li>• Click on uploaded images to insert them into your newsletter</li>
                <li>• Use the formatting toolbar to style your content</li>
                <li>• Preview your newsletter before sending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterAdmin;