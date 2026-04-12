import { CheckCircle, Users, Globe, Leaf } from 'lucide-react';

const features = [
  { icon: CheckCircle, title: 'Quality Assured', desc: 'Every product undergoes rigorous quality checks before dispatch.' },
  { icon: Users, title: 'B2B Focused', desc: 'Tailored solutions for businesses, retailers, and distributors.' },
  { icon: Globe, title: 'Pan-India Delivery', desc: 'Reliable logistics network covering all major cities and towns.' },
  { icon: Leaf, title: 'Farm Fresh', desc: 'Direct sourcing from trusted farms ensuring freshness and purity.' },
];

const About = () => (
  <section id="about" className="section-padding bg-section-alt">
    <div className="container-main">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="reveal">
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">About Us</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2 mb-4">
            Your Trusted Wholesale Partner Since 1998
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            With over 25 years of experience in the wholesale industry, Groceries Farm has been a reliable partner for
            businesses across India. We source premium quality products directly from farms and manufacturers,
            ensuring competitive pricing and consistent quality.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our commitment to quality, reliability, and customer satisfaction has made us a preferred supplier for
            hundreds of retailers, restaurants, and food businesses nationwide.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 reveal">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-card border border-border shadow-card hover:shadow-soft transition-all duration-300"
            >
              <f.icon size={24} className="text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
