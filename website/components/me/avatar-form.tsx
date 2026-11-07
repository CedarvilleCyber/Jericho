import { authClient } from "@/lib/auth-client";
import { IconUpload, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { uploadAvatar } from "@/lib/uploads/create";
import { removeAvatar } from "@/lib/uploads/delete";

export default function AvatarForm() {
    const { data, refetch } = authClient.useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Show the unsaved preview if there is one, otherwise the saved avatar
    const avatarUrl = previewUrl ?? data?.user.image ?? null;

    // Release the previous preview's object URL when it's replaced or on unmount
    useEffect(() => {
        if (!previewUrl) return;
        return () => URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;
        setError("");
        setSuccess("");
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;
        setError(""); setSuccess(""); setLoading(true);
        try {
        const formData = new FormData();
        formData.append("avatar", selectedFile);
        const result = await uploadAvatar(formData);
        if (result.error) {
            setError(result.error);
        } else {
            await refetch();
            setPreviewUrl(null);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSuccess("Avatar updated successfully!");
        }
        } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
        setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm("Remove your avatar?")) return;
        setError(""); setSuccess(""); setLoading(true);
        try {
            const result = await removeAvatar();
            if (result.error) {
                setError(result.error);
            } else {
                await refetch();
                setPreviewUrl(null);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setSuccess("Avatar removed.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                        <div className="form-control flex flex-col gap-2">
                            <div className="label">
                                <span className="label-text">Avatar</span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="group relative self-center w-24 h-24 rounded-full overflow-hidden bg-base-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                aria-label="Change profile picture"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="w-full h-full flex items-center justify-center">
                                        <IconUser size={40} />
                                    </span>
                                )}
                                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                    <IconUpload size={28} />
                                </span>
                            </button>
                        </div>

                        {error && <p className="text-sm text-error">{error}</p>}
                        {success && <p className="text-sm text-success">{success}</p>}

                        <div className="flex gap-2 justify-end">
                            {data?.user.image && (
                                <button
                                    type="button"
                                    className="btn btn-ghost text-error mr-auto"
                                    onClick={handleRemove}
                                    disabled={loading}
                                >
                                    Remove Avatar
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => router.push("/")}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading && (
                                <span className="loading loading-spinner loading-xs" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
