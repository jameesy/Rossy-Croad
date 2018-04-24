var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default',function(){
    console.log('Gulp test');
})

gulp.task('style', function(){
    gulp.src('sass/**/*.scss')
        .pipe(sass()).on('error', sass.logError)
        .pipe(gulp.dest('./css'))
});