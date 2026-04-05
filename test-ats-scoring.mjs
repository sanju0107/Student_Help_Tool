#!/usr/bin/env node

/**
 * Test the new rule-based ATS Scoring Engine
 */

import { performATSAnalysis } from './src/lib/atsScoring.ts';

// Sample resume
const sampleResume = `
JOHN DOE
Email: john.doe@email.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced Full-Stack Software Engineer with 5+ years of expertise developing scalable web applications using React, Node.js, and cloud technologies. Proven track record of leading high-impact projects and mentoring junior developers.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, C#
Frontend: React, Vue.js, Angular, HTML5, CSS3, Webpack
Backend: Node.js, Express, Django, Spring Boot, ASP.NET
Databases: PostgreSQL, MongoDB, MySQL, Redis
Cloud & DevOps: AWS (EC2, S3, Lambda), Azure, Docker, Kubernetes, Jenkins, GitHub Actions
Tools & Other: Git, GitHub, JIRA, Figma, Postman, REST APIs, GraphQL

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2022 - Present
• Led development of microservices architecture using Node.js and Docker, improving system scalability by 40%
• Architected and implemented real-time data dashboard processing 500K+ daily transactions
• Mentored team of 5 junior developers, conducting code reviews and knowledge-sharing sessions
• Optimized database queries reducing page load time from 5s to 1.2s, improving user engagement by 35%

Full Stack Developer | StartupXYZ | Jun 2019 - Dec 2021
• Developed React-based admin dashboard with Redux state management for 10+ concurrent users
• Built RESTful API service using Express and MongoDB handling 1M+ monthly API calls
• Implemented CI/CD pipeline using GitHub Actions, reducing deployment time by 60%
• Collaborated with cross-functional teams to deliver features on schedule
• Automated testing suite increased code coverage from 45% to 85%

Junior Developer | WebDev Solutions | Jan 2019 - May 2019
• Developed responsive web interfaces using React and Sass
• Maintained and fixed bugs in legacy Python codebase
• Wrote unit tests using Jest and React Testing Library

EDUCATION
Bachelor of Science in Computer Science | State University | 2019
GPA: 3.8/4.0, Dean's List

PROJECTS & ACHIEVEMENTS
• E-commerce Platform: Led full-stack development of multi-vendor platform handling \$2M+ in annual sales
• Real-time Analytics Dashboard: Built real-time dashboard processing 500K+ events daily with WebSocket
• Open Source Contributions: Maintained popular React utility library with 5K+ GitHub stars

CERTIFICATIONS
AWS Certified Solutions Architect - Associate (2021)
JavaScript Developer Certification (2020)
`;

// Sample job description
const jobDescription = `
Senior Software Engineer

Company: TechCorp
Location: San Francisco, CA

We're looking for an experienced Senior Software Engineer to join our platform team.

Requirements:
- 5+ years of professional development experience
- Strong expertise with React or Vue.js
- Backend experience with Node.js, Python, or Java
- Cloud platform experience (AWS or Azure)
- Docker and Kubernetes knowledge
- SQL database proficiency
- CI/CD pipeline experience
- Leadership and mentoring capabilities
- Strong communication skills
- BS in Computer Science or equivalent

Nice to have:
- Microservices architecture experience
- GraphQL knowledge
- Open source contributions
- AWS certifications
`;

console.log('═'.repeat(70));
console.log('ATS SCORING ENGINE - RULE-BASED ANALYSIS');
console.log('═'.repeat(70));

// Perform analysis
const result = performATSAnalysis(sampleResume, jobDescription);

console.log('\n📊 OVERALL SCORE');
console.log('─'.repeat(70));
console.log(`Total Score: ${result.totalScore}/100`);
console.log(`Category: ${result.scoreCategory}`);

console.log('\n📈 SCORE BREAKDOWN');
console.log('─'.repeat(70));
console.log(`Keyword Match:      ${result.breakdown.keywordScore}/30`);
console.log(`Skills Match:       ${result.breakdown.skillsScore}/20`);
console.log(`Experience Quality: ${result.breakdown.experienceScore}/15`);
console.log(`Action Verbs:       ${result.breakdown.actionScore}/10`);
console.log(`Section Complete:   ${result.breakdown.sectionScore}/10`);
console.log(`Formatting:         ${result.breakdown.formattingScore}/10`);
console.log(`Readability:        ${result.breakdown.readabilityScore}/5`);

console.log('\n✅ MATCHED KEYWORDS');
console.log('─'.repeat(70));
console.log(result.matchedKeywords.slice(0, 10).join(', '));

console.log('\n❌ MISSING KEYWORDS');
console.log('─'.repeat(70));
console.log(result.missingKeywords.slice(0, 10).join(', '));

console.log('\n💪 STRENGTHS');
console.log('─'.repeat(70));
result.strengths.forEach((s, i) => {
  console.log(`${i + 1}. ${s}`);
});

console.log('\n⚠️  WEAKNESSES');
console.log('─'.repeat(70));
result.weaknesses.forEach((w, i) => {
  console.log(`${i + 1}. ${w}`);
});

console.log('\n🔧 TOP FIXES');
console.log('─'.repeat(70));
result.topFixes.forEach((fix, i) => {
  console.log(
    `${i + 1}. [${fix.priority.toUpperCase()}] ${fix.title}`
  );
  console.log(`   ${fix.description}`);
  console.log(`   Impact: ${fix.impact}`);
  console.log();
});

console.log('\n💡 SUGGESTIONS');
console.log('─'.repeat(70));
result.suggestions.forEach((s, i) => {
  console.log(`${i + 1}. ${s}`);
});

console.log('\n' + '═'.repeat(70));
console.log('✨ Analysis Complete');
console.log('═'.repeat(70) + '\n');
