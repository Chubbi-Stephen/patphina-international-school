export default function About() {
	return (
		<div>
			<div className="hero-bg py-20 px-6 text-center">
				<h1 className="font-display text-4xl text-black mb-3">
					About Patphina International School
				</h1>
				<p className="text-black/60 text-lg max-w-xl mx-auto">
					A legacy of academic excellence in the heart of Lagos
				</p>
			</div>
			<section className="py-17 px-6 bg-white">
				<div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
					<div>
						<p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">
							Our Story
						</p>
						<h2 className="font-display text-3xl text-brand-900 mb-4">
							Building Futures Since [YEAR]
						</h2>
						<p className="text-gray-600 leading-relaxed mb-4">
							Founded in [YEAR], Patphina International School has grown to
							become one of the most trusted educational institutions in Ojo,
							Lagos. We started with a vision to make quality education
							accessible to every child, and that vision still drives everything
							we do today.
						</p>
						<p className="text-gray-600 leading-relaxed">
							From our nursery section to our senior secondary school, we
							maintain the same commitment to excellence — experienced teachers,
							a safe environment, and a curriculum that prepares students for
							life beyond the classroom.
						</p>
					</div>
					<div className="space-y-4">
						{[
							{
								title: "Our Mission",
								text: "To develop confident, creative, and compassionate learners equipped for a changing world.",
							},
							{
								title: "Our Vision",
								text: "To be the leading school of choice in Lagos State, known for academic excellence and character.",
							},
							{
								title: "Core Values",
								text: "Integrity · Excellence · Discipline · Innovation · Compassion",
							},
							{
								title: "Our Motto",
								text: '"Nurturing Minds. Building Futures."',
							},
						].map((v) => (
							<div
								key={v.title}
								className="bg-gray-50 rounded-xl p-5 border-l-4 border-brand-600"
							>
								<p className="font-semibold text-brand-800 mb-1">{v.title}</p>
								<p className="text-gray-600 text-sm">{v.text}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
