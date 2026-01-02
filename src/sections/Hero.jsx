import { ArrowRight, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Button } from "../components/Button";
import { AnimatedBorderButton } from "../components/AnimatedBorderButton";

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">

            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/hero-bg.jpg"
                    alt="hero image"
                    className="w-full h-full object-cover opacity-40"
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />

            {/* Green Dots */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full opacity-60"
                        style={{
                            backgroundColor: "#20B2A6",
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `slow-drift ${15 + Math.random() + 20}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            {/*Content*/}

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/*Left Column -Text Content*/}
                    <div className="space-y-8">
                        <div className="animate-fade-in ">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />AI Prompt Expert & Content Creator
                            </span>
                        </div>

                        {/*Headline*/}
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl lg:text7xl font-bold leading-tight animate-fade-in animation-delay-100">
                                The master <span className="text-primary glow-text"></span>
                                <br />
                                AI expert with
                                <br />
                                <span className="font-serif italic font-normal text white">
                                    Generating Pics and Videos
                                </span>
                            </h1>

                            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in animation-delay-200">
                                Hi, I’m Ahsan — AI Visual Expert.
                                I create scroll-stopping images and videos for Instagram, Facebook, Tinder, Hinge, and other social platforms.                            </p>
                        </div>
                        {/*CTAs*/}
                        <div className="flex flex-wrap gap-4 animate-fade-in animation-delay-300">
                            <Button size="lg">Contact Me<ArrowRight className="w-5 h-5" /></Button>
                            <AnimatedBorderButton>
                                Download PDF
                            </AnimatedBorderButton>
                        </div>

                        {/*Social Links*/}

                        <div className="flex items-center gap-4 animate-fade-in animation-delay-400">
                            <span className="text-sm text-muted-foreground">Follow me:</span>
                            {[{ icon: Instagram, href: "#" },
                            { icon: Facebook, href: "#" },
                            { icon: Youtube, href: "#" },
                            { icon: Twitter, href: "#" }
                            ].map((social, idx) => (
                                <a key={idx} href={social.href} className="p-2 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                    {<social.icon className="w-5 h-5" />}</a>
                            ))}
                        </div>

                    </div>
                    {/*Right Column -Profile Image*/}

                    <div className="relative animate-fade-in animation-delay-300">
                        {/*Profile Image*/}
                        <div className="relative max-w-md mx-auto">

                            {/*glowing*/}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 
                            via-transparent to-primary/10 blur-2xl animate-pulse"/>
                            <div className="relative glass rounded-3xl p-2 glow-border">
                                <img src='/profile-photo.jpeg' alt="The Dev master"
                                    className="w-full aspect-[4/5] object-cover rounded-2xl" />

                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </section>
    );
};
