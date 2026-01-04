import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Navbar } from "@/layout/Navbar";
import { Footer } from "@/layout/Footer";
import { X } from "lucide-react";

export const Upload = () => {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Upload progress
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState(0);

  const fileInputRef = useRef(null);

  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;

  /* ---------- ACCESS CHECK ---------- */
  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setHasAccess(false);
        setCheckingAccess(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setHasAccess(!error && profile?.role === "admin");
      setCheckingAccess(false);
    };

    checkAccess();
  }, []);

  /* ---------- ACCESS STATES ---------- */
  if (checkingAccess) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-32 flex items-center justify-center">
          <p className="text-muted-foreground">Checking access...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-32 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Access Denied 🚫</h1>
            <p className="text-muted-foreground">
              You don’t have access to this page.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ---------- REMOVE IMAGE ---------- */
  const removeFile = (index) => {
    if (loading) return;
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- UPLOAD ---------- */
  const handleUpload = async () => {
    if (!imageName || !imageType || !description) {
      alert("Please fill all fields");
      return;
    }

    if (selectedFiles.length === 0) {
      alert("Please select images");
      return;
    }

    setLoading(true);
    setCurrentUploadingIndex(0);

    try {
      const finalPriority = priority === "" ? 0 : Number(priority);

      // 1️⃣ Insert description
      const { data: desc, error } = await supabase
        .from("descriptions")
        .insert({
          image_name: imageName,
          image_type: imageType,
          description_details: description,
          priority: finalPriority,
          created_on: Date.now(),
        })
        .select("id")
        .single();

      if (error) throw error;

      // 2️⃣ Upload images one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentUploadingIndex(i + 1);

        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const res = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: "POST",
          body: formData,
        });

        const uploaded = await res.json();

        await supabase.from("image_urls").insert({
          description_id: desc.id,
          image_url: uploaded.secure_url,
          created_on: Date.now(),
        });
      }

      alert("Upload successful ✅");

      setImageName("");
      setImageType("");
      setDescription("");
      setPriority("");
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
      setCurrentUploadingIndex(0);
    }
  };

  const progressPercent =
    selectedFiles.length > 0
      ? Math.round(
          (currentUploadingIndex / selectedFiles.length) * 100
        )
      : 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen py-32 px-4 bg-background">
        <div className="max-w-3xl mx-auto space-y-6">

          <h1 className="text-3xl font-bold text-center">
            Upload Images (Admin)
          </h1>

          <input
            placeholder="Image name"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-border"
          />

          {/* SELECT TYPE */}
          <div className="relative">
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-border
                         bg-background appearance-none cursor-pointer"
            >
              <option value="" disabled>Select type</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="other">Other</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <textarea
            rows={4}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-border"
          />

          <input
            type="text"
            inputMode="numeric"
            placeholder="Priority (optional)"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value.replace(/\D/g, ""))
            }
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-border"
          />

          {/* FILE PICKER */}
          <div
            onClick={() => !loading && fileInputRef.current.click()}
            className={`border-2 border-dashed p-8 rounded-xl text-center cursor-pointer
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}
            `}
          >
            Click to select images
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept="image/*"
              onChange={(e) =>
                setSelectedFiles(Array.from(e.target.files || []))
              }
            />
          </div>

          {/* PREVIEWS */}
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative border rounded-xl p-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  <p className="mt-1 text-xs truncate text-muted-foreground">
                    {file.name}
                  </p>

                  {!loading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 🔥 UPLOAD PROGRESS */}
          {loading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Uploading image {currentUploadingIndex} of {selectedFiles.length}
              </p>

              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold
                       hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

        </div>
      </main>

      <Footer />
    </>
  );
};
