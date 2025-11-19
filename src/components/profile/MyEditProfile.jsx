import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { userAPI } from "../../services/authService";
import { IoArrowBack } from "react-icons/io5";

const MyEditProfile = ({ onClose, onUpdate, currentUser }) => {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [imageFile, setImageFile] = useState(null);

	const [formData, setFormData] = useState({
		name: "",
		bio: "",
		phone_no: "",
	});

	const [previewImage, setPreviewImage] = useState("");

	// Load initial user data
	useEffect(() => {
		const u = currentUser || user;
		if (u) {
			setFormData({
				name: u.name || "",
				bio: u.bio || "",
				phone_no: u.phone_no || "",
			});
			setPreviewImage(u.image_url || "");
		}
	}, [currentUser, user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Upload Image Preview
	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Invalid image type");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error("Max size 5MB");
			return;
		}

		setImageFile(file);

		const reader = new FileReader();
		reader.onloadend = () => setPreviewImage(reader.result);
		reader.readAsDataURL(file);
	};

	// Submit Update
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Name is required");
			return;
		}

		setIsLoading(true);

		try {
			const previous = currentUser || user;
			let uploadedImageUrl = null;
			let profileUpdated = false;

			// 1. IMAGE UPLOAD IF CHANGED
			if (imageFile) {
				const imgRes = await userAPI.uploadPicture(imageFile);

				uploadedImageUrl =
					imgRes?.image_url ||
					imgRes?.url ||
					imgRes?.data?.url ||
					null;

				if (!uploadedImageUrl) {
					throw new Error("Image upload failed (no URL returned)");
				}

				profileUpdated = true; // image update is considered a profile update
			}

			// 2. CHECK IF TEXT FIELDS CHANGED
			const textChanged =
				formData.name !== previous?.name ||
				formData.bio !== previous?.bio ||
				formData.phone_no !== previous?.phone_no;

			let updatedUser = previous;

			// 3. UPDATE PROFILE ONLY IF TEXT CHANGED
			if (textChanged) {
				const res = await userAPI.updateProfile(formData);
				updatedUser = res?.user || res?.data?.user || res;
				profileUpdated = true;
			}

			// 4. If NOTHING changed → skip everything
			if (!profileUpdated) {
				toast.info("No changes to update");
				onClose();
				return;
			}

			// 5. Merge final user object safely
			const finalUser = {
				...updatedUser,
				image_url:
					uploadedImageUrl ||
					updatedUser?.image_url ||
					previous?.image_url ||
					"",
			};

			// Send back to parent
			if (onUpdate) onUpdate(finalUser);

			toast.success("Profile updated!");
			onClose();
		} catch (err) {
			console.log("PROFILE UPDATE ERROR:", err);

			const message =
				err?.message ||
				err?.response?.data?.error ||
				"Failed to update profile";

			toast.error(`Here is the issue: ${message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) onClose();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Escape") onClose();
	};

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const nameFirstLetter = formData.name?.charAt(0)?.toUpperCase() || "U";

	return (
		<div
			className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
			onClick={handleBackdropClick}
		>
			<div className="bg-white rounded-xl w-full max-w-md p-6">
				<div className="flex items-center justify-between mb-6">
					<button
						onClick={onClose}
						className="p-1 text-xl hover:bg-orange-500 hover:text-white rounded-full"
					>
						<IoArrowBack />
					</button>
					<h2 className="font-bold text-lg">Edit Profile</h2>
					<div className="w-8"></div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Avatar */}
					<div className="flex justify-center mb-4">
						<div className="relative">
							{previewImage ? (
								<img
									src={previewImage}
									className="w-24 h-24 rounded-full object-cover border"
								/>
							) : (
								<div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
									{nameFirstLetter}
								</div>
							)}

							<button
								type="button"
								className="absolute -bottom-2 -right-2 bg-orange-500 p-2 rounded-full text-white"
								onClick={() =>
									document
										.getElementById("uploadInput")
										.click()
								}
							>
								📷
							</button>

							<input
								id="uploadInput"
								type="file"
								className="hidden"
								accept="image/*"
								onChange={handleImageUpload}
							/>
						</div>
					</div>

					{/* Name */}
					<input
						type="text"
						name="name"
						className="w-full border p-3 rounded-lg"
						value={formData.name}
						onChange={handleChange}
						required
					/>

					{/* Bio */}
					<textarea
						name="bio"
						rows="3"
						className="w-full border p-3 rounded-lg"
						value={formData.bio}
						onChange={handleChange}
					/>

					{/* Phone */}
					<input
						type="tel"
						name="phone_no"
						className="w-full border p-3 rounded-lg"
						value={formData.phone_no}
						onChange={handleChange}
					/>

					<div className="flex justify-end gap-3 mt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-5 py-2 bg-gray-200 rounded-lg"
						>
							Cancel
						</button>

						<button
							type="submit"
							className="px-5 py-2 bg-orange-500 text-white rounded-lg"
							disabled={isLoading}
						>
							{isLoading ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default MyEditProfile;
