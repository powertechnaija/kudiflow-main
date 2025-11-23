## Design System Rules: shadcn@latest

1.  **Component Library:** You are strictly bound to shadcn.
2.  **Icons:** Use `lucide-react`.
3.  **Utility:** You must use the `cn` helper function from `@/lib/utils`.
    ```ts
    import { cn } from "@/lib/utils"
    ```
4.  **Color Strategy:** NEVER use raw colors. Use the theme variables:
    - Backgrounds: `bg-background`, `bg-muted`, `bg-card`
    - Text: `text-foreground`, `text-muted-foreground`
    - Borders: `border-border`, `border-input`
    - Accents: `bg-primary`, `bg-secondary`, `bg-accent`
5.  **Component Composition:**
    - When creating a new widget, import existing primitives:
      `import { Button } from "@/components/ui/button"`
      `import { Card, CardContent } from "@/components/ui/card"`
6.  **Accessibility:** Ensure all interactive elements use appropriate ARIA attributes (often handled by the Radix primitives underlying shadcn).