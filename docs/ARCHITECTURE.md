# Architecture Guide

## How the App Works

Think of the platform like a **book with different chapters** (scenes). Each chapter shows different types of content to teach something.

```
App.tsx (Main Controller)
    └─ Provides Global Contexts (Edit Mode, Font Family)
        └─ Renders 8 Scenes (User navigates between them)
            └─ Each Scene uses Common Components
                └─ Components manage their own state
```

## The 8 Scenes

Each scene is a **page/chapter** showing different learning content:

| Scene | Purpose | Example |
|-------|---------|---------|
| **IntroScene** | Introduction with stats | "Learn about cybersecurity in 5 minutes" |
| **GoalScene** | Show learning goals | "By the end, you'll know..." |
| **ScenarioScene** | Real-world scenario | Video + description of a phishing attack |
| **QuizScene** | Questions with sliders | Rate your confidence 1-10 |
| **ActionableContentScene** | Actionable tips | "What to do next..." |
| **SurveyScene** | User feedback | Satisfaction survey |
| **SummaryScene** | Summary of content | Key takeaways |
| **NudgeScene** | Quick reminder | "Remember this..." |

## How Components Are Organized

```
components/
├── scenes/
│   ├── IntroScene.tsx          ← Main scene component
│   ├── intro/
│   │   └── components/         ← Scene-specific parts
│   │       ├── StatsItem.tsx
│   │       └── Particle.tsx
│   └── ... (other scenes)
│
├── common/
│   ├── EditableText.tsx        ← Used everywhere
│   ├── FontWrapper.tsx         ← Used everywhere
│   └── ScientificBasisInfo.tsx ← Used in many scenes
│
└── ui/
    ├── RichTextEditor.tsx      ← Editor for text
    ├── CallToAction.tsx        ← Buttons/CTAs
    └── modals/                 ← Popup dialogs
```

### Component Hierarchy Example

```
QuizScene (Main scene)
  ├── EditModePanel (If editing)
  ├── Question (Common component)
  │   ├── EditableText (User can edit)
  │   └── Slider (Select answer)
  └── Results (Show score)
```

## Data Flow

### Simple Data Flow
```
User Input → Hook (useIsEditMode) → Context (EditModeContext) → All Components Update
```

### Example: Edit Mode
1. User clicks "Edit" button
2. `EditModeContext` changes `isEditing` to true
3. All components using `useIsEditMode()` re-render
4. `EditableText` components show edit buttons
5. `EditModePanel` appears with save/cancel buttons

### Example: Font Change
1. User selects font in settings
2. `FontFamilyContext` updates font name
3. `FontWrapper` components change font styling
4. Text updates in all scenes

## Important Patterns

### Pattern 1: Edit Mode
```typescript
// Access edit mode anywhere
const { isEditing, setIsEditing } = useIsEditMode();

// In JSX
{isEditing ? <EditableText /> : <PlainText />}
```

### Pattern 2: Wrapping Text
```typescript
// All text should use FontWrapper for font styling
<FontWrapper>
  This text respects user's font choice
</FontWrapper>
```

### Pattern 3: Reusable Content Blocks
```typescript
// EditableText handles editing logic
<EditableText
  value={content}
  onChange={setContent}
  isEditing={isEditing}
/>
```

## Performance Optimization

**Why does it matter?** Scenes have lots of animations and content. If not optimized, it gets slow.

**What we do:**
1. **React.memo** - Don't re-render scenes unless props change
2. **useMemo** - Don't recalculate expensive things every render
3. **useCallback** - Don't create new functions every render
4. **Lazy load** - Load heavy components only when needed

Example:
```typescript
// This scene only re-renders when props actually change
export const QuizScene = React.memo(function QuizScene({ questions }) {
  // Logic here
  return ...
});
```

## How Editing Works

The app has two modes: **View Mode** and **Edit Mode**

### View Mode (Normal)
- Users see content
- Content is locked
- Can navigate between scenes

### Edit Mode (Admin)
- Content is editable
- `EditableText` shows edit buttons
- `EditModePanel` shows save/cancel
- Changes can be saved

**Toggle:** EditMode is controlled by `EditModeContext` and `useIsEditMode()` hook

## File Naming

- **Scenes:** `SomethingScene.tsx` (e.g., `QuizScene.tsx`)
- **Components:** `SomethingComponent.tsx` or `something-component.tsx`
- **Hooks:** `useFeatureName.ts` (e.g., `useLanguage.ts`)
- **Contexts:** `FeatureContext.tsx` (e.g., `EditModeContext.tsx`)
- **Services:** `featureService.ts` (e.g., `scormService.ts`)

## Common Tasks

### Add a new scene
1. Create `NewScene.tsx` in `src/components/scenes/`
2. Import common components you need
3. Use `useIsEditMode()` for edit functionality
4. Wrap with `React.memo` for performance
5. Add import in `App.tsx`

### Add a new component
1. Create in `src/components/`
2. Type all props with interface
3. Use Tailwind for styling
4. Import where needed

### Change content text
1. Find the scene (e.g., `QuizScene.tsx`)
2. Find the `EditableText` component
3. Change the `value` prop
4. Or use Edit Mode to change it visually

### Add a new context
1. Create file in `src/contexts/`
2. Create Context + Provider
3. Create custom hook (e.g., `useNewContext()`)
4. Add Provider in `App.tsx`
5. Use the hook in components

## Debugging Tips

**Scene not showing?** Check if it's imported in `App.tsx`

**Edit mode not working?** Check if component uses `useIsEditMode()` hook

**Styling looks wrong?** Check if Tailwind classes are correct (no dynamic class names)

**Performance slow?** Open DevTools → Performance tab → look for unnecessary re-renders
