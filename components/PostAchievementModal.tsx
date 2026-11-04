"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";
import { Alert, Modal, Spinner } from "@/components/ui";
import { errorMessage } from "@/lib/errors";

interface PostAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostAchievementModal({ isOpen, onClose }: PostAchievementModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createAchievement = useMutation(api.achievements.createAchievement);

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
    } catch (err) {
      setError(errorMessage(err, "Something went wrong."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Share an achievement"
      description="Faculty will review it before it shows as verified."
      icon={<Icons.Trophy className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        {error && <Alert tone="error">{error}</Alert>}

        <div>
          <label htmlFor="achievement-title" className="field-label">
            Title
          </label>
          <input
            id="achievement-title"
            type="text"
            placeholder="e.g. First place, Smart India Hackathon internal round"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="achievement-description" className="field-label">
            Description
          </label>
          <textarea
            id="achievement-description"
            rows={4}
            placeholder="Who was on the team, what you built and what came of it."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
            required
          />
        </div>

        <div>
          <span className="field-label">
            Proof or certificate <span className="field-hint ml-1">Optional</span>
          </span>
          <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line-strong bg-sunken/50 p-4 transition hover:border-royal hover:bg-royal-tint/40">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="sr-only"
            />
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-royal">
              <Icons.Paperclip className="h-5 w-5" />
            </span>
            {file ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{file.name}</span>
                <span className="block text-xs text-muted">{Math.round(file.size / 1024)} KB. Click to change.</span>
              </span>
            ) : (
              <span>
                <span className="block text-sm font-semibold text-ink">Choose a file</span>
                <span className="block text-xs text-muted">An image or a PDF certificate</span>
              </span>
            )}
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <Spinner />
                Posting
              </>
            ) : (
              "Post achievement"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
