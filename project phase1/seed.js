// seed.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function loadJSON(filename) {
  const data = fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8');
  return JSON.parse(data);
}

async function seed() {
  try {
    console.log('Clearing old data...');
    await prisma.class.deleteMany();
    await prisma.course.deleteMany();
    await prisma.instructor.deleteMany();
    await prisma.student.deleteMany();

    console.log('Loading JSON data...');
    const students = await loadJSON('students.json');
    const instructors = await loadJSON('instructors.json');
    const courses = await loadJSON('courses.json');
    const classes = await loadJSON('classes.json');

    console.log('Seeding instructors...');
    await prisma.instructor.createMany({ data: instructors });

    console.log('Seeding courses...');
    await prisma.course.createMany({ data: courses });

    console.log('Seeding students...');
    await prisma.student.createMany({ data: students });

    console.log('Seeding classes...');
    await prisma.class.createMany({ data: classes });

    console.log('Database has been seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
