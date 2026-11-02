"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";

interface PostAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostAchievementModal({
  isOpen,
  onClose,
}: PostAchievementModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createAchievement = useMutation(api.achievements.createAchievement);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill out both title and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      let storageId = undefined;

      if (file) {
        const uploadUrl = await generateUploadUrl();
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadResult.ok) throw new Error("File upload failed.");
        const { storageId: uploadedStorageId } = await uploadResult.json();
        storageId = uploadedStorageId;
      }

      await createAchievement({
        title: title.trim(),
        description: description.trim(),
        proofStorageId: storageId,
      });

      setTitle("");
      setDescription("");
      setFile(null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Icons.Trophy className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Share Achievement</h2>
              <p className="text-xs text-slate-400">Celebrate a win with your campus community</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <Icons.X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
              Achievement Title <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Won 1st Place at Smart India Hackathon 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
              Description <span className="text-teal-600">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe your achievement — team, tech stack, impact, or what you built..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              required
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
              Proof / Certificate
              <span className="text-slate-400 font-normal ml-2">Optional</span>
            </label>
            <label className="block w-full rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 transition cursor-pointer bg-slate-50 hover:bg-teal-50/20 p-5">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    <Icons.Paperclip className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">{Math.round(file.size / 1024)} KB · Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <Icons.Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-500">Drop a file or click to browse</p>
                  <p className="text-xs text-slate-400 mt-0.5">Supports images and PDF certificates</p>
                </div>
              )}
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-teal text-white text-sm font-bold shadow-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Icons.Sparkles className="w-4 h-4" />
                  Share Achievement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
