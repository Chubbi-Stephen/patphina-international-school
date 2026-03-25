import { Link } from "react-router-dom";
import {
	GraduationCap,
	Users,
	Award,
	BookOpen,
	Shield,
	Bus,
	Microscope,
	ChevronRight,
} from "lucide-react";

export default function Home() {
	const stats = [
		{ value: "500+", label: "Students Enrolled" },
		{ value: "10+", label: "Years of Excellence" },
		{ value: "98%", label: "WAEC Pass Rate" },
		{ value: "30+", label: "Qualified Staff" },
	];
	const programmes = [
		{
			level: "Ages 2 – 5",
			title: "Nursery School",
			desc: "Play-based early learning",
			items: [
				"Creche & Pre-Nursery",
				"Nursery 1 & 2",
				"Phonics & Early Literacy",
				"Numeracy & Cognitive Skills",
				"Arts, Music & Movement",
			],
		},
		{
			level: "Ages 6 – 11",
			title: "Primary School",
			desc: "Core academics & broad curriculum",
			items: [
				"Primary 1 – 6",
				"English Language & Literature",
				"Mathematics & Sciences",
				"Social Studies & Civic Education",
				"Computer Studies & ICT",
			],
		},
		{
			level: "Ages 12 – 18",
			title: "Secondary School",
			desc: "Preparing for WAEC, NECO & beyond",
			items: [
				"JSS 1 – 3 & SS 1 – 3",
				"Sciences, Arts & Commercials",
				"WAEC & NECO Preparation",
				"University Entrance Coaching",
				"Leadership & Career Guidance",
			],
		},
	];
	const features = [
		{
			icon: Award,
			title: "Academic Excellence",
			desc: "Consistent top results in WAEC and NECO with students admitted into top universities.",
		},
		{
			icon: Users,
			title: "Experienced Teachers",
			desc: "Qualified, dedicated professionals who inspire and mentor every student.",
		},
		{
			icon: Microscope,
			title: "Modern Facilities",
			desc: "Science labs, ICT centre, library, sports facilities and air-conditioned classrooms.",
		},
		{
			icon: Shield,
			title: "Safe Environment",
			desc: "24/7 security, CCTV monitoring, and a fully-gated campus.",
		},
		{
			icon: BookOpen,
			title: "Extracurricular Activities",
			desc: "Debate, drama, music, football, spelling bee, science clubs and more.",
		},
		{
			icon: Bus,
			title: "School Bus Service",
			desc: "Air-conditioned school buses covering major routes across Lagos.",
		},
	];
	const testimonials = [
		{
			quote: `The transformation in my daughter since joining Patphina has been remarkable. This school truly cares about each child.`,
			name: "Mrs. Adaeze Okonkwo",
			role: "Parent – Primary 4",
		},
		{
			quote: `My son just got admitted into UNILAG after graduating from Patphina. The teachers don't just teach, they mentor.`,
			name: "Mr. Tunde Fashola",
			role: "Parent – SS3 Alumni",
		},
		{
			quote: `All three of my children attended Patphina. The consistency in quality keeps families coming back year after year.`,
			name: "Mrs. Folake Bello",
			role: "Parent – 3 children",
		},
	];

	return (
		<div>
			{/* HERO */}
			<section className="hero-bg hero-pattern min-h-[92vh] bg-brand-900 flex items-center px-6 py-20">
				<div className="max-w-6xl mx-auto w-full">
					<div className="max-w-2xl fade-up">
						<span className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
							⭐ Enrolment Open — 2025/2026 Session
						</span>
						<h1 className="font-display text-4xl md:text-6xl text-white leading-tight mb-5">
							Where Every Child's{" "}
							<span className="text-brand-300">Potential</span> is Unlocked
						</h1>
						<p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
							At Patphina International School, we provide world-class education
							from Nursery through Secondary, equipping students with knowledge,
							character, and confidence.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								to="/admissions"
								className="bg-brand-300 hover:bg-brand-200 text-brand-900 font-bold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
							>
								Apply for Admission
							</Link>
							<Link
								to="/about"
								className="border border-white/30 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-xl transition-all"
							>
								Learn More
							</Link>
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-2xl">
						{stats.map((s) => (
							<div key={s.label} className="text-center">
								<p className="text-3xl font-bold text-white">{s.value}</p>
								<p className="text-white/50 text-xs mt-1">{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* PROGRAMMES */}
			<section className="py-20 px-6 bg-white">
				<div className="max-w-6xl mx-auto">
					<div className="mb-12">
						<p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
							Academics
						</p>
						<h2 className="font-display text-3xl md:text-4xl text-brand-900">
							Our Programmes
						</h2>
						<p className="text-gray-500 mt-2">
							A seamless educational journey from ages 2 through 18, all in one
							campus.
						</p>
					</div>
					<div className="grid md:grid-cols-3 gap-6">
						{programmes.map((p, i) => (
							<div
								key={p.title}
								className="rounded-2xl overflow-hidden shadow-md hover:-translate-y-1.5 transition-transform duration-300 border border-gray-100"
							>
								<div
									className="p-6 text-white"
									style={{
										background: `linear-gradient(135deg, ${["#182c8f", "#0f1b5c", "#0b2e2b"][i]}, ${["#07134c", "#07134c", "#04342c"][i]})`,
									}}
								>
									<span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
										{p.level}
									</span>
									<h3 className="font-display text-2xl mt-3 mb-1">{p.title}</h3>
									<p className="text-white/70 text-sm">{p.desc}</p>
								</div>
								<div className="p-5 bg-white">
									<ul className="space-y-2">
										{p.items.map((item) => (
											<li
												key={item}
												className="flex items-center gap-2 text-sm text-gray-700"
											>
												<span className="text-brand-600 font-bold">✓</span>{" "}
												{item}
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* WHY US */}
			<section className="py-20 px-6 bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
							Why Choose Us
						</p>
						<h2 className="font-display text-3xl md:text-4xl text-brand-900">
							What Makes Patphina Different
						</h2>
					</div>
					<div className="grid md:grid-cols-3 gap-6">
						{features.map((f) => (
							<div
								key={f.title}
								className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform text-center"
							>
								<div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
									<f.icon size={22} className="text-brand-600" />
								</div>
								<h4 className="font-semibold text-gray-800 mb-2">{f.title}</h4>
								<p className="text-gray-500 text-sm leading-relaxed">
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* PORTAL CTA */}
			<section
				className="py-16 px-6"
				style={{ background: "linear-gradient(135deg, #07134c, #182c8f)" }}
			>
				<div className="max-w-4xl mx-auto text-center">
					<GraduationCap size={40} className="text-brand-300 mx-auto mb-4" />
					<h2 className="font-display text-3xl text-white mb-3">
						Access the Student Portal
					</h2>
					<p className="text-white/60 mb-8 text-lg">
						Students can log in to view their results, profile, and school
						announcements.
					</p>
					<Link
						to="/login"
						className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-all hover:-translate-y-0.5"
					>
						Login to Portal <ChevronRight size={18} />
					</Link>
				</div>
			</section>

			{/* TESTIMONIALS */}
			<section className="py-20 px-6 bg-white">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
							Testimonials
						</p>
						<h2 className="font-display text-3xl md:text-4xl text-brand-900">
							What Parents Are Saying
						</h2>
					</div>
					<div className="grid md:grid-cols-3 gap-6">
						{testimonials.map((t) => (
							<div
								key={t.name}
								className="bg-gray-50 rounded-xl p-6 border border-gray-100"
							>
								<p className="text-3xl text-brand-300 font-display leading-none mb-3">
									"
								</p>
								<p className="text-gray-600 text-sm leading-relaxed italic mb-5">
									{t.quote}
								</p>
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
										{t.name.charAt(0)}
									</div>
									<div>
										<p className="font-semibold text-gray-800 text-sm">
											{t.name}
										</p>
										<p className="text-gray-400 text-xs">{t.role}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ADMISSION CTA */}
			<section className="py-16 px-6 bg-gradient-to-r from-brand-600 to-brand-800">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="font-display text-3xl text-white mb-3">
						Ready to Join Patphina?
					</h2>
					<p className="text-white/70 mb-8">
						Fill out our admission enquiry form and we will get back to you
						within 24 hours.
					</p>
					<Link
						to="/admissions"
						className="btn-primary bg-white text-brand-700 hover:bg-brand-50 inline-flex items-center gap-2 px-8 py-3.5"
					>
						Apply Now <ChevronRight size={18} />
					</Link>
				</div>
			</section>
		</div>
	);
}
