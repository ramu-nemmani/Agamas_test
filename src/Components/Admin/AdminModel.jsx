import { Box, Button, Modal, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function AdminModal() {
  const navigate = useNavigate();

  return (
    <Modal
      open={true}
      onClose={() => navigate("/admin")}
      aria-labelledby="modal-message"
      aria-describedby="modal-close-button"
    >
      <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-[90%] max-w-md md:max-w-lg">
        <Typography
          id="modal-message"
          variant="h6"
          component="h2"
          className="text-center text-gray-800 font-semibold mb-6"
        >
          Your admin access is not yet verified. Verification may take a few
          minutes. You will receive an email once your access is approved.
        </Typography>
        <div className="flex justify-center">
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
            onClick={() => navigate("/admin")}
          >
            Dismiss
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

export default AdminModal;
