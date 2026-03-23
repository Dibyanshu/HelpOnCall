import { and, eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { buildAuditCreateFields } from "./audit.js";
import { hashPassword } from "../utils/crypto.js";
import { db } from "./index.js";
import { customerTestimonials, serviceCategories, services, users } from "./schema.js";

interface SeedServiceItem {
  label: string;
  description: string;
  imageUrl: string;
  iconName: string;
}

interface SeedServiceCategory {
  title: string;
  services: SeedServiceItem[];
}

interface SeedTestimonial {
  quote: string;
  highlightedWord: string;
  mainQuoteEnd: string;
  customerName: string;
  customerEmail: string;
  profilePic: string;
  rating: number;
}

const INITIAL_SERVICE_CATEGORIES: SeedServiceCategory[] = [
  {
    title: "Household Chores",
    services: [
      {
        label: "Moderate Housekeeping",
        description:
          "Light home making like Organizing closets & cabinets etc., Preparing & folding laundry, In-house dusting & cleaning, Taking out garbage, Bed making",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Home"
      },
      {
        label: "Meal Preparation",
        description:
          "Kitchen & pantry organization, Ordering groceries & supplies (based upon your need & request), Meal preparation (according to your diet chart & need)",
        imageUrl:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "ChefHat"
      },
      {
        label: "Feeding",
        description: "Feeding assistance (as per need), Keeping Kitchen clean",
        imageUrl:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Utensils"
      }
    ]
  },
  {
    title: "Personal Care",
    services: [
      {
        label: "Bathing",
        description: "Bed baths, Shower and tub assistance, Stand-by assistance",
        imageUrl:
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Bath"
      },
      {
        label: "Personal Hygiene",
        description: "Grooming, Dressing, Oral care, Bathroom and incontinence assistance",
        imageUrl:
          "https://images.unsplash.com/photo-1628771065518-0d82f1938462?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Sparkles"
      },
      {
        label: "Dressing",
        description:
          "Adaptive Clothing Usage, Clothing Selection Support, Dressing and Undressing Assistance, Incontinence Management, Fastening and Zippers, Footwear Support",
        imageUrl:
          "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Shirt"
      }
    ]
  },
  {
    title: "Mobility & Companionship",
    services: [
      {
        label: "Mobility Assistance",
        description:
          "Follow the delegated mobility protocols (post trauma & surgery), Walking assistance, Wheelchair assistance, Safety supervision, Transferring",
        imageUrl:
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Accessibility"
      },
      {
        label: "Companionship",
        description:
          "Our Companion Services enrich clients lives through genuine social engagement, uplifting activities, and dependable support. From staying active to attending appointments, our compassionate companions help clients remain connected to the world and engaged in the things they love.",
        imageUrl:
          "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Users"
      },
      {
        label: "Walking support",
        description: "Provide walking assistance",
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        iconName: "Footprints"
      }
    ]
  }
];

const INITIAL_TESTIMONIALS: SeedTestimonial[] = [
  {
    quote:
      "The progress tracker is fantastic and motivating. It helps me see improvements over time with a great mix of common and",
    highlightedWord: "challenging",
    mainQuoteEnd: "vocabulary words that keep me engaged.",
    customerName: "Fatima Khoury",
    customerEmail: "dilatory_curtains_98",
    profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    quote:
      "The nursing team was incredibly professional and caring throughout our experience. They made our family feel truly supported with their",
    highlightedWord: "exceptional",
    mainQuoteEnd: "care and attention to our needs.",
    customerName: "David Chen",
    customerEmail: "david_chen_wellness",
    profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    rating: 4.8
  },
  {
    quote:
      "Outstanding services with great attention to detail. The corporate solutions exceeded all expectations for comfort and",
    highlightedWord: "quality",
    mainQuoteEnd: "standards in every aspect of service.",
    customerName: "Sarah Thompson",
    customerEmail: "sarah_thompson_corp",
    profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    rating: 4
  },
  {
    quote:
      "The customer support team went above and beyond to ensure complete satisfaction. Their dedication to providing",
    highlightedWord: "excellent",
    mainQuoteEnd: "service is truly commendable and professional.",
    customerName: "Michael Rodriguez",
    customerEmail: "michael_rodriguez_pro",
    profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    quote:
      "From start to finish, the entire process was seamless and highly professional. The team's expertise and",
    highlightedWord: "commitment",
    mainQuoteEnd: "to excellence made all the difference in results.",
    customerName: "Emily Johnson",
    customerEmail: "emily_johnson_expert",
    profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    quote:
      "I was impressed by the innovative approach and meticulous attention to detail. The final result exceeded my",
    highlightedWord: "expectations",
    mainQuoteEnd: "in every way possible with outstanding quality.",
    customerName: "James Wilson",
    customerEmail: "james_wilson_innovator",
    profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    rating: 4.5
  }
];

export async function seedSuperAdmin(): Promise<void> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, env.SUPER_ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const now = new Date();
  const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);

  await db.insert(users).values({
    email: env.SUPER_ADMIN_EMAIL,
    name: "Super Admin",
    passwordHash,
    role: "super_admin",
    isActive: true,
    createdAt: now,
    updatedAt: now
  });

  console.log(`Seeded super admin: ${env.SUPER_ADMIN_EMAIL}`);
}

