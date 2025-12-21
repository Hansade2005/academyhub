const { createJobPosting } = require('../src/lib/database-tools');

// Sample job postings data
const sampleJobs = [
  {
    employerId: 'sample-employer-1',
    title: 'Senior Software Engineer',
    description: 'We are looking for a Senior Software Engineer to join our team. You will be working on cutting-edge technologies and contributing to products that serve millions of users worldwide.',
    requirements: {
      experience: '5+ years',
      education: 'Bachelor\'s degree in Computer Science or related field',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
      location: 'San Francisco, CA',
      salary_range: '$120,000 - $180,000',
      employment_type: 'Full-time'
    }
  },
  {
    employerId: 'sample-employer-2',
    title: 'Data Scientist',
    description: 'Join our data science team to analyze large datasets and build machine learning models that drive business decisions. You\'ll work with state-of-the-art tools and collaborate with cross-functional teams.',
    requirements: {
      experience: '3+ years',
      education: 'Master\'s degree in Data Science, Statistics, or related field',
      skills: ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas'],
      location: 'New York, NY',
      salary_range: '$100,000 - $150,000',
      employment_type: 'Full-time'
    }
  },
  {
    employerId: 'sample-employer-3',
    title: 'UX/UI Designer',
    description: 'We\'re seeking a talented UX/UI Designer to create intuitive and beautiful user experiences. You\'ll work closely with product managers and developers to design interfaces that delight our users.',
    requirements: {
      experience: '3+ years',
      education: 'Bachelor\'s degree in Design, HCI, or related field',
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
      location: 'Remote',
      salary_range: '$80,000 - $120,000',
      employment_type: 'Full-time'
    }
  },
  {
    employerId: 'sample-employer-4',
    title: 'DevOps Engineer',
    description: 'Help us build and maintain scalable infrastructure. You\'ll work with cloud technologies, CI/CD pipelines, and monitoring systems to ensure our applications run smoothly at scale.',
    requirements: {
      experience: '4+ years',
      education: 'Bachelor\'s degree in Computer Science or related field',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Monitoring'],
      location: 'Austin, TX',
      salary_range: '$110,000 - $160,000',
      employment_type: 'Full-time'
    }
  },
  {
    employerId: 'sample-employer-5',
    title: 'Product Manager',
    description: 'Drive product strategy and execution for our core products. You\'ll work with engineering, design, and marketing teams to deliver features that solve real customer problems.',
    requirements: {
      experience: '4+ years',
      education: 'Bachelor\'s degree in Business, Computer Science, or related field',
      skills: ['Product Strategy', 'Analytics', 'Agile', 'SQL', 'A/B Testing'],
      location: 'Seattle, WA',
      salary_range: '$130,000 - $180,000',
      employment_type: 'Full-time'
    }
  }
];

async function addSampleJobs() {
  console.log('Adding sample job postings...');

  for (const job of sampleJobs) {
    try {
      await createJobPosting(job.employerId, job.title, job.description, job.requirements);
      console.log(`✅ Added job: ${job.title}`);
    } catch (error) {
      console.error(`❌ Failed to add job: ${job.title}`, error);
    }
  }

  console.log('Sample job postings added successfully!');
}

// Run the script
addSampleJobs().catch(console.error);