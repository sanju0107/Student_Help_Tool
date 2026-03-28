# Cover Letter Tool - Visual Reference Guide

## 🎨 UI Layout Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                   AI COVER LETTER GENERATOR                          │
│          Create professional, job-winning cover letters              │
└──────────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐  ┌─────────────────────────────────────┐
│     INPUT FORM (LEFT)      │  │  FORM SUMMARY (RIGHT) - *NEW*       │
├────────────────────────────┤  ├─────────────────────────────────────┤
│ [Job Details Card]         │  │ [Form Summary Card]                 │
│ ┌──────────────────────┐   │  │ 👁 Form Summary    [Toggle Button]  │
│ │ 📌 Job Title        │   │  │ ┌─────────────────────────────────┐ │
│ │ [Input Box]         │   │  │ │ 🔵 JOB TITLE                    │ │
│ │                     │   │  │ │ Senior Frontend Developer       │ │
│ └──────────────────────┘   │  │ └─────────────────────────────────┘ │
│                            │  │                                     │
│ ┌──────────────────────┐   │  │ ┌─────────────────────────────────┐ │
│ │ 🏢 Company Name     │   │  │ │ 🟠 COMPANY                      │ │
│ │ [Input Box]         │   │  │ │ Tech Innovations Inc.           │ │
│ └──────────────────────┘   │  │ └─────────────────────────────────┘ │
│                            │  │                                     │
│ ┌──────────────┬─────────┐ │  │ ┌───────────────┬───────────────┐   │
│ │ 👤 Experience│ Skills  │ │  │ │ 🟣 EXP        │ 🟢 SKILLS     │   │
│ │ [Input]     │[Input] │ │  │ │ 6 years       │ 5 skills      │   │
│ └──────────────┴─────────┘ │  │ └───────────────┴───────────────┘   │
│                            │  │                                     │
│ ┌──────────────────────┐   │  │ ┌─────────────────────────────────┐ │
│ │ 📄 Job Description  │   │  │ │ 🩷 JOB DESCRIPTION PREVIEW     │ │
│ │ [Text Area]         │   │  │ │ Looking for a talented FE      │ │
│ │ [Scrollable]        │   │  │ │ developer with 5+ years of     │ │
│ │ [500 chars]         │   │  │ │ experience... [Scrollable 200] │ │
│ └──────────────────────┘   │  │ └─────────────────────────────────┘ │
│                            │  │                                     │
│ ┌──────────────────────┐   │  │ ┌─────────────────────────────────┐ │
│ │ ⚠️  Error (if any)  │   │  │ │ 🔵 ✓ READY TO GENERATE        │ │
│ │ (Shows in red)      │   │  │ │ All required fields filled!    │ │
│ └──────────────────────┘   │  │ └─────────────────────────────────┘ │
│                            │  │                                     │
│ ┌──────────────────────┐   │  │                                     │
│ │ ✨ GENERATE LETTER  │   │  │ [Space for layout]              │ │
│ │ (Blue Button)       │   │  │                                  │ │
│ │ [Full Width]        │   │  └─────────────────────────────────┘ │
│ └──────────────────────┘   │                                     │
└────────────────────────────┘  ┌─────────────────────────────────────┐
                                 │  GENERATED LETTER (RIGHT BOTTOM)    │
                                 ├─────────────────────────────────────┤
                                 │ 📄 Generated Letter  📋 Copy Download│
                                 │ ┌─────────────────────────────────┐ │
                                 │ │ [Your Name]                     │ │
                                 │ │ [Your Address]                  │ │
                                 │ │ [Date]                          │ │
                                 │ │                                 │ │
                                 │ │ Dear Hiring Manager,            │ │
                                 │ │                                 │ │
                                 │ │ I am writing to express my      │ │
                                 │ │ enthusiasm for the Senior...    │ │
                                 │ │                                 │ │
                                 │ │ With 6 years of extensive      │ │
                                 │ │ experience in frontend...      │ │
                                 │ │                                 │ │
                                 │ │ [Letter continues...scrollable]│ │
                                 │ │                                 │ │
                                 │ │ Warm regards,                   │ │
                                 │ │ [Your Name]                     │ │
                                 │ └─────────────────────────────────┘ │
                                 └─────────────────────────────────────┘

                            📱 Pro Tip Card (Below form)
                    ┌──────────────────────────────────────┐
                    │ 💡 Pro Tip                           │
                    │ More job details = Better tailoring  │
                    │ Paste full job descriptions for      │
                    │ maximum AI accuracy                  │
                    └──────────────────────────────────────┘
