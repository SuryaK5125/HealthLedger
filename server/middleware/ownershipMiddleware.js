const mongoose = require("mongoose");
const Profile = require("../models/Profile");

// Resources the caller does not own are reported as 404, not 403. A 403 would
// confirm the id exists, letting an attacker enumerate other users' records.
const NOT_FOUND = { message: "Not found" };

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Child resources carry profileId in the params, body or query depending on
// whether the route is nested, a create, or a list.
function resolveProfileId(req) {
  return req.params.profileId || req.body.profileId || req.query.profileId;
}

// For routes acting on a profile directly: /api/profiles/:id
async function loadOwnedProfile(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid profile id" });
    }

    const profile = await Profile.findById(id);
    if (!profile || profile.userId.toString() !== req.userId) {
      return res.status(404).json(NOT_FOUND);
    }

    req.profile = profile;
    return next();
  } catch (err) {
    return next(err);
  }
}

// For child routes that name a profile: create/list medications, records, appointments.
async function requireProfileAccess(req, res, next) {
  try {
    const profileId = resolveProfileId(req);
    if (!profileId) {
      return res.status(400).json({ message: "profileId is required" });
    }
    if (!isValidObjectId(profileId)) {
      return res.status(400).json({ message: "Invalid profile id" });
    }

    const profile = await Profile.findById(profileId);
    if (!profile || profile.userId.toString() !== req.userId) {
      return res.status(404).json(NOT_FOUND);
    }

    req.profile = profile;
    return next();
  } catch (err) {
    return next(err);
  }
}

// For routes acting on an existing child resource by its own id:
// /api/medications/:id, /api/records/:id, /api/appointments/:id.
// Ownership is reached in one hop: resource -> profile -> user.
function requireResourceOwnership(Model) {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid id" });
      }

      const resource = await Model.findById(id);
      if (!resource) {
        return res.status(404).json(NOT_FOUND);
      }

      const profile = await Profile.findById(resource.profileId);
      if (!profile || profile.userId.toString() !== req.userId) {
        return res.status(404).json(NOT_FOUND);
      }

      req.resource = resource;
      req.profile = profile;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = {
  loadOwnedProfile,
  requireProfileAccess,
  requireResourceOwnership,
  isValidObjectId,
};
