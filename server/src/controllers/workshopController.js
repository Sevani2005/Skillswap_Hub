import Workshop from '../models/Workshop.js';

// @desc    Create a new workshop
// @route   POST /api/workshops
// @access  Private
export const createWorkshop = async (req, res, next) => {
  try {
    const { title, description, skillCategory, maxAttendees, date, duration, meetLink } = req.body;

    const workshop = await Workshop.create({
      title,
      description,
      skillCategory,
      host: req.user._id,
      maxAttendees,
      date,
      duration,
      meetLink
    });

    res.status(201).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workshops
// @route   GET /api/workshops
// @access  Private
export const getWorkshops = async (req, res, next) => {
  try {
    const workshops = await Workshop.find({ status: 'scheduled' })
      .populate('host', 'name avatar')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: workshops.length, data: workshops });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single workshop
// @route   GET /api/workshops/:id
// @access  Private
export const getWorkshopById = async (req, res, next) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('host', 'name avatar bio')
      .populate('attendees', 'name avatar');

    if (!workshop) {
      res.status(404);
      throw new Error('Workshop not found');
    }

    res.status(200).json({ success: true, data: workshop });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a workshop
// @route   POST /api/workshops/:id/join
// @access  Private
export const joinWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      res.status(404);
      throw new Error('Workshop not found');
    }

    if (workshop.host.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot join your own workshop');
    }

    if (workshop.attendees.includes(req.user._id)) {
      res.status(400);
      throw new Error('You have already joined this workshop');
    }

    if (workshop.attendees.length >= workshop.maxAttendees) {
      res.status(400);
      throw new Error('This workshop is already full');
    }

    workshop.attendees.push(req.user._id);
    await workshop.save();

    res.status(200).json({ success: true, message: 'Joined workshop successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave a workshop
// @route   POST /api/workshops/:id/leave
// @access  Private
export const leaveWorkshop = async (req, res, next) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      res.status(404);
      throw new Error('Workshop not found');
    }

    if (!workshop.attendees.includes(req.user._id)) {
      res.status(400);
      throw new Error('You are not attending this workshop');
    }

    workshop.attendees = workshop.attendees.filter(
      (attendeeId) => attendeeId.toString() !== req.user._id.toString()
    );
    await workshop.save();

    res.status(200).json({ success: true, message: 'Left workshop successfully' });
  } catch (error) {
    next(error);
  }
};
