import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
	{
		title: "Effortless Sharing",
		desc: "Send files instantly with a simple code. No account needed for recipients.",
		icon: (
			<svg
				className="w-10 h-10 text-blue-500"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 19V6m0 0l-4 4m4-4l4 4"
				/>
			</svg>
		),
	},
	{
		title: "Bank-Grade Security",
		desc: "Files are encrypted, protected by OTP, and auto-expire for total privacy.",
		icon: (
			<svg
				className="w-10 h-10 text-blue-500"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 11c1.657 0 3-1.343 3-3V5a3 3 0 10-6 0v3c0 1.657 1.343 3 3 3zm6 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7"
				/>
			</svg>
		),
	},
	{
		title: "Total Control",
		desc: "Track downloads, revoke access, and manage your files with ease.",
		icon: (
			<svg
				className="w-10 h-10 text-blue-500"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M5 13l4 4L19 7"
				/>
			</svg>
		),
	},
];

const LandingPage = ({ isLoggedIn }) => {
	const navigate = useNavigate();
	// Only one CTA: Get Started
	const handleGetStarted = () => {
		if (isLoggedIn) {
			navigate("/upload"); // or dashboard/home if you prefer
		} else {
			navigate("/register");
		}
	};
	return (
		<div className="min-h-screen w-full bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#101217] flex flex-col items-center justify-between px-4 relative overflow-hidden transition-colors duration-500 font-sans">
			{/* Hero Section */}
			<div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center pt-32 pb-16 relative z-10">
				<img
					src="/vaultdrop-logo6.svg"
					alt="VaultDrop Logo"
					className="w-28 h-28 mb-8 drop-shadow-2xl opacity-90"
				/>
				<h1 className="text-4xl md:text-6xl font-semibold text-white text-center leading-tight mb-6 tracking-tight drop-shadow-xl font-sans">
					Secure. Simple.{" "}
					<span className="text-blue-300 font-semibold">File Sharing</span>
				</h1>
				<p className="text-base md:text-xl text-blue-100 text-center max-w-2xl mb-10 font-normal opacity-90 font-sans">
					VaultDrop lets you share files with anyone, instantly and securely. No
					hassle. No risk. Just peace of mind.
				</p>
				<button
					onClick={handleGetStarted}
					className="px-8 py-3 bg-blue-500/80 hover:bg-blue-400/80 text-white text-lg md:text-xl rounded-lg font-medium shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 font-sans border border-blue-400/30"
				>
					Get Started
				</button>
			</div>
			{/* Features Section */}
			<div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-24 z-10">
				{features.map((f, i) => (
					<div
						key={i}
						className="backdrop-blur-lg bg-white/5 dark:bg-gray-900/30 rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center border border-blue-900/20 dark:border-blue-400/10 transition-colors duration-300 hover:scale-105 hover:shadow-blue-900/30 hover:border-blue-400/30 cursor-pointer"
					>
						<div className="mb-5">{f.icon}</div>
						<h3 className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
							{f.title}
						</h3>
						<p className="text-blue-100 opacity-90">{f.desc}</p>
					</div>
				))}
			</div>
			{/* How it works Section */}
			<div className="w-full max-w-2xl mx-auto backdrop-blur-lg bg-white/5 dark:bg-gray-900/30 rounded-3xl shadow-2xl p-10 mb-16 border border-blue-900/20 dark:border-blue-400/10 z-10">
				<h2 className="text-3xl md:text-4xl font-bold text-blue-300 mb-6 text-center">
					How it works
				</h2>
				<ul className="text-left text-blue-200 space-y-4 text-xl font-medium max-w-xl mx-auto">
					<li>
						<span className="font-semibold text-blue-400">1.</span> Register and
						verify your email with OTP.
					</li>
					<li>
						<span className="font-semibold text-blue-400">2.</span> Upload files
						securely to your account.
					</li>
					<li>
						<span className="font-semibold text-blue-400">3.</span> Share access
						codes for file downloads (with optional OTP).
					</li>
					<li>
						<span className="font-semibold text-blue-400">4.</span> Files expire
						and are auto-deleted for your privacy.
					</li>
				</ul>
			</div>
			{/* Watermark background */}
			<div className="absolute inset-0 pointer-events-none opacity-5 select-none flex items-center justify-center z-0">
				<img
					src="/vaultdrop-logo6.svg"
					alt="VaultDrop Watermark"
					className="w-[50vw] min-w-[300px] max-w-3xl h-auto mx-auto"
				/>
			</div>
			<footer className="w-full text-center py-8 text-blue-900/60 text-base font-medium relative z-10 tracking-wide">
				&copy; {new Date().getFullYear()} VaultDrop. All rights reserved.
			</footer>
		</div>
	);
};

export default LandingPage;
