import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';
import { ArrowRight, ShieldCheck, Truck, Award } from 'lucide-react';

const stats = [
  { icon: Award, label: '25+ Years', sub: 'Experience' },
  { icon: ShieldCheck, label: '500+', sub: 'Happy Clients' },
  { icon: Truck, label: 'Pan India', sub: 'Delivery' },
];

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Premium wholesale ingredients" width={1920} height={1080} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/70 to-foreground/40 dark:from-background/90 dark:via-background/75 dark:to-background/50" />
      </div>

      <div className="relative container-main section-padding pt-28 md:pt-24">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6 border border-primary/20">
            Trusted Wholesale Partner
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground dark:text-foreground leading-tight mb-6">
            Premium Wholesale <br />
            <span className="text-primary">Ingredients & Produce</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 dark:text-muted-foreground mb-8 max-w-lg leading-relaxed">
            Your one-stop destination for high-quality spices, pulses, herbal powders, flours, and farming products in bulk quantities.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Explore Products <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-primary-foreground/30 dark:border-primary/40 text-primary-foreground dark:text-foreground font-semibold text-sm hover:bg-primary-foreground/10 dark:hover:bg-primary/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-foreground/10 dark:bg-card/30 backdrop-blur-sm border border-primary-foreground/10 dark:border-border/30 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.15}s` }}
            >
              <s.icon size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-primary-foreground dark:text-foreground">{s.label}</p>
                <p className="text-xs text-primary-foreground/70 dark:text-muted-foreground">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
