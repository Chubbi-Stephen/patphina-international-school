import { useState } from "react";
import toast from "react-hot-toast";

export default function Admissions() {
	const [form, setForm] = useState({
		parent_name: "",
		phone: "",
		email: "",
		child_name: "",
		class: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);

	const steps = [
		{ n: "1", label: "Fill enquiry form below" },
		{ n: "2", label: "We call within 24 hours" },
		{ n: "3", label: "Schedule a school tour" },
		{ n: "4", label: "Write entrance assessment" },
		{ n: "5", label: "Receive admission offer" },
	];

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.parent_name || !form.phone || !form.child_name || !form.class) {
			toast.error("Please fill all required fields");
			return;
		}
		// In production: POST to /api/admin/enquiries or an email service
		setSubmitted(true);
		toast.success("Enquiry submitted! We will contact you soon.");
	};

	const classes = [
		"Pre-Nursery",
		"Nursery 1",
		"Nursery 2",
		"Primary 1",
		"Primary 2",
		"Primary 3",
		"Primary 4",
		"Primary 5",
		"Primary 6",
		"JSS 1",
		"JSS 2",
		"JSS 3",
		"SS 1",
		"SS 2",
		"SS 3",
	];

	return (
		<div>
			<div className="hero-bg py-10 px-6 text-center">
				<h1 className="font-display text-4xl text-black mb-3">Admissions</h1>
				<p className="text-black/60 max-w-lg mx-auto">
					Begin your child's journey at Patphina International School
				</p>
			</div>

			<section className="py-10 px-6 bg-white">
				<div className="max-w-5xl mx-auto">
					{/* Steps */}
					<div className="flex flex-wrap justify-center gap-4 mb-14">
						{steps.map((s) => (
							<div
								key={s.n}
								className="flex flex-col items-center gap-2 max-w-[120px] text-center"
							>
								<div className="w-12 h-12 rounded-full border-2 border-brand-600 bg-brand-50 flex items-center justify-center font-display text-xl font-bold text-brand-700">
									{s.n}
								</div>
								<p className="text-xs text-gray-500">{s.label}</p>
							</div>
						))}
					</div>

					{/* Form */}
					<div className="max-w-xl mx-auto">
						{submitted ? (
							<div className="text-center py-12 bg-green-50 rounded-2xl border border-green-200">
								<p className="text-4xl mb-3">✅</p>
								<h3 className="font-display text-2xl text-green-800 mb-2">
									Enquiry Received!
								</h3>
								<p className="text-green-600">
									Thank you! Our admissions team will contact you within 24
									hours.
								</p>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="card space-y-4">
								<h3 className="font-display text-2xl text-brand-900 mb-2">
									Admission Enquiry Form
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div className="col-span-2 md:col-span-1">
										<label className="label">Parent / Guardian Name *</label>
										<input
											className="input"
											placeholder="Full name"
											value={form.parent_name}
											onChange={(e) =>
												setForm((f) => ({ ...f, parent_name: e.target.value }))
											}
											required
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<label className="label">Phone Number *</label>
										<input
											className="input"
											type="tel"
											placeholder="+234 000 000 0000"
											value={form.phone}
											onChange={(e) =>
												setForm((f) => ({ ...f, phone: e.target.value }))
											}
											required
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<label className="label">Email Address</label>
										<input
											className="input"
											type="email"
											placeholder="your@email.com"
											value={form.email}
											onChange={(e) =>
												setForm((f) => ({ ...f, email: e.target.value }))
											}
										/>
									</div>
									<div className="col-span-2 md:col-span-1">
										<label className="label">Child's Name *</label>
										<input
											className="input"
											placeholder="Child's full name"
											value={form.child_name}
											onChange={(e) =>
												setForm((f) => ({ ...f, child_name: e.target.value }))
											}
											required
										/>
									</div>
									<div className="col-span-2">
										<label className="label">Class Applying For *</label>
										<select
											className="input"
											value={form.class}
											onChange={(e) =>
												setForm((f) => ({ ...f, class: e.target.value }))
											}
											required
										>
											<option value="">— Select class —</option>
											{classes.map((c) => (
												<option key={c} value={c}>
													{c}
												</option>
											))}
										</select>
									</div>
									<div className="col-span-2">
										<label className="label">Message / Questions</label>
										<textarea
											className="input min-h-[80px] resize-y"
											placeholder="Any questions or special needs..."
											value={form.message}
											onChange={(e) =>
												setForm((f) => ({ ...f, message: e.target.value }))
											}
										/>
									</div>
								</div>
								<button type="submit" className="btn-primary w-full py-3">
									Submit Enquiry →
								</button>
							</form>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
