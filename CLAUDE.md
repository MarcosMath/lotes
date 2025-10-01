# Sistema de Venta de Lotes a Crédito

Aplicación web monolítica para la gestión y venta de terrenos con sistema de pagos a crédito.

## Stack Tecnológico

- **Framework**: Next.js con TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Formularios**: React Hook Form (shadcn/ui)
- **Validaciones**: Zod

## Arquitectura

- Aplicación monolítica Next.js
- Todo el código en un solo repositorio

## Convenciones de Código

### Componentes

- Usar componentes de shadcn/ui como base
- Componentes en PascalCase
- Preferir Server Components cuando sea posible
- Usar "use client" solo cuando sea necesario

### Formularios

- **SIEMPRE** usar React Hook Form de shadcn/ui
- Integrar validaciones con Zod mediante el resolver
- Mostrar errores de validación en tiempo real

Ejemplo:

```typescript
const formSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
});
```
