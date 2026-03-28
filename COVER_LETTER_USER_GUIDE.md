# Cover Letter Tool - Quick Start Guide

## Access the Tool
- **URL**: `http://localhost:3001/ai/cover-letter`
- **Mobile**: Fully responsive, works on all devices
- **No signup required**: Completely free to use

---

## How to Use (Step-by-Step)

### Step 1️⃣ Enter Job Title
- Type the position you're applying for
- Example: "Senior Frontend Developer"
- **Preview Updates Instantly**: Blue box shows your entry in real-time

### Step 2️⃣ Enter Company Name
- Type the company name
- Example: "Tech Innovations Inc."
- **Preview Updates Instantly**: Orange box reflects the company name

### Step 3️⃣ Enter Your Experience
- Enter years or duration of experience
- Example: "5 years" or "2.5 years in software development"
- **Preview Updates Instantly**: Purple box shows your experience

### Step 4️⃣ Add Key Skills
- Enter skills separated by commas
- Example: "React, TypeScript, Node.js, REST APIs"
- **Preview Updates Instantly**: Green box shows skill count (e.g., "4 skills")

### Step 5️⃣ (Optional) Add Job Description
- Paste the job description from the posting
- AI uses this to tailor the letter
- **Preview Updates Instantly**: Pink box shows first 200 characters
- Leave blank if you want a generic letter

### Step 6️⃣ Review Form Summary
- Check the left panel for all entered data
- All fields displayed in color-coded boxes
- Verify everything is correct before generation
- **Toggle Preview**: Click eye icon to hide/show summary

### Step 7️⃣ Generate Cover Letter
- Click "Generate Cover Letter" button
- Uses GPT-4o-mini AI model
- Takes 3-5 seconds typically
- **Loading State**: Shows "Generating with AI..." spinner

### Step 8️⃣ View Generated Letter
- Letter appears in the right panel
- Formatted professionally with placeholders
- Ready to customize

### Step 9️⃣ Copy or Download
- **Copy Button**: Copies entire letter to clipboard (shows "Copied" confirmation)
- **Download Button**: Saves as `cover-letter-{companyname}.txt`

---

## Preview Features

### Form Summary (Left Panel)
Shows all inputs in real-time with color coding:

| Color | Field | What It Shows |
|-------|-------|---------------|
| 🔵 Blue | Job Title | Position you're applying for |
| 🟠 Orange | Company | Target company name |
| 🟣 Purple | Experience | Years/duration of experience |
| 🟢 Green | Skills | Number of skills entered |
| 🩷 Pink | Job Description | First 200 characters of description |
| 🔵 Blue | Status | "Ready to Generate" when complete |

### Generated Letter (Right Panel)
- Live preview of AI-generated letter
- Formatted with professional structure
- Includes placeholders: [Your Name], [Your Address], etc.
- Uses all your form data to personalize

---

## Example Walkthrough

### Input Data:
```
Job Title: Senior Frontend Developer
Company: Google
Experience: 6 years
Skills: React, TypeScript, JavaScript, CSS, Node.js
Job Description: [Pasted from job posting]
```

### What You'll See in Preview:

**Form Summary:**
- 🔵 Job Title: "Senior Frontend Developer"
- 🟠 Company: "Google"
- 🟣 Experience: "6 years"
- 🟢 Skills Count: "5 skills"
- 🩷 Description: "[First 200 chars visible]"
- 🔵 Status: "✓ Ready to Generate"

**Generated Letter Content:**
```
Dear Hiring Manager,

I am writing to express my enthusiasm for the Senior Frontend 
Developer position at Google. With over 6 years of extensive 
experience in frontend development, particularly with React and 
TypeScript, I am excited about the opportunity to contribute to 
your innovative projects.

In my career, I have developed expertise in React, TypeScript, 
JavaScript, CSS, and Node.js, enabling me to build high-performance 
web applications...
```

---

## Tips for Best Results

### ✅ DO:
- Include **detailed job descriptions** for better tailoring
- Mention **specific achievements** in the experience field
- List **relevant skills** that match the job posting
- Review the **generated letter** for accuracy
- **Customize placeholders** with your actual information

