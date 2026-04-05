import { and, eq, sql } from "drizzle-orm";
import { env } from "../config/env.js";
import { buildAuditCreateFields } from "./audit.js";
import { hashPassword } from "../utils/crypto.js";
import { db } from "./index.js";
import { customerTestimonials, emailTemplates, serviceCategories, services, users } from "./schema.js";
import { buildEmailWrapper, buildInfoCard, buildInfoGrid, buildStatusBadge, buildSuccessIconBadge } from "../utils/email-template/email-layout.js";

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

interface SeedEmailTemplate {
  templateKey: string;
  module: "employee" | "user_registration" | "rfq" | "system";
  subjectTemplate: string;
  textTemplate: string;
  htmlTemplate: string;
  variablesSchema: string;
  description: string;
}

const INITIAL_EMAIL_TEMPLATES: SeedEmailTemplate[] = [
  {
    templateKey: "user_registration_ack",
    module: "user_registration",
    subjectTemplate: "HelpOnCall registration received",
    textTemplate: [
      "Hi {{name}},",
      "",
      "Your registration has been received successfully.",
      "An administrator will review and activate your account soon.",
      "",
      "Thanks,",
      "HelpOnCall Team"
    ].join("\n"),
    htmlTemplate: buildEmailWrapper(`
      ${buildSuccessIconBadge("✉")}
      <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Registration Received!</h2>
      <div style="max-width:560px;margin:0 auto;">
        ${buildInfoCard(`<p style="margin:0;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>{{name}}</strong>, your registration has been received. An administrator will review and activate your account soon.</p>`)}
      </div>
    `),
    variablesSchema: JSON.stringify({ required: ["name"] }),
    description: "Sent to users after public registration"
  },
  {
    templateKey: "email_verification_code",
    module: "system",
    subjectTemplate: "HelpOnCall {{moduleLabel}} email verification code",
    textTemplate: [
      "Your HelpOnCall verification code is: {{code}}",
      "",
      "This code expires in 15 minutes.",
      "If you did not request this, you can ignore this email."
    ].join("\n"),
    htmlTemplate: buildEmailWrapper(`
      <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 8px;font-weight:800;">Verification Code</h2>
      <p style="color:#475569;margin:0 0 24px;">HelpOnCall {{moduleLabel}} Email Verification</p>
      <div style="max-width:400px;margin:0 auto;">
        ${buildInfoCard(`
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Your verification code:</p>
          <p style="margin:8px 0 16px;font-size:40px;font-weight:800;letter-spacing:8px;color:#0f766e;">{{code}}</p>
          <p style="margin:0;font-size:13px;color:#94a3b8;">This code expires in 15 minutes. If you did not request this, you can ignore this email.</p>
        `)}
      </div>
    `),
    variablesSchema: JSON.stringify({ required: ["code", "moduleLabel"] }),
    description: "Sent when a user requests an email verification code"
  },
  {
    templateKey: "new_staff_account_created",
    module: "system",
    subjectTemplate: "Your HelpOnCall staff account is ready",
    textTemplate: [
      "Hi {{fullName}},",
      "",
      "Your HelpOnCall staff account has been created successfully.",
      "You can now log in using the credentials below:",
      "",
      "Staff Email: {{staffEmail}}",
      "Password: {{password}}",
      "",
      "Please change your password after first login.",
      "",
      "Regards,",
      "HelpOnCall Team"
    ].join("\n"),
    htmlTemplate: buildEmailWrapper(`
      ${buildSuccessIconBadge("★")}
      <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Staff Account Ready!</h2>
      <div style="max-width:560px;margin:0 auto;">
        <p style="font-size:18px;line-height:1.6;color:#475569;margin:0 0 24px;">Hi <strong>{{fullName}}</strong>, your HelpOnCall staff account has been created.</p>
        ${buildInfoGrid([
          { label: "Staff Email", value: "{{staffEmail}}" },
          { label: "Password", value: "{{password}}" }
        ])}
        <div style="margin-top:16px;">
          ${buildInfoCard(`<p style="margin:0;color:#64748b;font-size:14px;">Please change your password after your first login.</p>`)}
        </div>
      </div>
    `),
    variablesSchema: JSON.stringify({ required: ["fullName", "personalEmail", "staffEmail", "password"] }),
    description: "Sent after admin creates a new staff account"
  },
  {
    templateKey: "rfq_confirmation",
    module: "rfq",
    subjectTemplate: "HelpOnCall quotation request received",
    textTemplate: [
      "Hi {{fullName}},",
      "",
      "Request Received!",
      "",
      "Your quotation request has been logged in our premium care system.",
      "A detailed confirmation and next steps have been sent to {{email}}.",
      "A care coordinator will be in touch within the next 2 hours.",
      "",
      "HelpOnCall Team"
    ].join("\n"),
    htmlTemplate: buildEmailWrapper(`
      ${buildSuccessIconBadge()}
      <h2 style="font-size:36px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Request Received!</h2>
      <div style="max-width:560px;margin:0 auto 16px;">
        <p style="font-size:20px;line-height:1.6;color:#475569;margin:0 0 20px;font-weight:500;">Your quotation request has been logged in our premium care system.</p>
        ${buildInfoCard(`<p style="margin:0;color:#374151;font-size:16px;line-height:1.7;">A detailed confirmation and next steps have been sent to <span style="color:#0f766e;font-weight:700;">{{email}}</span>. A care coordinator will be in touch within the next 2 hours.</p>`)}
      </div>
    `),
    variablesSchema: JSON.stringify({ required: ["fullName", "email"] }),
    description: "Sent to users after a quotation request is submitted"
  },
  {
    templateKey: "employment_applicant_confirmation",
    module: "employee",
    subjectTemplate: "HelpOnCall employment application received",
    textTemplate: [
      "Hi {{fullName}},",
      "",
      "Application Sent!",
      "",
      "Your profile has entered our orbit. Our recruitment team will review your application and reach out shortly.",
      "A confirmation has been sent to {{emailAddress}}.",
      "",
      "HelpOnCall Team"
    ].join("\n"),
    htmlTemplate: buildEmailWrapper(`
      ${buildSuccessIconBadge()}
      <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Application Sent!</h2>
      <div style="max-width:560px;margin:0 auto;">
        <p style="font-size:18px;line-height:1.6;color:#475569;margin:0;">Hi <strong>{{fullName}}</strong>, your profile has entered our orbit. Our recruitment team will review your application and reach out shortly.</p>
      </div>
    `),
    variablesSchema: JSON.stringify({ required: ["fullName", "emailAddress"] }),
    description: "Sent to applicants after successful employment application submission"
  },
  {
    templateKey: "employment_applicant_status",
    module: "employee",
    subjectTemplate: "HelpOnCall employment application {{statusSubject}}",
    textTemplate: [
      "Hi {{fullName}},",
      "",
      "{{statusLine}}",
      "Reference ID: {{empId}}",
      "",
      "Thank you for your interest in HelpOnCall.",
      "HelpOnCall Team"
    ].join("\n"),
    htmlTemplate: buildEmailWrapper(`
      <div style="display:inline-block;margin-bottom:24px;padding:10px 24px;border-radius:9999px;background:{{statusBadgeColor}};color:{{statusTextColor}};font-weight:700;font-size:16px;">{{statusBadgeLabel}}</div>
      <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Application {{statusHeading}}</h2>
      <div style="max-width:560px;margin:0 auto;">
        ${buildInfoCard(`
          <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>{{fullName}}</strong>, {{statusLine}}</p>
          ${buildInfoGrid([{ label: "Reference ID", value: "{{empId}}" }])}
        `)}
        <p style="margin:16px 0 0;color:#64748b;font-size:14px;">Thank you for your interest in HelpOnCall.</p>
      </div>
    `),
    variablesSchema: JSON.stringify({
      required: [
        "fullName",
        "empId",
        "statusSubject",
        "statusHeading",
        "statusLine",
        "statusBadgeColor",
        "statusTextColor",
        "statusBadgeLabel"
      ]
    }),
    description: "Sent to applicants when their employment application status is updated (approved or rejected)"
  },
  {
    templateKey: "rfq_status",
    module: "rfq",
    subjectTemplate: "HelpOnCall quotation request {{statusSubject}}",
    textTemplate: [
      "Hi {{fullName}},",
      "",
      "{{statusLine}}",
      "Reference ID: {{rfqId}}",
      "",
      "Thank you for choosing HelpOnCall.",
      "HelpOnCall Team"
    ].join("\n"),
    htmlTemplate: buildEmailWrapper(`
      <div style="display:inline-block;margin-bottom:24px;padding:10px 24px;border-radius:9999px;background:{{statusBadgeColor}};color:{{statusTextColor}};font-weight:700;font-size:16px;">{{statusBadgeLabel}}</div>
      <h2 style="font-size:32px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Request {{statusHeading}}</h2>
      <div style="max-width:560px;margin:0 auto;">
        ${buildInfoCard(`
          <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.7;">Hi <strong>{{fullName}}</strong>, {{statusLine}}</p>
          ${buildInfoGrid([{ label: "Reference ID", value: "{{rfqId}}" }])}
        `)}
        <p style="margin:16px 0 0;color:#64748b;font-size:14px;">Thank you for choosing HelpOnCall.</p>
      </div>
    `),
    variablesSchema: JSON.stringify({
      required: [
        "fullName",
        "rfqId",
        "statusSubject",
        "statusHeading",
        "statusLine",
        "statusBadgeColor",
        "statusTextColor",
        "statusBadgeLabel"
      ]
    }),
    description: "Sent to users when their quotation request status is updated (approved or rejected)"
  }
];

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
    .where(eq(users.personalEmail, env.SUPER_ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const now = new Date();
  const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);

  await db.insert(users).values({
    personalEmail: env.SUPER_ADMIN_EMAIL,
    fullName: "Super Admin",
    passwordHash,
    role: "super_admin",
    isActive: true,
    createdAt: now,
    updatedAt: now
  });

  console.log(`Seeded super admin: ${env.SUPER_ADMIN_EMAIL}`);
}

async function ensureEmailTemplateSeed(item: SeedEmailTemplate): Promise<void> {
  const existing = await db
    .select({ id: emailTemplates.id })
    .from(emailTemplates)
    .where(eq(emailTemplates.templateKey, item.templateKey))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(emailTemplates)
      .set({
        subjectTemplate: item.subjectTemplate,
        textTemplate: item.textTemplate,
        htmlTemplate: item.htmlTemplate,
        variablesSchema: item.variablesSchema,
        description: item.description,
        updatedAt: new Date()
      })
      .where(eq(emailTemplates.templateKey, item.templateKey));
    return;
  }

  await db.insert(emailTemplates).values({
    templateKey: item.templateKey,
    module: item.module,
    channel: "email",
    subjectTemplate: item.subjectTemplate,
    textTemplate: item.textTemplate,
    htmlTemplate: item.htmlTemplate,
    variablesSchema: item.variablesSchema,
    description: item.description,
    isActive: true,
    version: 1,
    ...buildAuditCreateFields("system_seed")
  });
}

export async function seedInitialEmailTemplates(): Promise<void> {
  for (let templateIndex = 0; templateIndex < INITIAL_EMAIL_TEMPLATES.length; templateIndex += 1) {
    await ensureEmailTemplateSeed(INITIAL_EMAIL_TEMPLATES[templateIndex]);
  }

  const counts = await db
    .select({ count: sql<number>`count(*)` })
    .from(emailTemplates);

  console.log(`Seeded initial email templates (total: ${counts[0]?.count ?? 0})`);
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

  const readableDisplayOrder = displayOrder +1; // Start display order from 1 for better readability
  const created = await db
    .insert(serviceCategories)
    .values({
      title,
      displayOrder: readableDisplayOrder,
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

  const readableDisplayOrder = displayOrder +1; // Start display order from 1 for better readability 
  await db.insert(services).values({
    categoryId,
    label: item.label,
    description: item.description,
    imageUrl: item.imageUrl,
    iconName: item.iconName,
    displayOrder: readableDisplayOrder,
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
