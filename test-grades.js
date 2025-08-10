// Quick test script to check grades API response
fetch('http://localhost:3001/api/canvas/grades')
  .then(response => response.json())
  .then(data => {
    console.log('Grades API Response:');
    console.log('Total grades:', data.grades?.length || 0);
    
    if (data.grades && data.grades.length > 0) {
      console.log('\nFirst 5 grades with course names:');
      data.grades.slice(0, 5).forEach((grade, index) => {
        console.log(`${index + 1}. ${grade.assignment_name} - Course: "${grade.course_name}" (ID: ${grade.course_id})`);
      });
      
      const unknownCourses = data.grades.filter(grade => 
        grade.course_name === 'Unknown Course' || 
        grade.course_name.toLowerCase().includes('unknown')
      );
      
      console.log(`\nUnknown courses: ${unknownCourses.length}/${data.grades.length}`);
      
      if (unknownCourses.length > 0) {
        console.log('Sample unknown courses:');
        unknownCourses.slice(0, 3).forEach((grade, index) => {
          console.log(`  ${index + 1}. ${grade.assignment_name} - Course: "${grade.course_name}" (ID: ${grade.course_id})`);
        });
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
