const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImagetoCloudinary } = require("../utils/cloudinaryAssetsHandlers");
require('dotenv').config();

// Create Sub Section
exports.createSubSection = async (req, res) => {
    try {
        // Fetching Data 
        const { sub_section_name, section_id, sub_section_desc, duration } = req.body;
        const video = req.files.videoFile;

        // Validating Data
        if (!sub_section_name || !section_id || !sub_section_desc || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Missing required properties'
            });
        }

        if(! await Section.findById(section_id)){
            return res.status(400).json({
                success: false,
                message: 'Invalid Section Id'
            });
        }

        // Upload video cloudinary
        const videoUrl = await uploadImagetoCloudinary(video, process.env.FOLDER_NAME)

        // create section
        const subSection = await SubSection.create({
            sub_section_name,
            sub_section_desc,
            duration,
            video: videoUrl.secure_url,
        })

        // update sections subsection field
        const section = await Section.findByIdAndUpdate({ _id: section_id }, {
            $push: { sub_section: subSection._id }
        }, { new: true }).populate("sub_section")
        
        //return updated section object in response
        return res.status(200).json({
            success: true,
            message: 'Sub Section Created Successfully',
            subSection,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

// Update Section
exports.updateSubSection = async (req, res) => {
    try {
        // Getting data from requesting
        const { sub_section_name, sub_section_id, sub_section_desc } = req.body;

        // Validating Data
        if (!sub_section_name || !sub_section_id || !sub_section_desc) {
            return res.status(400).json({
                success: false,
                message: 'Missing Properties'
            });
        }

        // update sub-section
        const subSection = await SubSection.findByIdAndUpdate(sub_section_id, { sub_section_name, sub_section_desc },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: subSection,
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to Update Sub-Section, please try again',
            error: error.message,
        })
    }
}

// Delete Section
exports.deleteSubSection = async (req, res) => {
    try {
        const {sub_section_id} = req.body
        console.log(sub_section_id)
        // Validating  Data
        if (!sub_section_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing Properties'
            });
        }

        // Delete
        await SubSection.findByIdAndDelete(sub_section_id);

        return res.status(200).json({
            success: true,
            message: 'Sub Section deleted successfully',
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Deleting the SubSection",
        })
    }
}

