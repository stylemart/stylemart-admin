// ============================================================
// IMAGE UPLOAD COMPONENT
// Drag & drop, preview, edit, delete
// ============================================================

"use client";

import { useState, useRef } from "react";
import { FiUpload, FiX, FiImage, FiEdit2 } from "react-icons/fi";

export default function ImageUpload({ value, onChange, label = "Product Image", required = false }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Get auth token
      const token = localStorage.getItem("token");

      // Upload to API
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Update preview and call onChange
      setPreview(data.url);
      onChange(data.url);
    } catch (err) {
      setError(err.message || "Failed to upload image");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle file input change
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  // Remove image
  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Update preview when value changes externally
  if (value !== preview && value) {
    setPreview(value);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {preview ? (
        // Image Preview
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
                  title="Change image"
                >
                  <FiEdit2 size={18} className="text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50"
                  title="Remove image"
                >
                  <FiX size={18} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click image to change or remove</p>
        </div>
      ) : (
        // Upload Area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FiUpload size={32} className="text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {/* Manual URL input (fallback) */}
      <div className="mt-3">
        <input
          type="url"
          value={value || ""}
          onChange={(e) => {
            setPreview(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Or enter image URL manually"
          className="input-field text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can also paste an image URL directly
        </p>
      </div>
    </div>
  );
}