async function ensureServiceCategorySeed(title: string, displayOrder: number): Promise<number> {
  const existing = await db
    .select({ id: serviceCategories.id })
    .from(serviceCategories)
    .where(eq(serviceCategories.title, title))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const created = await db
    .insert(serviceCategories)
    .values({
      title,
      displayOrder,
      ...buildAuditCreateFields("system_seed")
    })
    .returning({ id: serviceCategories.id });

  return created[0].id;
}

async function ensureServiceSeed(
  categoryId: number,
  item: SeedServiceItem,
  displayOrder: number
): Promise<void> {
  const existing = await db
    .select({ id: services.id })
    .from(services)
    .where(and(eq(services.categoryId, categoryId), eq(services.label, item.label)))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await db.insert(services).values({
    categoryId,
    label: item.label,
    description: item.description,
    imageUrl: item.imageUrl,
    iconName: item.iconName,
    displayOrder,
    ...buildAuditCreateFields("system_seed")
  });
}

export async function seedInitialServices(): Promise<void> {
  for (let categoryIndex = 0; categoryIndex < INITIAL_SERVICE_CATEGORIES.length; categoryIndex += 1) {
    const category = INITIAL_SERVICE_CATEGORIES[categoryIndex];
    const categoryId = await ensureServiceCategorySeed(category.title, categoryIndex);

    for (let serviceIndex = 0; serviceIndex < category.services.length; serviceIndex += 1) {
      await ensureServiceSeed(categoryId, category.services[serviceIndex], serviceIndex);
    }
  }

  console.log("Seeded initial service categories and services");
}

async function ensureTestimonialSeed(item: SeedTestimonial): Promise<void> {
  const message = `${item.quote} ${item.highlightedWord} ${item.mainQuoteEnd}`;

  const existing = await db
    .select({ id: customerTestimonials.id })
    .from(customerTestimonials)
    .where(and(eq(customerTestimonials.customerEmail, item.customerEmail), eq(customerTestimonials.message, message)))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await db.insert(customerTestimonials).values({
    customerName: item.customerName,
    customerEmail: item.customerEmail,
    message,
    rating: item.rating,
    profilePic: item.profilePic,
    status: "active",
    ...buildAuditCreateFields("system_seed")
  });
}

export async function seedInitialTestimonials(): Promise<void> {
  for (let testimonialIndex = 0; testimonialIndex < INITIAL_TESTIMONIALS.length; testimonialIndex += 1) {
    await ensureTestimonialSeed(INITIAL_TESTIMONIALS[testimonialIndex]);
  }

  console.log("Seeded initial testimonials");
}
