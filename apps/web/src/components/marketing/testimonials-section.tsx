import { Reveal } from "./reveal";

const TESTIMONIALS = [
  {
    initials: "JD",
    color: "from-indigo-400 to-blue-400",
    quote: "I built my business website in minutes. FSX Studio is a game-changer!",
    name: "John D.",
    role: "Entrepreneur",
  },
  {
    initials: "SK",
    color: "from-pink-400 to-rose-400",
    quote: "The poster generator saved me hours of design work.",
    name: "Sarah K.",
    role: "Designer",
  },
  {
    initials: "MT",
    color: "from-emerald-400 to-teal-400",
    quote: "The AI image tool is incredible. So easy to use!",
    name: "Michael T.",
    role: "Content Creator",
  },
];

export function TestimonialsSection() {
  return (
    <section className="space-y-8">
      <Reveal className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">What creators are saying</h2>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <Reveal key={testimonial.name} delayMs={index * 100}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white/60 p-5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <span className="text-3xl leading-none text-zinc-300 dark:text-zinc-700">&ldquo;</span>
              <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{testimonial.quote}</p>
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-semibold text-white ${testimonial.color}`}
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{testimonial.role}</p>
                </div>
                <div className="ml-auto flex text-amber-400" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <span key={starIndex} className="text-xs">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
