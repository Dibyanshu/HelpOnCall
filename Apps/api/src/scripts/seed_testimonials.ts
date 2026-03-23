import "dotenv/config";
import { db } from "../db/index.js";
import { customerTestimonials } from "../db/schema.js";

const testimonialsData = [
  {
    quote: 'The progress tracker is fantastic and motivating. It helps me see improvements over time with a great mix of common and',
    highlightedWord: 'challenging',
    mainQuoteEnd: 'vocabulary words that keep me engaged.',
    name: 'Fatima Khoury',
    handle: 'dilatory_curtains_98',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote: 'The nursing team was incredibly professional and caring throughout our experience. They made our family feel truly supported with their',
    highlightedWord: 'exceptional',
    mainQuoteEnd: 'care and attention to our needs.',
    name: 'David Chen',
    handle: 'david_chen_wellness',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    rating: 4.8,
  },
  {
    quote: 'Outstanding services with great attention to detail. The corporate solutions exceeded all expectations for comfort and',
    highlightedWord: 'quality',
    mainQuoteEnd: 'standards in every aspect of service.',
    name: 'Sarah Thompson',
    handle: 'sarah_thompson_corp',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    rating: 4,
  },
  {
    quote: 'The customer support team went above and beyond to ensure complete satisfaction. Their dedication to providing',
    highlightedWord: 'excellent',
    mainQuoteEnd: 'service is truly commendable and professional.',
    name: 'Michael Rodriguez',
    handle: 'michael_rodriguez_pro',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote: 'From start to finish, the entire process was seamless and highly professional. The team\'s expertise and',
    highlightedWord: 'commitment',
    mainQuoteEnd: 'to excellence made all the difference in results.',
    name: 'Emily Johnson',
    handle: 'emily_johnson_expert',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    rating: 5,
  },
  {
    quote: 'I was impressed by the innovative approach and meticulous attention to detail. The final result exceeded my',
    highlightedWord: 'expectations',
    mainQuoteEnd: 'in every way possible with outstanding quality.',
    name: 'James Wilson',
    handle: 'james_wilson_innovator',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    rating: 4.5,
  },
];

async function seedTestimonials() {
  console.log("Starting testimonials seeding...");

  const now = new Date();

  const values = testimonialsData.map(t => ({
    customerName: t.name,
    customerEmail: t.handle,
    message: `${t.quote} ${t.highlightedWord} ${t.mainQuoteEnd}`,
    rating: t.rating,
    profilePic: t.image,
    createdAt: now,
    status: 'active' as const
  }));

  try {
    await db.insert(customerTestimonials).values(values);
    console.log(`Successfully seeded ${values.length} testimonials.`);
  } catch (error) {
    console.error("Failed to seed testimonials:", error);
    process.exit(1);
  }
}

seedTestimonials().then(() => process.exit(0));
