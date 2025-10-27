# State Management Guide

How to manage data in this app.

## Types of State

### 1. Local State (Component Level)
Data that **only one component** needs:

```typescript
function MyComponent() {
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </div>
  );
}
```

**Use when:** Only this component needs the data

### 2. Global State (Context)
Data that **many components** need to access:

```typescript
// EditModeContext - needed by almost every component
const { isEditing } = useIsEditMode();

// FontFamilyContext - needed by text components
const { fontFamily } = useFontFamily();

// GlobalEditModeContext - needed across entire app
const { globalEditMode } = useGlobalEditMode();
```

**Use when:** Multiple components in different parts of the app need the data

## How Contexts Work

### The Pattern

Every context has 3 parts:

```typescript
// 1. Create Context
const MyContext = createContext<MyContextType | undefined>(undefined);

// 2. Create Provider Component
export function MyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState("");

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

// 3. Create Hook to Use It
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
}
```

### Using a Context

**Step 1:** Wrap your app with Provider (in `App.tsx`)
```typescript
<EditModeProvider>
  <FontFamilyProvider>
    <SceneContent />
  </FontFamilyProvider>
</EditModeProvider>
```

**Step 2:** Use the hook in any component
```typescript
function MyComponent() {
  const { isEditing, setIsEditing } = useIsEditMode();

  return (
    <button onClick={() => setIsEditing(!isEditing)}>
      {isEditing ? "Stop Editing" : "Edit"}
    </button>
  );
}
```

## Contexts in This Project

### EditModeContext
**What it does:** Controls if we're in edit mode or view mode

**File:** `src/contexts/EditModeContext.tsx`

**Use with:**
```typescript
const { isEditing, setIsEditing } = useIsEditMode();
```

**Example:**
```typescript
if (isEditing) {
  return <EditableText value={content} onChange={setContent} />;
} else {
  return <p>{content}</p>;
}
```

### FontFamilyContext
**What it does:** Manages selected font family

**File:** `src/contexts/FontFamilyContext.tsx`

**Use with:**
```typescript
const { fontFamily, setFontFamily } = useFontFamily();
```

**Example:**
```typescript
<FontWrapper>
  <p>This text uses the selected font</p>
</FontWrapper>
```

### GlobalEditModeContext
**What it does:** Global edit mode toggle (optional extra layer)

**File:** `src/contexts/GlobalEditModeContext.tsx`

**Use with:**
```typescript
const { globalEditMode } = useGlobalEditMode();
```

## Local vs Global: When to Use What

### Use Local State When:
- ✅ Only this component needs the data
- ✅ Data doesn't need to be shared
- ✅ Quick toggle or temporary data

**Example:**
```typescript
function Modal() {
  const [isOpen, setIsOpen] = useState(false); // Local
  return <>{isOpen && <ModalContent />}</>;
}
```

### Use Global State (Context) When:
- ✅ Many components in different places need it
- ✅ Data should persist across navigation
- ✅ Data affects overall app behavior

**Example:**
```typescript
// Edit mode affects ALL scenes and components
const { isEditing } = useIsEditMode();

// Font affects ALL text components
const { fontFamily } = useFontFamily();
```

## Performance Tips

### Problem: Too Many Re-renders
If you change state, ALL components using that context re-render.

### Solution: Split Contexts
Instead of one giant context, use separate contexts:

```typescript
// ❌ Bad: Everything in one context
<AppContext.Provider value={{ isEditing, fontFamily, language, ... }}>
  {/* All components re-render when ANY value changes */}
</AppContext.Provider>

// ✅ Good: Separate contexts
<EditModeProvider>
  <FontFamilyProvider>
    <LanguageProvider>
      {/* Only affected components re-render */}
    </LanguageProvider>
  </FontFamilyProvider>
</EditModeProvider>
```

## State Update Patterns

### Pattern 1: Simple Toggle
```typescript
const { isEditing, setIsEditing } = useIsEditMode();

<button onClick={() => setIsEditing(!isEditing)}>
  Toggle Edit Mode
</button>
```

### Pattern 2: Conditional Update
```typescript
const { fontFamily, setFontFamily } = useFontFamily();

function changeFontSize(size: string) {
  if (size === "large") {
    setFontFamily("Georgia");
  } else {
    setFontFamily("Arial");
  }
}
```

### Pattern 3: Multiple Dependencies
```typescript
const { isEditing } = useIsEditMode();
const { fontFamily } = useFontFamily();
const { language } = useLanguage();

// Component re-renders when ANY of these change
return (
  <div style={{ fontFamily }}>
    {isEditing && <EditUI />}
    Language: {language}
  </div>
);
```

## Anti-Patterns (Don't Do This)

### ❌ Store everything in one context
```typescript
// Bad: Overloaded context
const [appState, setAppState] = useState({
  isEditing: false,
  fontFamily: "Arial",
  language: "en",
  isDarkMode: true,
  // ... 20 more things
});
```

### ✅ Use separate contexts
```typescript
// Good: Focused contexts
<EditModeProvider>
  <FontFamilyProvider>
    <LanguageProvider>
      {/* etc */}
    </LanguageProvider>
  </FontFamilyProvider>
</EditModeProvider>
```

### ❌ Directly modify objects in state
```typescript
// Bad
const state = useState({ count: 0 });
state.count = 1; // Wrong!
```

### ✅ Use setState
```typescript
// Good
const [count, setCount] = useState(0);
setCount(1); // Right!
```

### ❌ Keep outdated data
```typescript
// Bad
const [user, setUser] = useState({ name: "John", email: "old@email.com" });
// User changed email but we didn't update state
```

### ✅ Keep state updated
```typescript
// Good
const [user, setUser] = useState({ name: "John", email: "old@email.com" });

function updateEmail(newEmail: string) {
  setUser({ ...user, email: newEmail });
}
```

## Common State Management Tasks

### Task 1: Toggle Edit Mode
```typescript
// In a button component
const { isEditing, setIsEditing } = useIsEditMode();

<button onClick={() => setIsEditing(!isEditing)}>
  {isEditing ? "Done Editing" : "Edit Content"}
</button>
```

### Task 2: Update Font in Multiple Components
```typescript
// In settings/dropdown
const { setFontFamily } = useFontFamily();

<select onChange={(e) => setFontFamily(e.target.value)}>
  <option value="Arial">Arial</option>
  <option value="Georgia">Georgia</option>
</select>

// In any text component
const { fontFamily } = useFontFamily();
<FontWrapper>Content respects font choice</FontWrapper>
```

### Task 3: Sync with SCORM
```typescript
const [score, setScore] = useState(0);

useEffect(() => {
  // Update SCORM when score changes
  if (scormService.isInitialized()) {
    scormService.setScore(score);
  }
}, [score]); // Re-run when score changes
```

## Debugging State

### See What's in Context
```typescript
function DebugComponent() {
  const editMode = useIsEditMode();
  const font = useFontFamily();

  console.log("Edit Mode:", editMode);
  console.log("Font:", font);

  return null;
}
```

### Check if Hook Works
```typescript
// Add this temporarily to any component
const context = useIsEditMode();

if (!context) {
  console.error("EditModeContext not working!");
} else {
  console.log("Context value:", context);
}
```

### React DevTools
1. Install React DevTools extension
2. Open DevTools → Components tab
3. Look for context values
4. See what props components received
