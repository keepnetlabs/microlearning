# SCORM Integration Guide

How the platform tracks learning and communicates with SCORM.

## What is SCORM?

**SCORM = Shareable Content Object Reference Model**

Think of it as a **standardized language** for learning platforms to communicate with learning management systems (LMS).

**Simple analogy:** If LMS is a school and SCORM is the report card system, the course is the student, and we need to send scores/progress back to the school.

## How It Works in Simple Terms

```
User learns something
        ↓
We calculate score
        ↓
We tell SCORM about it
        ↓
SCORM saves to LMS
        ↓
LMS shows user's progress
```

## The SCORM Service

**File:** `src/services/scormService.ts`

This service handles all SCORM communication.

### Check if SCORM is Available
```typescript
if (scormService.isInitialized()) {
  // SCORM is available, we can send data
  scormService.setScore(85);
} else {
  // SCORM is not available (e.g., testing locally)
  console.log("SCORM not available");
}
```

### Common SCORM Operations

#### 1. Set Score
When user completes a quiz and gets a score:

```typescript
const score = 85; // Out of 100

if (scormService.isInitialized()) {
  scormService.setScore(score);
}
```

#### 2. Set Completion Status
When user finishes the content:

```typescript
if (scormService.isInitialized()) {
  scormService.setStatus("completed");
  // Options: "not attempted", "incomplete", "completed"
}
```

#### 3. Log Interactions
When user does something important:

```typescript
if (scormService.isInitialized()) {
  scormService.logInteraction("User answered question 1: Yes");
}
```

#### 4. Get Data from SCORM
Retrieve previously saved data:

```typescript
const savedData = scormService.getDataValue("key");
console.log("Saved data:", savedData);
```

## Real-World Example: Quiz Scene

Here's how a typical scene tracks learning:

```typescript
export const QuizScene = React.memo(function QuizScene() {
  const { isEditing } = useIsEditMode();
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  // Calculate score when answers change
  const calculateScore = useCallback(() => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === CORRECT_ANSWERS[index]) {
        correct++;
      }
    });
    const percentage = (correct / answers.length) * 100;
    setScore(percentage);

    // Tell SCORM about the score
    if (scormService.isInitialized()) {
      scormService.setScore(Math.round(percentage));
      scormService.logInteraction(`Answered ${correct}/${answers.length}`);
    }
  }, [answers]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    calculateScore();

    // Mark as completed
    if (scormService.isInitialized()) {
      scormService.setStatus("completed");
    }
  }, [calculateScore]);

  return (
    <div>
      {isEditing && <EditModePanel />}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <Question
            key={index}
            question={q}
            onAnswer={(answer) => {
              const newAnswers = [...answers];
              newAnswers[index] = answer;
              setAnswers(newAnswers);
            }}
          />
        ))}
      </div>
      <ScoreDisplay score={score} />
      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  );
});
```

## Using SCORM in Different Scenes

### Intro Scene: Log View
```typescript
useEffect(() => {
  if (scormService.isInitialized()) {
    scormService.logInteraction("Viewed intro scene");
  }
}, []);
```

### Scenario Scene: Log Completion
```typescript
function handleScenarioComplete() {
  if (scormService.isInitialized()) {
    scormService.logInteraction("Completed scenario: Phishing Email");
    scormService.setStatus("completed");
  }
}
```

### Survey Scene: Log Responses
```typescript
function handleSurveySubmit(responses: object) {
  if (scormService.isInitialized()) {
    scormService.logInteraction(`Survey submitted: ${JSON.stringify(responses)}`);
    scormService.setStatus("completed");
  }
}
```

## Error Handling

### Graceful Failures
SCORM might not always be available (e.g., local development).

**Good pattern:**
```typescript
// Always check first
if (scormService.isInitialized()) {
  try {
    scormService.setScore(score);
  } catch (error) {
    logger.error("Failed to save SCORM data", error);
    // Continue anyway - don't break the user experience
  }
} else {
  logger.info("SCORM not available - running in development mode");
}
```

**Never do this:**
```typescript
// ❌ Bad: assumes SCORM always works
scormService.setScore(score); // Might crash!
```

## Data Types

### Score
- **Range:** 0-100
- **Type:** Number
- **Example:** `85`

### Status
- **Options:** "not attempted", "incomplete", "completed"
- **Type:** String
- **Example:** `"completed"`

### Interaction Log
- **Type:** String (human readable)
- **Example:** `"User answered question 1 correctly"`

## Debugging SCORM

### Check if SCORM Initialized
```typescript
const isReady = scormService.isInitialized();
console.log("SCORM Ready:", isReady);
```

### Log All SCORM Calls
```typescript
// Add this to App.tsx to monitor SCORM
useEffect(() => {
  if (scormService.isInitialized()) {
    logger.info("SCORM is initialized and ready");
  } else {
    logger.warn("SCORM is NOT initialized - might be in development mode");
  }
}, []);
```

### Test SCORM Locally
SCORM usually doesn't work in local development. To test:
1. Deploy to a server with SCORM support
2. Access through LMS
3. Check if data is saved

### Common Issues

**Issue:** "SCORM not initialized"
- **Cause:** Running locally without LMS
- **Solution:** Add `if (scormService.isInitialized())` check before using SCORM

**Issue:** "Score not saving"
- **Cause:** Score out of range (not 0-100)
- **Solution:** Convert to percentage: `Math.round((score / total) * 100)`

**Issue:** "Status not updating"
- **Cause:** Using wrong status value
- **Solution:** Use only: "not attempted", "incomplete", "completed"

## Best Practices

### ✅ Do This
```typescript
// 1. Check if SCORM is available
if (scormService.isInitialized()) {
  // 2. Set score (0-100)
  scormService.setScore(85);

  // 3. Set status
  scormService.setStatus("completed");

  // 4. Log interaction
  scormService.logInteraction("Quiz completed with 85%");
}
```

### ❌ Don't Do This
```typescript
// ❌ Assume SCORM always works
scormService.setScore(score);

// ❌ Send invalid values
scormService.setScore(-50); // Invalid!
scormService.setStatus("done"); // Invalid!

// ❌ Send too much data
scormService.logInteraction("User clicked..."); // Too verbose
```

## SCORM Data Flow

```
Scene Component
    ↓
Calculation (quiz answers, completion, etc.)
    ↓
Check: scormService.isInitialized()?
    ↓
    Yes → Send to SCORM
    No → Continue locally
    ↓
SCORM saves to LMS
    ↓
User's progress tracked
```

## Key Takeaway

**Remember:** SCORM is optional. The app works with or without it.

- **With SCORM:** Tracks learning in LMS
- **Without SCORM:** Still works, just doesn't track externally

Always use the **"if initialized" check** before SCORM calls!
