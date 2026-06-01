import { useState, type FormEvent, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendContactEmailWithFallback, initEmailJS } from '@/services/emailService';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+91 8247035192' },
  { icon: Mail, label: 'Email', value: 'maninewmart@gmail.com' },
  { icon: MapPin, label: 'Address', value: 'Peddapuram, AndhraPradesh, India' },
  { icon: Clock, label: 'Hours', value: 'Tue-Sun: 9:00 AM - 6:00 PM' },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  // Initialize EmailJS on component mount
  useEffect(() => {
    const initialized = initEmailJS();
    if (!initialized) {
      console.warn('EmailJS not configured, will use FormSubmit fallback');
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      // Send email using EmailJS with FormSubmit fallback
      await sendContactEmailWithFallback({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });

      toast({ 
        title: 'Message sent!', 
        description: 'We will get back to you shortly at maninewmart@gmail.com' 
      });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again or contact us directly at maninewmart@gmail.com',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-main">
        <div className="text-center mb-12 reveal">
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">Get In Touch</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">Contact Us</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4 reveal">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                placeholder="Your Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
            <textarea
              placeholder="Your Message *"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow resize-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Message'} <Send size={16} />
            </button>
          </form>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4 reveal">
            {contactInfo.map((c, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border shadow-card">
                <div className="p-2 rounded-lg bg-primary/10">
                  <c.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-sm text-muted-foreground">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
