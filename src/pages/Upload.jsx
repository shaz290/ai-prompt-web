import { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export const Upload = () => {
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState("");
  const [description, setDescription] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

    const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;


  // 🔹 Upload handler (runs ONLY when button clicked)
  const handleUpload = async () => {
    if (!imageName || !imageType || !description) {
      alert("Please fill all fields");
      return;
    }

    if (selectedFiles.length === 0) {
      alert("Please select images first");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Insert description
      const { data: desc, error } = await supabase
        .from("descriptions")
        .insert({
          image_name: imageName,
          image_type: imageType,
          description_details: description,
          created_on: Date.now(),
        })
        .select("id")
        .single();

      if (error) throw error;

      // 2️⃣ Upload each image
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ai-prompt-web");

        const res = await fetch(
          CLOUDINARY_UPLOAD_URL,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploaded = await res.json();

        // 3️⃣ Save image URL in Supabase
        await supabase.from("image_urls").insert({
          description_id: desc.id,
          image_url: uploaded.secure_url,
          created_on: Date.now(),
        });

        setImages((prev) => [...prev, uploaded.secure_url]);
      }

      alert("Upload successful ✅");

      // Reset form
      setImageName("");
      setImageType("");
      setDescription("");
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-24 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Upload Images</h1>
          <p className="text-muted-foreground">
            Add details and upload images to Cloudinary
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface rounded-3xl shadow-lg p-8 space-y-6">

          {/* Image Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Image Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. shazimages"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
            />
          </div>

          {/* Image Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Image Type
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
            >
              <option value="">Select category</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
              <option value="child">Child</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write a detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Select Images Box */}
          <div
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition
              ${loading ? "opacity-50 pointer-events-none" : "hover:border-primary"}
            `}
          >
            <p className="text-lg font-medium">
              Click to select images
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              PNG, JPG, JPEG supported
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={(e) =>
                setSelectedFiles(Array.from(e.target.files || []))
              }
            />
          </div>

          {/* Selected files info */}
          {selectedFiles.length > 0 && (
            <p className="text-sm text-center text-muted-foreground">
              {selectedFiles.length} image(s) selected
            </p>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
            className={`w-full py-4 rounded-xl font-semibold transition
              ${
                loading || selectedFiles.length === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-white hover:opacity-90"
              }
            `}
          >
            {loading ? "Uploading..." : "Upload Images"}
          </button>
        </div>

        {/* Preview Grid */}
        {images.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Uploaded Images
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden shadow-md bg-surface"
                >
                  <img
                    src={url}
                    alt="uploaded"
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
