import { projectsRepository } from '../repositories/projects.repository';
import { servicesRepository } from '../repositories/services.repository';
import { PROJECTS_DATA } from '../services/projects.service';
import { SERVICES_DATA } from '../services/services.service';
import { checkDatabaseConnection, getPool } from './index';

async function seed() {
  console.log('🌱 Starting Waliliens Database Seeder...');

  const dbStatus = await checkDatabaseConnection();
  if (!dbStatus.connected) {
    console.error('❌ Database connection failed:', dbStatus.error);
    console.error('Please verify that your DATABASE_URL is configured and PostgreSQL is reachable.');
    process.exit(1);
  }

  console.log('✓ Database connection established.');

  // 1. Seed Projects
  console.log(`\n📦 Seeding ${PROJECTS_DATA.length} Projects...`);
  for (const project of PROJECTS_DATA) {
    await projectsRepository.upsert({
      id: project.id,
      slug: project.id,
      title: project.title,
      client: project.client,
      category: project.category,
      year: project.year,
      tagline: project.tagline,
      description: project.description,
      badge: project.badge || null,
      impactMetrics: project.impactMetrics,
      technologies: project.technologies,
      image: project.image,
      accentColor: project.accentColor,
      featured: project.featured,
      award: project.award || null,
      caseStudy: project.caseStudy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ✓ Seeded project: "${project.title}" (${project.id})`);
  }

  // 2. Seed Services
  console.log(`\n📦 Seeding ${SERVICES_DATA.length} Services...`);
  for (const service of SERVICES_DATA) {
    await servicesRepository.upsert({
      id: service.id,
      slug: service.id,
      num: service.num,
      title: service.title,
      subtitle: service.subtitle,
      description: service.description,
      whoFor: service.whoFor,
      problemSolved: service.problemSolved,
      capabilities: service.capabilities,
      deliverables: service.deliverables,
      icon: service.icon,
      gradient: service.gradient,
      accentColor: service.accentColor,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  ✓ Seeded service: "${service.title}" (${service.id})`);
  }

  console.log('\n✨ Database seeding completed successfully!');
  await getPool().end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
