var gulp = require('gulp');
var vulcanize = require('gulp-vulcanize');

gulp.task('vulcanize', function() {
  return gulp.src('client/elements/elements.html')
    .pipe(vulcanize())
    .pipe(gulp.dest('client/dist'));
});

gulp.task('default', ['vulcanize']);