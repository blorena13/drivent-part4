import { forbiddenError, notFoundError } from "../../errors";
import bookingRepository from "../../repositories/booking-repository";

async function getBooking(userId: number){
    const booking = await bookingRepository.getBooking(userId);
    if(!booking){
       throw notFoundError();
    }
    return booking;
}

async function createBooking(userId: number,roomId: number){
    const checkCreateBooking = await bookingRepository.findUserToCreateBooking(userId);
    if(!checkCreateBooking){
        throw forbiddenError();
    }
    
    const booking = await bookingRepository.createBooking(userId, roomId);
    return booking;
}

async function updateBooking(id: number, userId: number, roomId: number){
    const booking = await bookingRepository.updateBooking(id, userId, roomId);
    return booking;
}

const bookingService = {
    getBooking,
    createBooking,
    updateBooking
}

export default bookingService;