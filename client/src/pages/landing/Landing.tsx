import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';
import { SparklesCore } from '@/components/ui/sparkles';
import { EncryptedText } from '@/components/ui/encrypted-text';
import { GlobalNavigation } from '@/components/layout/GlobalNavigation';
import { ScrollProgress } from '@/components/ui/ScrollProgresstop';
import {
    HowItWorksSection,
    BattlePreviewSection,
    MetricsSection,
    TrustSection,
    FinalCTASection,
} from './sections';

export function Landing() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <ScrollProgress />
            <GlobalNavigation />

            <div className="absolute inset-0 z-0">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={30}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                    speed={1}
                />
            </div>

            {/* Hero */}
            <section className="px-4 py-24 md:py-32 relative z-10">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="mb-6 text-6xl font-space font-bold tracking-tighter text-foreground md:text-8xl">
                            <EncryptedText text="Competitive Coding," />
                            <br />
                            <span className="text-muted-foreground"><EncryptedText text="Simplified." revealDelayMs={70} /></span>
                        </h1>
                        <p className="mx-auto mb-12 font-space max-w-lg text-lg text-muted-foreground">
                            Real-time head-to-head coding battles. Climb the ranks. Prove your skills.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <Link to="/signup">
                            <Button size="lg" className="min-w-[160px] font-space">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/leaderboard">
                            <Button variant="outline" size="lg" className="min-w-[160px] font-space">
                                View Leaderboard
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* New Sections */}
            <HowItWorksSection />
            <BattlePreviewSection />
            <MetricsSection />
            <TrustSection />
            <FinalCTASection />

            <Footer />
        </div>
    );
}

