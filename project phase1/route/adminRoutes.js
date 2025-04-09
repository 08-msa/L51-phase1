const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../files/files');
router.post('/express-interest', async (req, res) => {
  const { instructorId, courseId } = req.body;
  const users = await readJSON('users.json');
  const instructor = users.find(u => u.id === instructorId && u.type === 'instructor');
  if (!instructor) return res.status(404).json({ message: "no instructor" });
  if (!instructor.interested_courses.includes(courseId)) {
    instructor.interested_courses.push(courseId);
    await writeJSON('users.json', users);
  }
  res.json({ message: "Done" });
});

router.post('/assign-instructor', async (req, res) => {
  const { instructorId, courseId } = req.body;
  const users = await readJSON('users.json');
  const instructor = users.find(u => u.id === instructorId && u.type === 'instructor');
  if (!instructor || !instructor.interested_courses.includes(courseId)) {
    return res.status(400).json({ message: "there is no interest" });
  }
  const classes = await readJSON('classes.json');
  const newClass = {
    course_id: courseId,
    instructor_id: instructorId,
    enrolled_students: [],
    pending_students: [],
    capacity: 30,
    validated: false
  };
  classes.push(newClass);
  await writeJSON('classes.json', classes);
  res.json({ message: "instructor and class created" });
});

module.exports = router;

router.get('/schedule', async (req, res) => {
  const classes = await readJSON('classes.json');
  const courses = await readJSON('courses.json');
  const users = await readJSON('users.json');
  const activeClasses = classes.filter(cls => cls.enrolled_students.length > 0);
  const schedule = activeClasses.map(cls => {
    const course = courses.find(c => c.id === cls.course_id);
    const instructor = users.find(u => u.id === cls.instructor_id);
    return {
      course_id: cls.course_id,
      course_name: course?.name || "undefined",
      instructor_name: instructor?.name || "undefined",
      day: cls.schedule?.day || "undefined",
      time: cls.schedule?.time || "undefined"
    };
  });

  res.json({ schedule });
});

