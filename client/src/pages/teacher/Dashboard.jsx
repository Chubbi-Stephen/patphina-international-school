import { useEffect, useState } from "react";
import {
	Users,
	Upload,
	HelpCircle,
	Megaphone,
	ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function TeacherDashboard() {
	const { user } = useAuth();
	const [questions, setQuestions] = useState([]);
	const [announcements, setAnnouncements] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			api.get("/questions"),
			api.get("/admin/announcements?target=teachers"),
		])
			.then(([q, a]) => {
				setQuestions(q.data.questions || []);
				setAnnouncements(a.data.announcements || []);
			})
			.finally(() => setLoading(false));
	}, []);

	// classes is a plain string array: ['SS1A','SS2A',...]
	const classList = user?.classes || [];

	if (loading)
		return (
			<div className="flex items-center justify-center h-64">
				<div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
			</div>
		);

	return (
		<div className="space-y-6 fade-up">
			{/* Welcome banner */}
			<div className="bg-gradient-to-r from-brand-700 to-brand-900 rounded-2xl p-6 text-white">
				<p className="text-white/60 text-sm mb-1">Welcome back,</p>
				<h1 className="font-display text-2xl font-bold">{user?.full_name}</h1>
				<div className="flex flex-wrap gap-3 mt-4 text-sm">
					<span className="bg-white/10 px-3 py-1 rounded-full">
						🆔 {user?.staff_id}
					</span>
					<span className="bg-white/10 px-3 py-1 rounded-full">
						📚 {user?.subject}
					</span>
					<span className="bg-white/10 px-3 py-1 rounded-full">
						🏫 {classList.length} Classes
					</span>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				<div className="card text-center">
					<p className="text-3xl font-bold text-green-600">
						{classList.length}
					</p>
					<p className="text-gray-500 text-sm mt-1">Classes Assigned</p>
				</div>
				<div className="card text-center">
					<p className="text-3xl font-bold text-brand-600">
						{questions.length}
					</p>
					<p className="text-gray-500 text-sm mt-1">Questions Set</p>
				</div>
				<div className="card text-center col-span-2 md:col-span-1">
					<p className="text-3xl font-bold text-purple-600">
						{announcements.length}
					</p>
					<p className="text-gray-500 text-sm mt-1">Announcements</p>
				</div>
			</div>

			{/* Quick actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{[
					{
						icon: Users,
						label: "View Students",
						to: "/teacher/students",
						color: "bg-blue-50 text-blue-600 border-blue-100",
					},
					{
						icon: Upload,
						label: "Upload Results",
						to: "/teacher/results",
						color: "bg-green-50 text-green-600 border-green-100",
					},
					{
						icon: HelpCircle,
						label: "Set Questions",
						to: "/teacher/questions",
						color: "bg-purple-50 text-purple-600 border-purple-100",
					},
				].map((a) => (
					<Link
						key={a.to}
						to={a.to}
						className={`card border flex items-center gap-4 hover:-translate-y-0.5 transition-all ${a.color}`}
					>
						<a.icon size={22} />
						<span className="font-semibold">{a.label}</span>
						<ChevronRight size={16} className="ml-auto opacity-50" />
					</Link>
				))}
			</div>

			{/* Assigned classes */}
			<div className="card">
				<h2 className="font-semibold text-gray-800 mb-3">
					My Classes — {user?.subject}
				</h2>
				{classList.length === 0 ? (
					<p className="text-gray-400 text-sm">
						No classes assigned yet. Contact admin.
					</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{classList.map((c, i) => (
							<span
								key={i}
								className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-full"
							>
								{c}
							</span>
						))}
					</div>
				)}
			</div>

			{/* Announcements */}
			<div className="card">
				<h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
					<Megaphone size={18} className="text-green-600" /> Announcements
				</h2>
				{announcements.length === 0 ? (
					<p className="text-gray-400 text-sm">No announcements.</p>
				) : (
					<div className="space-y-3">
						{announcements.map((a) => (
							<div
								key={a.id}
								className="bg-green-50 border border-green-100 rounded-xl p-4"
							>
								<p className="font-semibold text-green-800 text-sm">
									{a.title}
								</p>
								<p className="text-gray-600 text-sm mt-1">{a.body}</p>
								<p className="text-gray-400 text-xs mt-2">
									{new Date(a.created_at).toLocaleDateString("en-NG", {
										dateStyle: "medium",
									})}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
