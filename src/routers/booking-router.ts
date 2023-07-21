import { Router } from "express";
import { authenticateToken } from "../middlewares";
import bookingController from "../controllers/booking-controller";

const bookingRouter = Router();

bookingRouter.get('/', authenticateToken, bookingController.getBooking);
bookingRouter.post('/', authenticateToken, bookingController.createBooking);
bookingRouter.put('/:bookingId', authenticateToken, bookingController.updateBooking);

export { bookingRouter };