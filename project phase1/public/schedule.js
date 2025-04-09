fetch('/admin/schedule')
  .then(res => res.json())
  .then(data => {
    const tableBody = document.querySelector('#scheduleTable tbody');
    tableBody.innerHTML = '';
    data.schedule.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.course_name}</td>
        <td>${item.instructor_name}</td>
        <td>${item.day}</td>
        <td>${item.time}</td>
      `;
      tableBody.appendChild(row);
    });
  })
  .catch(err => {
    console.error('Failed to load schedule:', err);
  });
