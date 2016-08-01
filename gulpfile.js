const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const bourbon = require('bourbon')
const changed = require('gulp-changed')

gulp.task('sass', () => {
    return gulp.src('./app/**/*.scss')
        .pipe(changed('./app', { extension: '.css' }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: bourbon.includePaths,
            outputStyle: 'expanded'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./app'))
})