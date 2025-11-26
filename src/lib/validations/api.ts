import { z } from 'zod';

// =============================================================================
// PARAM SCHEMAS
// =============================================================================

/**
 * Stock symbol validation (1-10 chars, uppercase)
 */
export const symbolSchema = z
  .string()
  .min(1, 'Symbol is required')
  .max(10, 'Symbol too long')
  .transform((s) => s.toUpperCase());

/**
 * Chart time range validation
 */
export const timeRangeSchema = z.enum(['1D', '1W', '1M', '3M', '1Y', '5Y']);

/**
 * Subscription tier validation
 */
export const tierSchema = z.enum(['free', 'pro']);

// =============================================================================
// REQUEST BODY SCHEMAS
// =============================================================================

/**
 * Stock search request
 */
export const searchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(50, 'Query too long'),
});

/**
 * Add symbol to study list
 */
export const studyListAddSchema = z.object({
  symbol: symbolSchema,
});

/**
 * AI chat request
 */
export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  conversationId: z.string().uuid().optional(),
  context: z
    .object({
      type: z.enum(['terminal', 'stock', 'general']),
      symbols: z.array(symbolSchema).optional(),
    })
    .optional(),
});

/**
 * AI explain request
 */
export const explainRequestSchema = z.object({
  type: z.enum(['metric', 'indicator', 'index', 'sector']),
  id: z.string().min(1, 'ID is required').max(50, 'ID too long'),
  symbol: symbolSchema.optional(),
});

/**
 * Deep score quiz submission
 */
export const scoreSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.array(z.string())]),
    })
  ),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Symbol = z.infer<typeof symbolSchema>;
export type TimeRange = z.infer<typeof timeRangeSchema>;
export type Tier = z.infer<typeof tierSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type StudyListAddRequest = z.infer<typeof studyListAddSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ExplainRequest = z.infer<typeof explainRequestSchema>;
export type ScoreSubmitRequest = z.infer<typeof scoreSubmitSchema>;

// =============================================================================
// VALIDATION HELPER
// =============================================================================

/**
 * Validate request data against a Zod schema
 * Throws ZodError if validation fails
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * 
 * @example
 * ```ts
 * const body = await parseJsonBody(request);
 * const validated = validateRequest(chatRequestSchema, body);
 * ```
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns result object instead of throwing
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success boolean and data/error
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
