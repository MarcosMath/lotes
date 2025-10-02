# Sistema de Financiamiento de Lotes

## Descripción

Sistema completo para gestionar planes de financiamiento y asignarlos a lotes. Permite configurar múltiples opciones de pago a crédito con diferentes parámetros.

## Modelos de Datos

### `TipoCuotaInicial` (Enum)
- `PORCENTAJE`: Cuota inicial como porcentaje del precio de contado
- `MONTO_FIJO`: Cuota inicial como monto fijo en bolivianos

### `PlanFinanciamiento`
Tabla: `planes_financiamiento`

Define los parámetros base de un plan de financiamiento:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID autoincremental |
| nombre | String | Nombre único del plan (ej: "Plan 12 meses") |
| porcentajeAnual | Float | Tasa de interés anual (%) |
| cantidadCuotas | Int | Número de cuotas mensuales (12, 24, 36, etc.) |
| tipoCuotaInicial | TipoCuotaInicial | PORCENTAJE o MONTO_FIJO |
| valorCuotaInicial | Float | Valor según el tipo (% o Bs.) |
| activo | Boolean | Si el plan está disponible |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de actualización |

### `FinanciamientoLote`
Tabla: `financiamientos_lote`

Relaciona un lote con un plan y almacena los cálculos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID autoincremental |
| loteId | Int | ID del lote |
| planFinanciamientoId | Int | ID del plan |
| cuotaInicial | Float | Calculado según tipo |
| saldoFinanciar | Float | precioContado - cuotaInicial |
| interesTotal | Float | saldoFinanciar * (porcentajeAnual / 100) |
| cuotaMensual | Float | (saldoFinanciar + interesTotal) / cantidadCuotas |
| precioTotalCredito | Float | (cuotaMensual * cantidadCuotas) + cuotaInicial |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de actualización |

**Constraint único:** Un lote no puede tener dos financiamientos con el mismo plan.

## Fórmulas de Cálculo

### 1. Cuota Inicial
```typescript
if (plan.tipoCuotaInicial === 'PORCENTAJE') {
  cuotaInicial = precioContado * (plan.valorCuotaInicial / 100)
} else {
  cuotaInicial = plan.valorCuotaInicial
}
```

### 2. Saldo a Financiar
```typescript
saldoFinanciar = precioContado - cuotaInicial
```

### 3. Interés Total
```typescript
interesTotal = saldoFinanciar * (plan.porcentajeAnual / 100)
```

### 4. Cuota Mensual
```typescript
cuotaMensual = (saldoFinanciar + interesTotal) / plan.cantidadCuotas
```

### 5. Precio Total a Crédito
```typescript
precioTotalCredito = (cuotaMensual * plan.cantidadCuotas) + cuotaInicial
```

## Estructura de Archivos

### Schemas (Validación Zod)
- `app/schemas/planFinanciamiento.ts`
- `app/schemas/financiamientoLote.ts`

### Server Actions
- `app/actions/planFinanciamiento/`
  - `createPlanFinanciamiento.ts`
  - `updatePlanFinanciamiento.ts`
  - `deletePlanFinanciamiento.ts`
- `app/actions/financiamientoLote/`
  - `createFinanciamientoLote.ts`
  - `deleteFinanciamientoLote.ts`

### Formularios
- `components/forms/planFinanciamiento/createPlanFinanciamientoForm.tsx`
- `components/forms/financiamientoLote/createFinanciamientoLoteForm.tsx`

### Páginas
- `app/dashboard/planes-financiamiento/page.tsx` - Lista de planes
- `app/dashboard/planes-financiamiento/create/page.tsx` - Crear plan
- `app/dashboard/financiamientos/create/page.tsx` - Asignar plan a lote
- `app/dashboard/lotes/[id]/page.tsx` - Ver lote con financiamientos

## Funcionalidades

### Gestión de Planes de Financiamiento

1. **Crear Plan**
   - Configurar nombre, porcentaje anual, cantidad de cuotas
   - Elegir tipo de cuota inicial (porcentaje o monto fijo)
   - Activar/desactivar plan

2. **Listar Planes**
   - Ver todos los planes con sus parámetros
   - Contador de financiamientos creados por plan
   - Filtrar por estado (activo/inactivo)

3. **Validaciones**
   - Nombre único
   - Porcentaje anual: 0-100%
   - Si tipo es PORCENTAJE, valor debe estar entre 0-100
   - Cantidad de cuotas debe ser positiva

### Asignación de Financiamientos

1. **Crear Financiamiento**
   - Seleccionar lote
   - Seleccionar plan activo
   - Ver preview en tiempo real con todos los cálculos
   - Validar que cuota inicial no exceda precio de contado

2. **Preview Automático**
   El formulario muestra en tiempo real:
   - Cuota inicial
   - Saldo a financiar
   - Interés total
   - Cuota mensual
   - Precio total a crédito

3. **Ver Financiamientos**
   En la página de detalle del lote se muestran todos los planes disponibles en tabla comparativa

## Ejemplos de Uso

### Ejemplo 1: Plan con Porcentaje
```
Lote: Precio de contado = Bs. 50,000
Plan: "Plan 24 meses"
  - Porcentaje anual: 10%
  - Cantidad de cuotas: 24
  - Tipo cuota inicial: PORCENTAJE
  - Valor cuota inicial: 20 (20%)

Cálculos:
  - Cuota inicial: 50,000 * 0.20 = Bs. 10,000
  - Saldo a financiar: 50,000 - 10,000 = Bs. 40,000
  - Interés total: 40,000 * 0.10 = Bs. 4,000
  - Cuota mensual: (40,000 + 4,000) / 24 = Bs. 1,833.33
  - Precio total: (1,833.33 * 24) + 10,000 = Bs. 54,000
```

### Ejemplo 2: Plan con Monto Fijo
```
Lote: Precio de contado = Bs. 50,000
Plan: "Plan Promocional 12 meses"
  - Porcentaje anual: 8%
  - Cantidad de cuotas: 12
  - Tipo cuota inicial: MONTO_FIJO
  - Valor cuota inicial: Bs. 5,000

Cálculos:
  - Cuota inicial: Bs. 5,000 (fijo)
  - Saldo a financiar: 50,000 - 5,000 = Bs. 45,000
  - Interés total: 45,000 * 0.08 = Bs. 3,600
  - Cuota mensual: (45,000 + 3,600) / 12 = Bs. 4,050
  - Precio total: (4,050 * 12) + 5,000 = Bs. 53,600
```

## Rutas del Dashboard

- `/dashboard/planes-financiamiento` - Gestión de planes
- `/dashboard/planes-financiamiento/create` - Crear nuevo plan
- `/dashboard/financiamientos/create` - Asignar plan a lote
- `/dashboard/lotes/[id]` - Ver lote con financiamientos disponibles

## Migraciones

Migración aplicada: `20251002060519_add_financiamiento_models`

Para revertir (si es necesario):
```bash
npx prisma migrate reset
```

Para regenerar el cliente:
```bash
npx prisma generate
```