```

---

## 🎯 Form Summary Color Reference

### Job Title Box (Blue)
```
┌────────────────────────────────────────┐
│ JOB TITLE                              │
├────────────────────────────────────────┤
│ Senior Frontend Developer              │
│                                        │
│ Background: Light Blue (from-blue-50)  │
│ Text: Blue-600                         │
│ Border: Blue-100                       │
└────────────────────────────────────────┘
```

### Company Name Box (Orange)
```
┌────────────────────────────────────────┐
│ COMPANY                                │
├────────────────────────────────────────┤
│ Tech Innovations Inc.                  │
│                                        │
│ Background: Light Orange               │
│ Text: Orange-600                       │
│ Border: Orange-100                     │
└────────────────────────────────────────┘
```

### Experience Box (Purple)
```
┌──────────────────────┐
│ EXPERIENCE           │
├──────────────────────┤
│ 6 years              │
│                      │
│ Background: LightPurple
│ Text: Purple-600     │
│ Border: Purple-100   │
└──────────────────────┘
```

### Skills Count Box (Green)
```
┌──────────────────────┐
│ SKILLS COUNT         │
├──────────────────────┤
│ 5 skills             │
│                      │
│ Background: LightGreen
│ Text: Green-600      │
│ Border: Green-100    │
└──────────────────────┘
```

### Job Description Box (Pink)
```
┌────────────────────────────────────────┐
│ JOB DESCRIPTION PREVIEW                │
├────────────────────────────────────────┤
│ ┌──────────────────────────────────┐  │
│ │ We are looking for a talented FE │ │ ← First 200 chars
│ │ developer with 5+ years of exp...│ │    (scrollable)
│ │                                  │ │
│ │ Background inside: White         │ │
│ │ Max Height: 96px (scrollable)    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Outer Background: Light Pink         │
│ Text: Pink-600                       │
│ Border: Pink-100                     │
└────────────────────────────────────────┘
```

### Status Banner
```
┌────────────────────────────────────────┐
│ ✓ READY TO GENERATE                    │
├────────────────────────────────────────┤
│ All required fields filled!            │
│                                        │
│ Background: Blue-50                    │
│ Left Border: Blue-500 (4px)            │
│ Text: Blue-700                         │
│ Status: Bold, Uppercase               │
└────────────────────────────────────────┘
```

---

## 🔄 Real-Time Update Flow

### User Action 1: Types Job Title
```
┌─────────────────────────────────┐
│ Input Box                       │
│ [User types: "Senior Dev"]      │
└─────────────────────────────────┘
              ↓
        State Updates
              ↓
┌─────────────────────────────────┐
│ 🔵 JOB TITLE                    │
│ Senior Dev                      │  ← Updates instantly!
└─────────────────────────────────┘
```

### User Action 2: Adds More Skills
```
Input: "React, TypeScript, Node.js, REST, GraphQL"
           ↓
State Updates
           ↓
┌──────────────────────┐
│ 🟢 SKILLS COUNT      │
│ 5 skills             │  ← Counted & displayed
└──────────────────────┘
```

### User Action 3: Ensures Generation Ready
```
formData.jobTitle = "Senior Dev"
formData.companyName = "Google"
           ↓
System Checks
           ↓
┌────────────────────────────────────┐
│ 🔵 ✓ READY TO GENERATE            │
│ All required fields filled!        │
└────────────────────────────────────┘
```

### User Action 4: Clicks Generate
```
Generate Button Clicked
           ↓
Sends to AI:
{
  jobTitle: "Senior Frontend Developer",
  companyName: "Google",
  experience: "6 years",
  skills: "React, TypeScript, Node.js, REST, GraphQL",
  jobDescription: "[Full job description...]"
}
           ↓
AI Processes
           ↓
Letter Generated & Displayed
```

---

## 📱 Responsive Behavior

### Desktop View (1200px) - DEFAULT
```
┌──────────────────────────────────────────────────────┐
│ Input Form (40%)    │ Previews (60%)                │
│                     │  - Form Summary              │
│                     │  - Generated Letter          │
└──────────────────────────────────────────────────────┘
```

### Tablet View (768px)
```
┌─────────────────────────────────┐
│ Input Form (100%)               │
├─────────────────────────────────┤
│ Form Summary (100%)             │
├─────────────────────────────────┤
│ Generated Letter (100%)         │
└─────────────────────────────────┘
```

### Mobile View (375px)
```
┌──────────────────────┐
│ Input Form           │
│ (Full Width)         │
├──────────────────────┤
│ Form Summary         │
│ (Collapsible)        │
├──────────────────────┤
│ Generated Letter     │
│ (Scrollable)         │
└──────────────────────┘
```

---

## 🧪 Test Scenarios

### Scenario 1: Full Data Entry
```
INPUT:
- Job Title: "Senior Frontend Developer"
- Company: "Google"
- Experience: "6 years"
- Skills: "React, TypeScript, Node.js, REST APIs, GraphQL"
- Job Description: [Full job posting pasted]

