const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    role: z.enum(['PATIENT', 'DOCTOR'], {
      errorMap: () => ({ message: "Role must be PATIENT or DOCTOR" }),
    }),
    specialization: z.string().optional(),
    experience_years: z.coerce.number().int().min(0).max(60).optional(),
    bio: z.string().max(1000).optional(),
    consultation_fee: z.coerce.number().min(0).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
