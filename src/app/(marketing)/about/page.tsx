import * as React from "react"
import { Metadata } from "next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const metadata: Metadata = {
  title: "About Us | UA-EDT",
  description: "Learn about our mission to build uncertainty-aware explainable emotional digital twins.",
}

const team = [
  { name: "Dr. Elena Rostova", role: "Chief Scientist", initials: "ER" },
  { name: "James Holden", role: "Head of Engineering", initials: "JH" },
  { name: "Dr. Sarah Chen", role: "Lead Ethics Researcher", initials: "SC" },
  { name: "Marcus Webb", role: "VP Product", initials: "MW" },
  { name: "Aisha Patel", role: "Senior ML Engineer", initials: "AP" },
  { name: "David Kim", role: "Affective Computing Lead", initials: "DK" },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 bg-muted/20 border-b">
        <div className="container mx-auto px-6 md:px-12 text-center">
          
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Our Mission
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              To bring clinical-grade transparency and mathematical rigor to multimodal emotional AI.
            </p>
          
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          
            <h2 className="text-3xl font-bold mb-8">The Research Philosophy</h2>
            <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-6 leading-relaxed">
              <p>
                For the last decade, emotion AI has operated as a black box. Systems ingested video and audio, and spit out labels like "Happy" or "Angry" with no explanation. Worse, they offered no measure of uncertainty. If the lighting was poor or the audio was muffled, the model would simply guess, often leading to biased or factually incorrect outcomes.
              </p>
              <p>
                We believe this is unacceptable for clinical, research, and high-stakes enterprise environments.
              </p>
              <p>
                <strong>UA-EDT (Uncertainty-Aware Explainable Emotional Digital Twin)</strong> was born from a collaboration between cognitive scientists and machine learning engineers. Our architecture fundamentally separates aleatoric (data) uncertainty from epistemic (model) uncertainty. We utilize Evidential Deep Learning to bound every prediction with a confidence interval.
              </p>
              <p>
                Furthermore, we built the Digital Twin layer. Instead of just returning a vector of emotions, we generate a parametric digital twin that demonstrates exactly <em>why</em> a conclusion was reached, mapping inferences back to specific Facial Action Coding System (FACS) units and prosodic markers.
              </p>
            </div>
          
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-muted/20 border-t">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">The Team</h2>
              <p className="text-lg text-muted-foreground">
                World-class researchers and engineers from leading AI institutions.
              </p>
            </div>
          
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {team.map((member, i) => (
              
                <div key={i} className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-6 border-4 border-background shadow-lg">
                    <AvatarFallback className="text-2xl font-medium bg-primary/10 text-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
