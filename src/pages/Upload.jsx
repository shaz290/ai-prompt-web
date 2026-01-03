import { useState, useEffect, useRef } from "react";

export const Upload = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Local preview
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...previews]);

    setUploading(true);

    try {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "ai-prompt-web");
        data.append("cloud_name", "dxcr7mxzw");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dxcr7mxzw/image/upload",
          {
            method: "POST",
            body: data,
          }
        );

        if (!res.ok) throw new Error("Upload failed");

        const uploaded = await res.json();
        console.log("Uploaded URL:", uploaded.secure_url);
      }

      showToast("Images uploaded successfully ✅", "success");
    } catch (err) {
      console.error(err);
      showToast("Upload failed ❌", "error");
    } finally {
      setUploading(false);
    }
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [images]);

  return (
    <div className="file-upload relative">
      {/* Toast */}
      {toast.show && (
        <div
          className={`toast ${
            toast.type === "success" ? "toast-success" : "toast-error"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div
        className={`upload-container cursor-pointer ${
          uploading ? "opacity-50 pointer-events-none" : ""
        }`}
        onClick={() => fileInputRef.current.click()}
      >
        <p>{uploading ? "Uploading..." : "Click to choose images"}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Preview Section */}
      <div className="preview-grid">
        {images.map((img, index) => (
          <div key={index} className="preview-item">
            <img src={img.url} alt={img.name} />
            <p>{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
