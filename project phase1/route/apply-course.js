app.post('/apply-course', (req, res) => {
    const { courseCode } = req.body;
    const studentId = req.session.userId; // assuming student is logged in and userId is stored in session
  
    if (!studentId) {
      return res.status(401).json({ message: 'Not logged in' });
    }
  
    const coursesFile = path.join(__dirname, 'public/data/courses.json');
    const classesFile = path.join(__dirname, 'public/data/classes.json');
    const studentsFile = path.join(__dirname, 'public/data/students.json');
  
    try {
      const courses = JSON.parse(fs.readFileSync(coursesFile, 'utf8'));
      const classes = JSON.parse(fs.readFileSync(classesFile, 'utf8'));
      const students = JSON.parse(fs.readFileSync(studentsFile, 'utf8'));
  
      const student = students.find(s => s.id === studentId);
      const course = courses.find(c => c.code === courseCode);
      const classInfo = classes.find(cls => cls.course_id === courseCode && cls.instructor_id === course?.instructorId);
  
      if (!student || !course || !classInfo) {
        return res.status(404).json({ message: 'Course or student not found' });
      }
  
      // Check if already enrolled or pending
      if (classInfo.enrolled_students.includes(studentId) || classInfo.pending_students.includes(studentId)) {
        return res.status(400).json({ message: 'Already enrolled or applied' });
      }
  
      // Check prerequisites
      const hasAllPrereqs = course.prerequisites.every(prereq =>
        student.completedCourses?.includes(prereq)
      );
      if (!hasAllPrereqs) {
        return res.status(400).json({ message: 'Missing prerequisites' });
      }
  
      // Check course status
      if (course.status !== 'active') {
        return res.status(400).json({ message: 'Course is not open' });
      }
  
      // Check capacity
      if (classInfo.enrolled_students.length >= classInfo.capacity) {
        return res.status(400).json({ message: 'Course is full' });
      }
  
      // Add to pending
      classInfo.pending_students.push(studentId);
      fs.writeFileSync(classesFile, JSON.stringify(classes, null, 2));
  
      return res.json({ message: 'Applied successfully. Awaiting admin approval.' });
    } catch (err) {
      console.error('Error applying to course:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  