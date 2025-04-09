const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils/fileUtils');



router.post('/register', async (req, res) => { // Register student to a course
    const { studentId, courseId, instructorId } = req.body;

    const users = await readJSON('users.json');
    const courses = await readJSON('courses.json');
    const classes = await readJSON('classes.json');

    const student = users.find(u => u.id === studentId && u.type === 'student');
    const course = courses.find(c => c.id === courseId);
    const classEntry = classes.find(cls => cls.course_id === courseId && cls.instructor_id === instructorId);

    if (!student || !course || !classEntry) {
        return res.status(404).json({ message: "Invalid data." });
    }


    // Check prerequisites
    const completedIds = student.completed_courses.filter(c => c.grade >= 50).map(c => c.course_id);
    const hasPrereqs = course.prerequisites.every(p => completedIds.includes(p));
    if (!hasPrereqs) return res.status(400).json({ message: "Missing prerequisites." });


    // Registration open?
    if (!course.open_for_registration) {
        return res.status(400).json({ message: "Registration is closed." });
    }


    // Check class capacity
    if (classEntry.enrolled_students.length >= classEntry.capacity) {
        return res.status(400).json({ message: "Class is full." });
    }


    // Register student (pending approval)
    if (!classEntry.pending_students.includes(studentId)) {
        classEntry.pending_students.push(studentId);
        await writeJSON('classes.json', classes);
    }


    res.json({ message: "Registration submitted for approval." });
});

//case 4
// View learning path
router.get('/learning-path/:studentId', async (req, res) => {
    const studentId = req.params.studentId;

    const users = await readJSON('users.json');
    const classes = await readJSON('classes.json');

    const student = users.find(u => u.id === studentId && u.type === 'student');
    if (!student) return res.status(404).json({ message: "Student not found." });

    const completed = student.completed_courses;

    const inProgress = [];
    const pending = [];

    for (const cls of classes) {
        if (cls.enrolled_students.includes(studentId)) {
            inProgress.push(cls.course_id);
        } else if (cls.pending_students.includes(studentId)) {
            pending.push(cls.course_id);
        }
    }

    res.json({
        completed_courses: completed,
        in_progress_courses: inProgress,
        pending_courses: pending
    });
});
