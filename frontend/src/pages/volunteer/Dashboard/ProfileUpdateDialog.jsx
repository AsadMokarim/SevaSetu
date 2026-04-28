import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";

export default function ProfileUpdateDialog({ open, onClose, volunteer, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    skills: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (volunteer) {
      setFormData({
        name: volunteer.name || "",
        location: volunteer.location || "",
        skills: Array.isArray(volunteer.skills) ? volunteer.skills.join(", ") : (volunteer.skills || "")
      });
    }
  }, [volunteer, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-3 border border-teal-100">
          <PersonOutlineIcon sx={{ fontSize: 32 }} />
        </div>
        <Typography variant="h5" fontWeight="bold">Update Profile</Typography>
        <Typography variant="body2" color="text.secondary">Keep your details up to date</Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 4, pb: 4 }}>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              InputProps={{
                startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: "text.disabled", fontSize: 20 }} />
              }}
            />
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              InputProps={{
                startAdornment: <LocationOnOutlinedIcon sx={{ mr: 1, color: "text.disabled", fontSize: 20 }} />
              }}
            />
            <TextField
              fullWidth
              label="Skills (comma separated)"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              multiline
              rows={2}
              InputProps={{
                startAdornment: <BuildOutlinedIcon sx={{ mr: 1, mt: 1, color: "text.disabled", fontSize: 20 }} />
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button onClick={onClose} sx={{ color: "text.secondary", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              backgroundColor: "#0d9488",
              "&:hover": { backgroundColor: "#0f766e" },
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              borderRadius: 3,
              boxShadow: "none"
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
