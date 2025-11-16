const Hackathon = require('../models/Hackathon');
const User = require('../models/User');

// @desc    Get all hackathons
// @route   GET /api/hackathons
// @access  Public
const getHackathons = async (req, res) => {
    try {
        const { category, status, sort, page = 1, limit = 10 } = req.query;
        
        // Build query
        let query = {};
        
        if (category) {
            query.categories = { $in: [category] };
        }
        
        if (status) {
            query.status = status;
        }
        
        // Only show active hackathons unless specified
        if (!status) {
            query.isActive = true;
        }
        
        // Build sort object
        let sortOptions = {};
        if (sort) {
            switch (sort) {
                case 'newest':
                    sortOptions = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortOptions = { createdAt: 1 };
                    break;
                case 'prize':
                    sortOptions = { prizePool: -1 };
                    break;
                case 'deadline':
                    sortOptions = { registrationDeadline: 1 };
                    break;
                default:
                    sortOptions = { createdAt: -1 };
            }
        } else {
            sortOptions = { createdAt: -1 };
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        // Execute query
        const hackathons = await Hackathon.find(query)
            .populate('organizer', 'name email')
            .populate('participants', 'name email college')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));
        
        // Update status for each hackathon based on dates
        const now = new Date();
        const updatedHackathons = hackathons.map(hackathon => {
            // Calculate current status
            let currentStatus = hackathon.status;
            
            if (hackathon.status !== 'cancelled') {
                if (hackathon.endDate && new Date(hackathon.endDate) < now) {
                    currentStatus = 'completed';
                } else if (hackathon.startDate && new Date(hackathon.startDate) <= now && hackathon.endDate && new Date(hackathon.endDate) >= now) {
                    currentStatus = 'ongoing';
                } else {
                    currentStatus = 'upcoming';
                }
                
                // Update in database if status changed (async, don't wait)
                if (currentStatus !== hackathon.status) {
                    Hackathon.findByIdAndUpdate(hackathon._id, { status: currentStatus }, { new: false }).catch(err => {
                        console.error('Error updating hackathon status:', err);
                    });
                }
            }
            
            // Convert to plain object and update status
            const hackathonObj = hackathon.toObject();
            hackathonObj.status = currentStatus;
            return hackathonObj;
        });
        
        // Get total count for pagination
        const total = await Hackathon.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'Hackathons fetched successfully',
            count: updatedHackathons.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: updatedHackathons
        });
        
    } catch (error) {
        console.error('Get hackathons error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hackathons',
            error: error.message
        });
    }
};

// @desc    Get single hackathon
// @route   GET /api/hackathons/:id
// @access  Public
const getHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('participants', 'name email college skills');
        
        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found',
                data: null
            });
        }
        
        // Update status based on dates
        const now = new Date();
        let currentStatus = hackathon.status;
        
        if (hackathon.status !== 'cancelled') {
            if (hackathon.endDate && new Date(hackathon.endDate) < now) {
                currentStatus = 'completed';
            } else if (hackathon.startDate && new Date(hackathon.startDate) <= now && hackathon.endDate && new Date(hackathon.endDate) >= now) {
                currentStatus = 'ongoing';
            } else {
                currentStatus = 'upcoming';
            }
            
            // Update in database if status changed
            if (currentStatus !== hackathon.status) {
                await Hackathon.findByIdAndUpdate(hackathon._id, { status: currentStatus });
            }
        }
        
        // Convert to plain object and update status
        const hackathonObj = hackathon.toObject();
        hackathonObj.status = currentStatus;
        
        res.status(200).json({
            success: true,
            message: 'Hackathon fetched successfully',
            data: hackathonObj
        });
        
    } catch (error) {
        console.error('Get hackathon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hackathon',
            error: error.message
        });
    }
};

// @desc    Create new hackathon
// @route   POST /api/hackathons
// @access  Private (Admin only)
const createHackathon = async (req, res) => {
    try {
        // Authorization check - Only admin or organizer can create hackathons
        if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create hackathon. Admin or organizer role required.',
                data: null
            });
        }
        
        // Add organizer to request body
        req.body.organizer = req.user.id;
        
        // Validate dates
        const { startDate, endDate, registrationDeadline } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const regDeadline = new Date(registrationDeadline);
        const now = new Date();
        
        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date',
                data: null
            });
        }
        
        if (regDeadline >= start) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be before start date',
                data: null
            });
        }
        
        if (regDeadline <= now) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be in the future',
                data: null
            });
        }
        
        const hackathon = await Hackathon.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Hackathon created successfully',
            data: hackathon
        });
        
    } catch (error) {
        console.error('Create hackathon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating hackathon',
            error: error.message,
            data: null
        });
    }
};

