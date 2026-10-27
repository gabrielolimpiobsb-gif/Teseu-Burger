import { z } from 'zod';

/**
 * Sanitizes input strings against HTML/script injection.
 */
export function sanitizeString(val: string): string {
  return val
    .replace(/[<>]/g, '') // Strip angle brackets
    .trim();
}

export const CustomerDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve conter pelo menos 2 caracteres')
    .max(80, 'Nome excessivamente longo')
    .transform(sanitizeString),
  phone: z
    .string()
    .min(8, 'Telefone inválido')
    .max(20, 'Telefone inválido')
    .regex(/^[0-9()\s+\-]+$/, 'Formato de telefone contém caracteres inválidos')
    .transform(sanitizeString),
  address: z
    .string()
    .max(250, 'Endereço muito longo')
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined)),
  deliveryMethod: z.enum(['delivery', 'takeaway']),
  paymentMethod: z.enum(['pix', 'card', 'cash']),
  notes: z
    .string()
    .max(300, 'Observação não pode exceder 300 caracteres')
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined)),
});

export const CartItemSchema = z.object({
  id: z.string().max(80),
  menuItemId: z.string().max(50),
  name: z.string().max(80).transform(sanitizeString),
  unitPrice: z.number().positive('Preço unitário deve ser positivo').max(1000),
  quantity: z.number().int().positive('Quantidade deve ser positiva').max(50),
  totalPrice: z.number().positive('Preço total deve ser positivo').max(50000),
  imageType: z.string().max(50),
  doneness: z.string().max(50).optional(),
  selectedToppings: z
    .array(
      z.object({
        id: z.string().max(50),
        name: z.string().max(80).transform(sanitizeString),
        price: z.number().nonnegative(),
      })
    )
    .max(15),
  isComboUpgrade: z.boolean().default(false),
  comboDrink: z.string().max(50).optional(),
  notes: z
    .string()
    .max(200)
    .optional()
    .transform((val) => (val ? sanitizeString(val) : undefined)),
});

export const CreateOrderSchema = z.object({
  customer: CustomerDetailsSchema,
  items: z.array(CartItemSchema).min(1, 'O pedido deve conter pelo menos 1 item').max(50),
  subtotal: z.number().positive(),
  deliveryFee: z.number().nonnegative().default(0),
  total: z.number().positive(),
  discount: z.number().nonnegative().default(0),
  appliedCoupon: z.string().max(30).optional(),
});

export type ValidatedOrderInput = z.infer<typeof CreateOrderSchema>;
