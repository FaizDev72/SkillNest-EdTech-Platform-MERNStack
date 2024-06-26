const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");

// create Rating
exports.createRating = async (req, res) => {
    try {
        // fetch data
        const { rating, review, user_id, course_id } = req.body;

        // validating data
        if (!rating || !review || !user_id || !course_id) {
            return res.status(500).json({
                success: false,
                message: 'Missing Values',
            });
        }

        // check if user is enrolled or not
        const courseDetails = await Course.find({
            _id: course_id,
            student_enrolled: { $eleMatch: { $eq: user_id } }
        })

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the course',
            });
        }

        // checking if user has already done comment on same course
        const alreadyRatedTheCourse = await RatingAndReview.find({
            user_id,
            course_id,
        })

        if (alreadyRatedTheCourse) {
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user',
            });
        }

        // create rating
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            user_id,
            course_id,
        })

        // add review id to course->review$rating
        await Course.findByIdAndUpdate(
            course_id,
            {
                $push:
                    { rating_review: ratingReview._id }
            },
            { new: true }
        );

        // return
        return res.status(200).json({
            success: true,
            message: 'Rating and Reviews created successfully',
            ratingReview,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get average rating
exports.getAverageRating = async (req, res) => {
    try {
        // get data from request
        const { course_id } = req.body;

        // calculate average
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course_id: mongoose.Types.ObjectId(course_id)
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "rating" },
                }
            }
        ])

        // return
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }

        // if no rating/review exists
        return res.status(200).json({
            success: true,
            message: 'Average Rating is 0, no rating given till now',
            averageRating: 0,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get all rating and review
exports.getAllRatingReview = async (req, res) => {
    try {
        const allRatingReview = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user_id",
                select: "first_name, last_name, email",
                populate: {
                    path: "profile",
                    select: "image",
                }
            }).populate({
                path: "course_id",
                select: "course_name",
            }).exec();

        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allRatingReview,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