// @desc    Update hackathon
// @route   PUT /api/hackathons/:id
// @access  Private (Admin/Organizer only)
const updateHackathon = async (req, res) => {
    try {
        let hackathon = await Hackathon.findById(req.params.id);
        
        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found',
                data: null
            });
        }
        
        // Check if user is organizer or admin
        if (hackathon.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this hackathon',
                data: null
            });
        }
        
        hackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('organizer', 'name email');
        
        res.status(200).json({
            success: true,
            message: 'Hackathon updated successfully',
            data: hackathon
        });
        
    } catch (error) {
        console.error('Update hackathon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating hackathon',
            error: error.message,
            data: null
        });
    }
};

// @desc    Delete hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private (Admin/Organizer only)
const deleteHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        
        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found',
                data: null
            });
        }
        
        // Check if user is organizer or admin
        if (hackathon.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this hackathon',
                data: null
            });
        }
        
        await hackathon.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Hackathon deleted successfully',
            data: null
        });
        
    } catch (error) {
        console.error('Delete hackathon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting hackathon',
            error: error.message,
            data: null
        });
    }
};

// @desc    Register for hackathon
// @route   POST /api/hackathons/:id/register
// @access  Private (Participants)
const registerForHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        
        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found',
                data: null
            });
        }
        
        // Additional validation - Check if hackathon is full
        if (hackathon.participants.length >= hackathon.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Hackathon is full. Registration capacity exceeded.',
                data: {
                    currentParticipants: hackathon.participants.length,
                    maxParticipants: hackathon.maxParticipants
                }
            });
        }
        
        // Check if registration deadline has passed
        const now = new Date();
        if (now > hackathon.registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed',
                data: {
                    deadline: hackathon.registrationDeadline,
                    currentTime: now
                }
            });
        }
        
        // Check if hackathon is active
        if (!hackathon.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This hackathon is not active',
                data: null
            });
        }
        
        // Check if user already registered
        if (hackathon.participants.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this hackathon',
                data: null
            });
        }
        
        // Add user to participants
        hackathon.participants.push(req.user.id);
        await hackathon.save();
        
        res.status(200).json({
            success: true,
            message: 'Successfully registered for hackathon',
            data: {
                hackathonId: hackathon._id,
                hackathonTitle: hackathon.title,
                registrationCount: hackathon.participants.length,
                spotsRemaining: hackathon.maxParticipants - hackathon.participants.length,
                registrationDeadline: hackathon.registrationDeadline
            }
        });
        
    } catch (error) {
        console.error('Register hackathon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering for hackathon',
            error: error.message,
            data: null
        });
    }
};

// @desc    Unregister from hackathon
// @route   DELETE /api/hackathons/:id/register
// @access  Private (Participants)
const unregisterFromHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        
        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found',
                data: null
            });
        }
        
        // Check if user is registered
        if (!hackathon.participants.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this hackathon',
                data: null
            });
        }
        
        // Check if hackathon has already started
        const now = new Date();
        if (now >= hackathon.startDate) {
            return res.status(400).json({
                success: false,
                message: 'Cannot unregister after hackathon has started',
                data: {
                    hackathonStarted: hackathon.startDate,
                    currentTime: now
                }
            });
        }
        
        // Remove user from participants
        hackathon.participants = hackathon.participants.filter(
            participant => participant.toString() !== req.user.id
        );
        await hackathon.save();
        
        res.status(200).json({
            success: true,
            message: 'Successfully unregistered from hackathon',
            data: {
                hackathonId: hackathon._id,
                hackathonTitle: hackathon.title,
                remainingParticipants: hackathon.participants.length
            }
        });
        
    } catch (error) {
        console.error('Unregister hackathon error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unregistering from hackathon',
            error: error.message,
            data: null
        });
    }
};

module.exports = {
    getHackathons,
    getHackathon,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    registerForHackathon,
    unregisterFromHackathon
};
