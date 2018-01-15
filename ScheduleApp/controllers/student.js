router.route('/students/courses/:roseID')
.get((req, res) => {
    Student.find({ "courses.roseID": req.params.roseID }, (err, students) => {
        if (err) {
            res.statusCode = 404;
            err.status = 404;
            res.json(err);
        } else {
            res.json(students);
        }
    });
});

router.route('/students/courses/:roseID/notTaken')
.get((req, res) => {
    Student.find({ "courses.roseID": {$ne: req.params.roseID }}, (err, students) => {
        if (err) {
            res.statusCode = 404;
            err.status = 404;
            res.json(err);
        } else {
            res.json(students);
        }
    });
});