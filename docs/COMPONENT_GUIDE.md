# How to Write Components

A guide to writing components the right way in this project.

## Basic Component Structure

```typescript
// 1. Define the props interface
interface ComponentNameProps {
  title: string;
  isActive?: boolean;
  onChange?: (value: string) => void;
}

// 2. Create the component
export function ComponentName({
  title,
  isActive = false,
  onChange,
}: ComponentNameProps) {
  // 3. Component logic here

  // 4. Return JSX
  return (
    <div className="p-4 rounded-lg">
      {title}
    </div>
  );
}
```

## Step-by-Step: Create a New Component

### Step 1: Create the File
Place file in right folder:
- Scene component → `src/components/scenes/`
- Common component → `src/components/common/`
- UI component → `src/components/ui/`

```
MyComponent.tsx
```

### Step 2: Define Props
```typescript
interface MyComponentProps {
  // Required props
  title: string;
  value: string;
  onChange: (value: string) => void;

  // Optional props with defaults
  placeholder?: string;
  disabled?: boolean;
}
```

### Step 3: Create Component
```typescript
export function MyComponent({
  title,
  value,
  onChange,
  placeholder = "Enter text...",
  disabled = false,
}: MyComponentProps) {
  // Your logic
  return (
    <div>
      <label>{title}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
```

### Step 4: Add Styling
Use **Tailwind CSS** classes:

```typescript
<div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
    {title}
  </h2>
</div>
```

### Step 5: Use in Another Component
```typescript
import { MyComponent } from "../components/MyComponent";

function MyScene() {
  const [text, setText] = useState("");

  return (
    <MyComponent
      title="Enter your name"
      value={text}
      onChange={setText}
      placeholder="Your name..."
    />
  );
}
```

## Common Component Types

### 1. Display Component (Show data)
```typescript
interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
}

export function UserCard({ name, email, avatar }: UserCardProps) {
  return (
    <div className="p-4 bg-white rounded shadow">
      {avatar && <img src={avatar} className="w-12 h-12 rounded-full" />}
      <h3>{name}</h3>
      <p className="text-gray-600">{email}</p>
    </div>
  );
}
```

### 2. Input Component (Get data from user)
```typescript
interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: TextInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 border rounded-lg"
      />
    </div>
  );
}
```

### 3. Container Component (Contains other components)
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// Usage
<Card title="My Title">
  <p>Some content</p>
  <p>More content</p>
</Card>
```

## Using Hooks in Components

### Access Edit Mode
```typescript
import { useIsEditMode } from "../hooks/useIsEditMode";

export function MyComponent() {
  const { isEditing } = useIsEditMode();

  return isEditing ? <EditUI /> : <ViewUI />;
}
```

### Use Font Family
```typescript
import { useFontFamily } from "../hooks/useFontFamily";

export function TextContent() {
  const { fontFamily } = useFontFamily();

  return (
    <div style={{ fontFamily }}>
      This text uses selected font
    </div>
  );
}
```

### Custom Hook Usage
```typescript
import { useLanguage } from "../hooks/useLanguage";

export function LanguageDisplay() {
  const { language } = useLanguage();

  return <p>Current language: {language}</p>;
}
```

## Styling Best Practices

### Do: Use Tailwind Classes
```typescript
<div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
  Content
</div>
```

### Don't: Use inline styles
```typescript
// ❌ Avoid this
<div style={{ padding: "1rem", borderRadius: "0.5rem" }}>
  Content
</div>
```

### Do: Support Dark Mode
```typescript
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  This works in both light and dark mode
</div>
```

### Don't: Hardcode colors
```typescript
// ❌ Avoid this
<div style={{ backgroundColor: "#ffffff" }}>
  Only light mode
</div>
```

## Reusable Text Component Example

Here's a good example of a reusable, editable text component:

```typescript
interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isEditing?: boolean;
}

export function EditableText({
  value,
  onChange,
  placeholder = "Click to edit",
  isEditing = false,
}: EditableTextProps) {
  if (isEditing) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
      />
    );
  }

  return (
    <div className="p-2 rounded">
      {value || placeholder}
    </div>
  );
}

// Usage in a scene
export function MyScene() {
  const [content, setContent] = useState("Hello");
  const { isEditing } = useIsEditMode();

  return (
    <EditableText
      value={content}
      onChange={setContent}
      isEditing={isEditing}
    />
  );
}
```

## Common Mistakes to Avoid

### ❌ Forgot to type props
```typescript
// Bad
export function Button({ onClick, label }) { ... }
```

### ✅ Type props correctly
```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  label: string;
}
export function Button({ onClick, label }: ButtonProps) { ... }
```

### ❌ Don't use console.log
```typescript
// Bad
console.log("Debug:", value);
```

### ✅ Use logger utility
```typescript
// Good
import { logger } from "../services/logger";
logger.info("Debug:", value);
```

### ❌ Don't hardcode strings
```typescript
// Bad
<button>{"Click me"}</button>
```

### ✅ Use descriptive variable names
```typescript
// Good
const buttonLabel = "Click me";
<button>{buttonLabel}</button>
```

## Testing Your Component

### Manual Test
1. Create component
2. Use in a scene
3. Check if it displays correctly
4. Check dark mode (toggle theme)
5. Check responsive (resize browser)

### Check Edit Mode
1. Toggle edit mode
2. Verify component responds to `useIsEditMode()`
3. Verify changes save correctly

### Performance Check
1. Open DevTools → Components tab
2. Check for unnecessary re-renders
3. Use `React.memo` if needed

## File Size Guide

- **Small component:** < 100 lines (Button, Label, Badge)
- **Medium component:** 100-300 lines (TextInput, Card, Modal)
- **Large component:** 300+ lines (Scene, Complex Form)

If component is getting large, split it into smaller ones!
