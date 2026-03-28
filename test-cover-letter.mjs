import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testCoverLetterGeneration() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log('✅ API Key loaded successfully');
  console.log(`🔑 Key (masked): ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`);
  console.log('\n---\n');

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    console.log('🚀 Generating cover letter...\n');

    const prompt = `Generate a professional cover letter for the following position:
    Job Title: Senior Frontend Developer
    Company: Tech Innovations Inc.
    Job Description: We are looking for an experienced Frontend Developer with 5+ years of experience in React, TypeScript, and modern web development. The ideal candidate will lead our frontend team and mentor junior developers.
    Years of Experience: 5
    Key Skills: React, TypeScript, Node.js, REST APIs, Responsive Design, Performance Optimization
    
    The cover letter should be professional, persuasive, and tailored to the job description. 
    Format it clearly with placeholders for personal contact information.
    Start with a strong opening that shows enthusiasm for the role.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const coverLetter = response.choices[0].message.content;

    console.log('📄 Generated Cover Letter:\n');
    console.log('---');
    console.log(coverLetter);
    console.log('---\n');

    // Verify it's professional
    const professionalIndicators = [
      coverLetter.toLowerCase().includes('dear'),
      coverLetter.toLowerCase().includes('sincerely') || coverLetter.toLowerCase().includes('best regards'),
      coverLetter.length > 300,
      coverLetter.includes('\n')
    ];

    const professionalScore = professionalIndicators.filter(Boolean).length / professionalIndicators.length * 100;

    console.log('✅ Cover Letter Quality Assessment:');
    console.log(`📊 Professional Score: ${professionalScore.toFixed(0)}%`);
    console.log(`📝 Length: ${coverLetter.length} characters`);
    console.log(`✓ Has greeting: ${professionalIndicators[0] ? 'Yes' : 'No'}`);
    console.log(`✓ Has closing: ${professionalIndicators[1] ? 'Yes' : 'No'}`);
    console.log(`✓ Adequate length: ${professionalIndicators[2] ? 'Yes' : 'No'}`);
    console.log(`✓ Formatted with paragraphs: ${professionalIndicators[3] ? 'Yes' : 'No'}`);

    if (professionalScore >= 75) {
      console.log('\n✅ SUCCESS: Cover letter generation is working professionally!');
    } else {
      console.log('\n⚠️ WARNING: Cover letter may need quality improvements');
    }

  } catch (error) {
    console.error('❌ Error generating cover letter:');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testCoverLetterGeneration();
