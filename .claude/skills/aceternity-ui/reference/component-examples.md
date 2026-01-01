# Aceternity UI Component Examples

## 1. Pricing Cards with 3D Effect

```tsx
import { Card3D, Card3DBody } from '@/components/ui/3d-card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$9',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    name: 'Pro',
    price: '$29',
    features: ['All Starter features', 'Feature 4', 'Feature 5', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    features: ['All Pro features', 'Custom integrations', 'Dedicated support'],
  },
];

export function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card3D
          key={plan.name}
          containerClassName="h-full"
          className={`
            bg-neutral-900 rounded-xl p-6 h-full
            ${plan.popular ? 'ring-2 ring-primary-500' : ''}
          `}
        >
          <Card3DBody className="flex flex-col h-full">
            {plan.popular && (
              <span className="text-primary-500 text-sm font-semibold mb-2">
                MOST POPULAR
              </span>
            )}
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="text-4xl font-bold text-white mb-6">
              {plan.price}
              <span className="text-lg text-neutral-400">/month</span>
            </div>
            <ul className="space-y-3 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-neutral-300">
                  <Check className="w-5 h-5 text-primary-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`
                w-full py-3 rounded-lg font-semibold mt-6
                ${plan.popular
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'border border-neutral-600 text-white hover:bg-neutral-800'
                }
              `}
            >
              Get Started
            </button>
          </Card3DBody>
        </Card3D>
      ))}
    </div>
  );
}
```

## 2. Feature Grid with Staggered Animation

```tsx
import { motion } from 'framer-motion';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';

const features = [
  { icon: '🚀', title: 'Fast', description: 'Lightning-fast performance' },
  { icon: '🎨', title: 'Beautiful', description: 'Stunning visual design' },
  { icon: '📱', title: 'Responsive', description: 'Works on all devices' },
  { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
];

export function FeatureGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, idx) => (
        <RevealOnScroll key={feature.title} delay={idx * 0.1}>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-neutral-900 rounded-xl p-6 text-center"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-neutral-400">{feature.description}</p>
          </motion.div>
        </RevealOnScroll>
      ))}
    </div>
  );
}
```

## 3. Testimonial Carousel with 3D Cards

```tsx
import { useState } from 'react';
import { Card3D, Card3DBody } from '@/components/ui/3d-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'John Doe',
    role: 'CEO, Company',
    content: 'This product changed our business completely!',
    avatar: '/avatars/john.jpg',
  },
  // ... more testimonials
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative max-w-4xl mx-auto">
      <Card3D
        containerClassName="w-full"
        className="bg-neutral-900 rounded-xl p-8"
      >
        <Card3DBody>
          <div className="flex flex-col items-center text-center">
            <img
              src={testimonials[current].avatar}
              alt={testimonials[current].name}
              className="w-20 h-20 rounded-full mb-4"
            />
            <p className="text-xl text-neutral-300 mb-6">
              "{testimonials[current].content}"
            </p>
            <h4 className="text-lg font-bold text-white">
              {testimonials[current].name}
            </h4>
            <p className="text-neutral-400">{testimonials[current].role}</p>
          </div>
        </Card3DBody>
      </Card3D>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
          className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
          className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
```

## 4. CTA Section with Floating Elements

```tsx
import { FloatingElement } from '@/components/ui/floating-element';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20" />

      {/* Floating decorative elements */}
      <FloatingElement duration={4} yOffset={20} className="absolute top-10 left-10">
        <div className="w-16 h-16 bg-primary-500/30 rounded-full blur-xl" />
      </FloatingElement>

      <FloatingElement duration={5} delay={1} yOffset={30} className="absolute bottom-10 right-10">
        <div className="w-24 h-24 bg-secondary-500/30 rounded-full blur-2xl" />
      </FloatingElement>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Ready to Get Started?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-neutral-300 mb-8"
        >
          Join thousands of users who are already transforming their workflow
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-lg"
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
```

## 5. Stats Counter with Animation

```tsx
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const increment = end / (duration * 60); // 60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="text-5xl font-bold text-primary-500">
      {count.toLocaleString()}
    </span>
  );
}

const stats = [
  { label: 'Active Users', value: 10000, suffix: '+' },
  { label: 'Projects Completed', value: 5000, suffix: '+' },
  { label: 'Countries', value: 50, suffix: '+' },
  { label: 'Team Members', value: 100, suffix: '+' },
];

export function StatsSection() {
  return (
    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="text-center"
        >
          <div className="mb-2">
            <AnimatedCounter end={stat.value} />
            <span className="text-5xl font-bold text-primary-500">{stat.suffix}</span>
          </div>
          <p className="text-neutral-400">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
```

## 6. Image Gallery with Parallax

```tsx
import { ParallaxScroll } from '@/components/ui/parallax-scroll';

const images = [
  '/gallery/1.jpg',
  '/gallery/2.jpg',
  '/gallery/3.jpg',
  // ... more images
];

export function ParallaxGallery() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {images.map((src, idx) => (
        <ParallaxScroll key={src} speed={0.2 + (idx % 3) * 0.1}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <img
              src={src}
              alt={`Gallery ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </ParallaxScroll>
      ))}
    </div>
  );
}
```

## Integration Tips

1. **Combine with color-theme skill** for dynamic theming
2. **Use with shadcn components** for consistent UI
3. **Integrate tailwind-css** for responsive layouts
4. **Add framer-motion** for advanced animations
5. **Optimize with performance guides** for production

## Accessibility Reminders

- Always include `aria-labels` for interactive elements
- Test with keyboard navigation
- Respect `prefers-reduced-motion`
- Ensure color contrast meets WCAG standards
- Provide fallbacks for older browsers