### ❌ DON'T:
- Leave Job Title blank (required field)
- Leave Company Name blank (required field)
- Use vague skill names like "stuff" or "various"
- Submit without reviewing the generated content
- Copy the letter without personalizing it

### 💡 PRO TIPS:
1. **Copy the full job posting** into the job description field for AI to pick up nuances
2. **Use specific metrics**: Instead of "improved performance", use "optimized load time by 40%"
3. **Mention technologies**: List exact tools/frameworks you've used
4. **Test multiple versions**: Generate multiple letters with different skill emphasis
5. **Keep experience concise**: "5+ years in full-stack development" works better than long paragraphs

---

## Troubleshooting

### ❌ "OpenAI API key is not configured"
- **Cause**: .env file not set up properly
- **Fix**: Ensure `OPENAI_API_KEY=sk-...` exists in `.env` file
- **Location**: Root of project directory

### ❌ Button is disabled/grayed out
- **Cause**: Missing required fields
- **Fix**: Fill in Job Title and Company Name

### ❌ Letter not updating
- **Cause**: Page not refreshed after changes
- **Fix**: Wait a moment, then refresh the page (F5)

### ❌ Slow generation
- **Cause**: OpenAI API taking longer
- **Fix**: Normal. Can take 5-10 seconds during peak times

### ❌ Generated letter is too generic
- **Cause**: Job description not detailed enough
- **Fix**: Paste full job posting from the job board

---

## Output Quality Checklist

After generation, verify your letter has:

- ✅ Professional greeting ("Dear Hiring Manager" or specific name)
- ✅ Enthusiasm for the role
- ✅ Mention of your key skills
- ✅ Specific mention of the company
- ✅ Your years of experience highlighted
- ✅ Professional closing ("Sincerely" or "Warm regards")
- ✅ Proper paragraph structure
- ✅ No obvious AI artifacts or repetition
- ✅ Personalization placeholders for your details

---

## Customization After Generation

The generated letter is a **starting point**. You can:

1. **Add personal details**: Replace placeholders with your info
2. **Adjust tone**: Make it more formal or casual
3. **Add experiences**: Insert specific projects you've worked on
4. **Enhance achievements**: Add metrics and results
5. **Fix formatting**: Adjust line breaks and spacing

---

## Data Privacy

- ✅ Your data is only sent to OpenAI API
- ✅ No data is stored on our servers
- ✅ Each session starts fresh
- ✅ Your personal information is never logged
- ✅ Letters are not saved unless you save them

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move between form fields |
| `Ctrl+C` | Copy (when Copy button is clicked) |
| `Ctrl+S` | Save (browser default) |

---

## Getting Help

- **Report Issues**: Check the error message and troubleshooting section above
- **Suggest Features**: Use the feedback form on the About page
- **Ask Questions**: Check the FAQ section

---

## Frequently Asked Questions

**Q: Is this free?**  
A: Yes, completely free! You only need a valid OpenAI API key (which you provide).

**Q: How accurate is the AI?**  
A: GPT-4o-mini is highly capable. Quality depends on input quality. Detailed job descriptions = better letters.

**Q: Can I use this for multiple applications?**  
A: Yes! Generate as many as you need. Change the inputs for different positions.

**Q: Does my data stay private?**  
A: Yes. Data is only sent to OpenAI's API and not stored on our servers.

**Q: Can I edit the generated letter?**  
A: Yes! Download it and edit it in any text editor before submitting.

**Q: How long does generation take?**  
A: Typically 3-5 seconds. Sometimes up to 10 seconds depending on OpenAI's load.

---

## Best Practice Workflow

```
1. Find the job posting
2. Copy the full job description
3. Come to the Cover Letter tool
4. Enter Job Title
5. Enter Company Name
6. Enter your years of experience
7. List your relevant skills
8. Paste the job description
9. Watch the Form Summary update in real-time
10. Review all fields in the preview
11. Click Generate
12. Review the generated letter
13. Copy or Download
14. Personalize with your details
15. Submit with confidence!
```

---

**Last Updated**: March 28, 2026  
**Tool Version**: 2.0 Enhanced Preview  
**Status**: ✅ Production Ready
