import { z } from "zod";

export const venueLeadSchema = z.object({
  venueName: z.string().min(2, "Numele sălii este obligatoriu."),
  city: z.string().optional(),
  country: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export const providerLeadSchema = z.object({
  providerName: z.string().min(2, "Numele providerului este obligatoriu."),
  city: z.string().optional(),
  country: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export type VenueLeadInput = z.infer<typeof venueLeadSchema>;
export type ProviderLeadInput = z.infer<typeof providerLeadSchema>;