PREVIEW SHOWS:
✅ 🔵 Job Title: "Senior Frontend Developer"
✅ 🟠 Company: "Google"
✅ 🟣 Experience: "6 years"
✅ 🟢 Skills: "5 skills"
✅ 🩷 Description: "Looking for a senior frontend developer..."
✅ 🔵 Status: "✓ Ready to Generate"

RESULT: Generate button ENABLED ✅
```

### Scenario 2: Missing Required Field
```
INPUT:
- Job Title: "" ← EMPTY
- Company: "Google"
- Experience: "6 years"
- Skills: "React, TypeScript"
- Job Description: [Something]

PREVIEW SHOWS:
❌ 🔵 Job Title: "Not entered"
✅ 🟠 Company: "Google"
✅ 🟣 Experience: "6 years"
✅ 🟢 Skills: "2 skills"
✅ 🩷 Description: [visible]
❌ 🔵 Status: "Fill in Job Title and Company Name"

RESULT: Generate button DISABLED ❌
```

### Scenario 3: Toggle Preview
```
USER CLICKS: Eye Icon Button

BEFORE:
┌─────────────────┐
│ Form Summary    │
│ ┌─────────────┐ │
│ │ Color Boxes │ │
│ │ (Visible)   │ │
│ └─────────────┘ │
└─────────────────┘

AFTER:
┌─────────────────┐
│ Form Summary    │
│ (Collapsed)     │  ← Summary hidden
│ (Eye icon shown)│
└─────────────────┘
```

---

## 🎬 Animation States

### Preview Toggle Animation
```
Duration: 300ms
Effect 1: Opacity fade (0 → 1 or 1 → 0)
Effect 2: Height transition (0 → auto or auto → 0)
Easing: Smooth (Framer Motion default)
Result: Smooth show/hide effect
```

### Generated Letter Appearance
```
When generated letter appears:
┌─────────────────────────────────┐
│ 📋 Copy  💾 Download buttons    │  ← Fade in
│                                 │     (300ms)
│ Letter content                  │
└─────────────────────────────────┘
```

---

## ⌨️ Keyboard Navigation

### Tab Order
```
1. Job Title Input
   ↓
2. Company Name Input
   ↓
3. Experience Input
   ↓
4. Skills Input
   ↓
5. Job Description Textarea
   ↓
6. Generate Button
   ↓
7. Copy Button (if letter exists)
   ↓
8. Download Button (if letter exists)
   ↓
9. Toggle Preview Button
```

### Keyboard Shortcuts
```
Tab     → Next field
Shift+Tab → Previous field
Enter   → In textarea: new line
        → On button: activate
Space   → On button: activate
```

---

## 🎨 Color Palette Reference

### Tailwind Colors Used
```
Blue Series:
- bg-blue-50        (Light background)
- text-blue-600     (Text)
- border-blue-100   (Border)
- border-blue-500   (Accent)

Orange Series:
- bg-orange-50
- text-orange-600
- border-orange-100

Purple Series:
- bg-purple-50
- text-purple-600
- border-purple-100

Green Series:
- bg-green-50
- text-green-600
- border-green-100

Pink Series:
- bg-pink-50
- text-pink-600
- border-pink-100

Slate Series (Default):
- bg-slate-50       (Letter background)
- text-slate-700    (Letter text)
- border-slate-100  (Subtle borders)
```

---

## 📊 Layout Dimensions

### Form Summary Card
```
Width: Full parent width (responsive)
Padding: 16px (p-4)
Border Radius: 8px (rounded-lg)
Gap between sections: 16px (space-y-4)
```

### Preview Boxes
```
Width: Full (individual boxes)
Height: Auto (content-based)
Minimum Height: 24px (min-h-[24px])
Padding: 16px (p-4)
Border: 1px
Border Radius: 8px (rounded-lg)
Font Size: 12px (labels), 14px (values)
```

### Generated Letter Display
```
Width: Full
Height: 600px max (max-h-[600px])
Overflow: Scrollable Y-axis
Padding: 32px (p-8)
Border Radius: 16px (rounded-2xl)
Background: Slate-50
Border: 1px solid Slate-100
Font: Serif, 16px for letter content
```

---

## ✨ Interactive Elements

### Buttons
```
Copy Button:
- Shows: 📋 Copy (normal)
- Shows: ✓ Copied (after click, 2s)
- Color: Slate-600 (normal)
- Color: Green-500 (copied state)

Download Button:
- Shows: 💾 Download
- Color: Slate-600 (hover: Blue-600)
- Saves: cover-letter-{company}.txt
```

### Hover States
```
Input Fields:
- Border Color: Slate-100 → Blue-500
- Transition: 150ms

Buttons:
- Color: Slate-600 → Blue-600
- Background: None → Blue-50
- Transition: 150ms
```

---

**Visual Reference Complete!**  
All UI elements, colors, layouts, and interactions documented above.

**Last Updated**: March 28, 2026
